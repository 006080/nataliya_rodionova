import dotenv from 'dotenv';
import Order from '../Models/Order.js';
import ReminderTask from '../Models/ReminderTask.js';
import { sendPayerActionRequiredEmail } from './emailNotification.js';

dotenv.config({ path: './.env.local' });

// Check interval in milliseconds (every 1 minute)
const CHECK_INTERVAL = 60 * 1000;
let schedulerRunning = false;

/**
 * Schedule payment reminder emails for an order with PAYER_ACTION_REQUIRED status
 * @param {string} orderId - PayPal order ID
 * @returns {Promise<void>}
 */
export const schedulePaymentReminders = async (orderId) => {
  try {
    
    // Check if order exists and has PAYER_ACTION_REQUIRED status
    const order = await Order.findOne({ paypalOrderId: orderId });
    
    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return;
    }
    
    if (order.status !== 'PAYER_ACTION_REQUIRED') {
      return;
    }
    
    // Cancel any existing reminders for this order
    await cancelExistingReminders(orderId);
    
    // Create a frontend URL for the order
    const orderUrl = createOrderUrl(orderId);
    
    // Calculate scheduled times
    const now = new Date();
    const initialReminderTime = new Date(now.getTime() + 1 * 60 * 1000); // 1 minutes from now
    const followupReminderTime = new Date(now.getTime() + 3 * 60 * 1000); // 3 minutes from now
    // const followupReminderTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    // Create initial reminder task
    const initialReminder = new ReminderTask({
      orderId,
      taskType: 'initialReminder',
      scheduledFor: initialReminderTime,
      status: 'pending',
      orderUrl
    });
    await initialReminder.save();
    
    // Create followup reminder task
    const followupReminder = new ReminderTask({
      orderId,
      taskType: 'followupReminder',
      scheduledFor: followupReminderTime,
      status: 'pending',
      orderUrl
    });
    await followupReminder.save();
    
    if (!schedulerRunning) {
      startReminderScheduler();
    }

  } catch (error) {
    console.error(`Error scheduling payment reminders for order ${orderId}:`, error);
  }
};

/**
 * Cancel scheduled payment reminders for an order
 * @param {string} orderId - PayPal order ID
 * @returns {Promise<void>}
 */
export const cancelExistingReminders = async (orderId) => {
  try {
    // Find and update all pending reminders for this order
    const result = await ReminderTask.updateMany(
      { orderId, status: 'pending' },
      { status: 'cancelled' }
    );
    
    console.log(`Cancelled ${result.modifiedCount} existing reminders for order ${orderId}`);
  } catch (error) {
    console.error(`Error cancelling reminders for order ${orderId}:`, error);
  }
};

/**
 * Create a URL to the order page
 * @param {string} orderId - PayPal order ID
 * @returns {string} - URL to the order page
 */
const createOrderUrl = (orderId) => {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL_PROD
    : process.env.FRONTEND_URL_LOCAL;
  
  return `${baseUrl}/order-status/${orderId}`;
};

/**
 * Process pending reminders that are due
 */
const processReminderTasks = async () => {
  try {
    const now = new Date();
    
    // Find pending tasks that are due
    const dueTasks = await ReminderTask.find({
      status: 'pending',
      scheduledFor: { $lte: now }
    }).sort({ scheduledFor: 1 });
    
    // if (dueTasks.length > 0) {
    //   console.log(`Found ${dueTasks.length} reminder tasks to process`);
    // }
    
    for (const task of dueTasks) {
      try {
        // Check if order still exists and has PAYER_ACTION_REQUIRED status
        const order = await Order.findOne({ paypalOrderId: task.orderId });
        
        if (!order) {
          console.error(`Order not found for task: ${task._id}, orderId: ${task.orderId}`);
          await ReminderTask.findByIdAndUpdate(task._id, { 
            status: 'cancelled',
            error: 'Order not found'
          });
          continue;
        }
        
        if (order.status !== 'PAYER_ACTION_REQUIRED') {
          await ReminderTask.findByIdAndUpdate(task._id, { 
            status: 'cancelled',
            error: `Order status changed to ${order.status}`
          });
          continue;
        }
        
        // Send the reminder email
        const reminderType = task.taskType === 'initialReminder' ? 'initial' : 'followup';
        await sendPayerActionRequiredEmail(task.orderId, task.orderUrl, reminderType);
        
        // Update task status to completed
        await ReminderTask.findByIdAndUpdate(task._id, {
          status: 'completed',
          executedAt: new Date()
        });
        
        // Update order to record the reminder was sent
        if (reminderType === 'initial') {
          await Order.findOneAndUpdate(
            { paypalOrderId: task.orderId },
            { 
              initialReminderSent: true,
              initialReminderSentAt: new Date()
            }
          );
        } else {
          await Order.findOneAndUpdate(
            { paypalOrderId: task.orderId },
            { 
              followupReminderSent: true,
              followupReminderSentAt: new Date()
            }
          );
        }
        
      } catch (error) {
        console.error(`Error processing reminder task ${task._id}:`, error);
        
        // Mark the task as failed but keep it pending for retry
        await ReminderTask.findByIdAndUpdate(task._id, {
          error: error.message || 'Unknown error'
        });
      }
    }
  } catch (error) {
    console.error('Error processing reminder tasks:', error);
  }
};

/**
 * Start the scheduler to periodically check for due reminders
 */
export const startReminderScheduler = () => {
  if (schedulerRunning) {
    return;
  }
  
  schedulerRunning = true;
  
  // Process immediately on startup
  processReminderTasks();
  
  // Set up periodic checks
  setInterval(processReminderTasks, CHECK_INTERVAL);
};

/**
 * Initialize the reminder system - should be called at server startup
 */
export const initializeReminderSystem = () => {
  startReminderScheduler();
};

export default {
  schedulePaymentReminders,
  cancelExistingReminders,
  initializeReminderSystem
};
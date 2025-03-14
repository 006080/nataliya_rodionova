// Add this file as services/adminService.js

import Order from '../Models/Order.js';
import { sendOrderStatusEmail } from './emailNotification.js';
import { cancelExistingReminders } from './paymentReminderService.js';

/**
 * Sync an order that was manually updated in the database
 * This ensures email notifications and other side effects happen
 * @param {string} orderId - PayPal order ID
 * @returns {Object} - Updated order with notifications sent
 */
export const syncOrderStatus = async (orderId) => {
  try {
    // Get the order from the database
    const order = await Order.findOne({ paypalOrderId: orderId });
    
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    
    // If the order was manually set to CANCELED or VOIDED, 
    // we need to cancel any reminders and send email
    if (order.status === 'CANCELED' || order.status === 'VOIDED') {
      // Cancel any scheduled reminders
      await cancelExistingReminders(orderId);
      
      // Reset email sent flag to ensure a notification is sent
      await Order.findOneAndUpdate(
        { paypalOrderId: orderId },
        { 
          emailSent: false,
          updatedAt: new Date(),
          // If cancelledAt isn't set, set it now
          cancelledAt: order.cancelledAt || new Date()
        }
      );
      
      // Send the cancellation email notification
      await sendOrderStatusEmail(orderId, 'PAYER_ACTION_REQUIRED'); // Assume it was previously in PAYER_ACTION_REQUIRED
      
      console.log(`Synced cancelled order ${orderId} and sent notifications`);
    }
    
    return order;
  } catch (error) {
    console.error(`Error syncing order status: ${error}`);
    throw error;
  }
};

/**
 * Check for orders in PAYER_ACTION_REQUIRED status that have
 * had reminders sent more than 48 hours ago but haven't been paid
 * @returns {Array} - List of orders that can be auto-cancelled
 */
export const findAbandonedOrders = async () => {
  try {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - 48); // 48 hours ago
    
    // Find orders that:
    // 1. Are in PAYER_ACTION_REQUIRED status
    // 2. Have followup reminder sent (24-hour)
    // 3. The followup reminder was sent at least 24 hours ago
    const abandonedOrders = await Order.find({
      status: 'PAYER_ACTION_REQUIRED',
      followupReminderSent: true,
      followupReminderSentAt: { $lt: cutoffTime }
    });
    
    return abandonedOrders;
  } catch (error) {
    console.error(`Error finding abandoned orders: ${error}`);
    throw error;
  }
};

export default {
  syncOrderStatus,
  findAbandonedOrders
};
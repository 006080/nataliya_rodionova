import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import Order from '../Models/Order.js';

dotenv.config({ path: './.env.local' });

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send order status email based on the current status
 * @param {string} orderId - PayPal order ID
 * @param {string} previousStatus - Previous order status (optional)
 * @returns {Promise<boolean>} - Success status
 */
export const sendOrderStatusEmail = async (orderId, previousStatus = null) => {
  try {
    // Find the order in the database
    const order = await Order.findOne({ paypalOrderId: orderId });
    
    if (!order) {
      console.error(`Order not found with ID: ${orderId}`);
      return false;
    }

    // Skip sending immediate emails for PAYER_ACTION_REQUIRED status
    // These will be sent via the reminder system instead
    if (order.status === 'PAYER_ACTION_REQUIRED') {
      console.log(`Order ${orderId} status is PAYER_ACTION_REQUIRED. Email will be sent via reminder system.`);
      return true;
    }

    // Skip if the status hasn't changed and an email was already sent
    if (previousStatus && previousStatus === order.status && order.emailSent) {
      return true;
    }

    // Get emails from both PayPal and delivery details
    const paypalEmail = order.customer?.email;
    const deliveryEmail = order.deliveryDetails?.email;

    if (!paypalEmail && !deliveryEmail) {
      console.error(`No email available for order: ${orderId}`);
      return false;
    }

    // Create an array of recipient emails (removing duplicates)
    const recipientEmails = [...new Set([
      paypalEmail, 
      deliveryEmail
    ].filter(email => email))]; // filter out undefined/null values

    // Generate both HTML and plain text versions of the email
    const htmlContent = formatOrderEmail(order);
    const textContent = formatPlainTextEmail(order);

    // Create appropriate subject based on order status
    const statusInfo = getStatusInfo(order.status);
    const emailSubject = `VARONA - ${statusInfo.title} #${orderId}`;

    // Send email to customer(s)
    const customerMailOptions = {
      from: `VARONA <${process.env.EMAIL_USER}>`,
      to: recipientEmails.join(', '), // Join emails with commas for multiple recipients
      subject: emailSubject,
      text: textContent,
      html: htmlContent
    };

    await transporter.sendMail(customerMailOptions);

    // Send notification email to admin with more information
    const adminHtmlContent = formatAdminOrderEmail(order, previousStatus);
    const adminTextContent = formatAdminPlainTextEmail(order, previousStatus);
    
    const adminMailOptions = {
      from: `VARONA Order System <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to admin email
      subject: `Order Status Update: ${order.status} #${orderId}`,
      text: adminTextContent,
      html: adminHtmlContent
    };

    await transporter.sendMail(adminMailOptions);

    // Update order to mark email as sent
    await Order.findOneAndUpdate(
      { paypalOrderId: orderId },
      { 
        emailSent: true,
        emailSentAt: new Date()
      }
    );

    return true;
  } catch (error) {
    console.error('Error sending order status email:', error);
    return false;
  }
};

/**
 * Send email for orders that require action from the customer
 * @param {string} orderId - PayPal order ID
 * @param {string} orderUrl - URL to the order page (optional)
 * @param {string} reminderType - Type of reminder ('initial', 'followup', or null)
 * @returns {Promise<boolean>} - Success status
 */
export const sendPayerActionRequiredEmail = async (orderId, orderUrl = null, reminderType = null) => {
  try {
    // Find the order in the database
    const order = await Order.findOne({ paypalOrderId: orderId });
    
    if (!order) {
      console.error(`Order not found with ID: ${orderId}`);
      return false;
    }
    
    if (order.status !== 'PAYER_ACTION_REQUIRED') {
      console.log(`Order ${orderId} status is ${order.status}, not sending payment action required email`);
      return false;
    }
    
    // Get emails from both PayPal and delivery details
    const paypalEmail = order.customer?.email;
    const deliveryEmail = order.deliveryDetails?.email;

    if (!paypalEmail && !deliveryEmail) {
      console.error(`No email available for order: ${orderId}`);
      return false;
    }

    // Create an array of recipient emails (removing duplicates)
    const recipientEmails = [...new Set([
      paypalEmail, 
      deliveryEmail
    ].filter(email => email))]; // filter out undefined/null values

    // Generate order URL if not provided
    if (!orderUrl) {
      const baseUrl = process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL_PROD
        : process.env.FRONTEND_URL_LOCAL;
      
      orderUrl = `${baseUrl}/order-status/${orderId}`;
    }

    // Get admin panel URL
    const adminBaseUrl = process.env.NODE_ENV === 'production'
      ? process.env.ADMIN_URL_PROD || process.env.FRONTEND_URL_PROD + '/admin'
      : process.env.ADMIN_URL_LOCAL || process.env.FRONTEND_URL_LOCAL + '/admin';
    
    const adminOrderUrl = `${adminBaseUrl}/orders/${orderId}`;

    // Determine the subject and content based on reminder type
    let subjectPrefix = 'ACTION REQUIRED:';
    let messagePrefix = '';
    
    if (reminderType === 'followup') {
      subjectPrefix = 'FINAL REMINDER - ACTION REQUIRED:';
      messagePrefix = 'This is a final reminder that ';
    } else if (reminderType === 'initial') {
      subjectPrefix = 'REMINDER - ACTION NEEDED:';
      messagePrefix = '';
    }

    // Generate both HTML and plain text versions of the customer email
    const htmlContent = formatOrderEmail(order, orderUrl, reminderType);
    const textContent = formatPlainTextEmail(order, orderUrl, reminderType);

    // Create appropriate subject based on order status
    const statusInfo = getStatusInfo(order.status, orderUrl, reminderType);
    const emailSubject = `${subjectPrefix} VARONA Order #${orderId} - Payment Action Required`;

    // Send email to customer(s) with more urgent subject line
    const customerMailOptions = {
      from: `VARONA <${process.env.EMAIL_USER}>`,
      to: recipientEmails.join(', '), // Join emails with commas for multiple recipients
      subject: emailSubject,
      text: textContent,
      html: htmlContent
    };

    await transporter.sendMail(customerMailOptions);

    // Generate admin email with order management information
    const adminHtmlContent = formatAdminPaymentReminderEmail(order, adminOrderUrl, reminderType);
    const adminTextContent = formatAdminPaymentReminderPlainText(order, adminOrderUrl, reminderType);
    
    // Customize admin subject based on reminder type
    let adminSubject = '';
    if (reminderType === 'initial') {
      adminSubject = `INITIAL PAYMENT REMINDER SENT - Order #${orderId} (${reminderType === 'initial' ? '5-minute' : '24-hour'})`;
    } else if (reminderType === 'followup') {
      adminSubject = `FINAL PAYMENT REMINDER SENT - Order #${orderId} (24-hour follow-up)`;
    } else {
      adminSubject = `Payment Action Required: ${order.status} #${orderId}`;
    }

    // Send notification email to admin
    const adminMailOptions = {
      from: `VARONA Order System <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to admin email
      subject: adminSubject,
      text: adminTextContent,
      html: adminHtmlContent
    };

    await transporter.sendMail(adminMailOptions);

    // Update order to mark email as sent
    let updateFields = { 
      emailSent: true,
      emailSentAt: new Date()
    };
    
    // Update the appropriate reminder field based on type
    if (reminderType === 'initial') {
      updateFields.initialReminderSent = true;
      updateFields.initialReminderSentAt = new Date();
    } else if (reminderType === 'followup') {
      updateFields.followupReminderSent = true;
      updateFields.followupReminderSentAt = new Date();
    }
    
    await Order.findOneAndUpdate(
      { paypalOrderId: orderId },
      updateFields
    );

    return true;
  } catch (error) {
    console.error('Error sending payer action required email:', error);
    return false;
  }
};

/**
 * Format an admin-specific email for payment reminders
 * @param {Object} order - The order object
 * @param {String} adminOrderUrl - URL to the admin panel for this order
 * @param {String} reminderType - Type of reminder ('initial', 'followup', or null)
 * @returns {String} - HTML email content
 */
const formatAdminPaymentReminderEmail = (order, adminOrderUrl, reminderType) => {
  // Get customer info
  const customerName = order.customer?.name || order.deliveryDetails?.fullName || 'Customer';
  const customerEmail = order.customer?.email || order.deliveryDetails?.email || 'N/A';
  const customerPhone = order.customer?.phone || order.deliveryDetails?.phone || 'N/A';
  
  // Format order items for display
  const itemsList = order.items.map(item => 
    `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">€${item.price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">€${(item.quantity * item.price).toFixed(2)}</td>
    </tr>`
  ).join('');
  
  // Get reminder-specific information
  let reminderTypeText = 'Payment reminder';
  let reminderColor = '#fd7e14';
  let reminderNote = 'The initial 5-minute reminder has been sent to the customer.';
  
  if (reminderType === 'followup') {
    reminderTypeText = 'FINAL Payment reminder (24-hour)';
    reminderColor = '#dc3545';
    reminderNote = 'The 24-hour FINAL reminder has been sent to the customer. Consider contacting them directly.';
  } else if (reminderType === 'initial') {
    reminderTypeText = 'Initial Payment reminder (5-minute)';
    reminderColor = '#fd7e14';
    reminderNote = 'The initial 5-minute reminder has been sent to the customer. A follow-up will be sent in 24 hours if no action is taken.';
  }
  
  // Get time elapsed since order creation
  const orderCreatedAt = new Date(order.createdAt);
  const now = new Date();
  const hoursElapsed = Math.round((now - orderCreatedAt) / (1000 * 60 * 60) * 10) / 10;
  
  // Determine next steps based on reminder type
  let nextStepsHtml = '';
  if (reminderType === 'followup') {
    nextStepsHtml = `
    <div style="margin-top: 15px; padding: 12px; background-color: #f8f9fa; border-left: 4px solid #dc3545;">
      <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Recommended Actions:</strong></p>
      <ol style="margin: 0 0 0 20px; padding: 0;">
        <li>Consider contacting the customer directly (phone: ${customerPhone})</li>
        <li>If no response within 48 hours, consider voiding the order</li>
        <li>Check payment logs for any failed payment attempts</li>
      </ol>
    </div>`;
  } else if (reminderType === 'initial') {
    nextStepsHtml = `
    <div style="margin-top: 15px; padding: 12px; background-color: #f8f9fa; border-left: 4px solid #fd7e14;">
      <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Next Steps:</strong></p>
      <ol style="margin: 0 0 0 20px; padding: 0;">
        <li>A follow-up reminder will be automatically sent in 24 hours if the payment is still pending</li>
        <li>No immediate action required from admin</li>
        <li>The customer has been provided with a direct link to complete their payment</li>
      </ol>
    </div>`;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin: ${reminderTypeText} Sent</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.4; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f7f7;">
  <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
    <!-- Header -->
    <div style="background-color: ${reminderColor}; padding: 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 1px;">ADMIN: ${reminderTypeText.toUpperCase()} SENT</h1>
    </div>
    
    <!-- Status Message -->
    <div style="padding: 15px; background-color: #f8f9fa; border-bottom: 1px solid #eaeaea;">
      <p style="margin: 0; font-size: 15px;"><strong>Note:</strong> ${reminderNote}</p>
    </div>
    
    <!-- Order Info -->
    <div style="padding: 20px;">
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Order ID:</td>
          <td style="padding: 8px 0;">${order.paypalOrderId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Status:</td>
          <td style="padding: 8px 0; color: ${reminderColor}; font-weight: bold;">PAYER_ACTION_REQUIRED</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Created Date:</td>
          <td style="padding: 8px 0;">${new Date(order.createdAt).toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Time Elapsed:</td>
          <td style="padding: 8px 0;">${hoursElapsed} hours</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Total Amount:</td>
          <td style="padding: 8px 0; font-weight: bold;">€${order.totalAmount.toFixed(2)}</td>
        </tr>
      </table>
      
      <div style="padding: 15px; background-color: #f8f9fa; border-radius: 6px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">CUSTOMER INFORMATION</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; width: 30%; font-weight: bold;">Name:</td>
            <td style="padding: 5px 0;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; font-weight: bold;">Email:</td>
            <td style="padding: 5px 0;">${customerEmail}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; font-weight: bold;">Phone:</td>
            <td style="padding: 5px 0;">${customerPhone}</td>
          </tr>
        </table>
      </div>
      
      <!-- Quick Links -->
      <div style="text-align: center; margin-bottom: 20px;">
        <a href="${adminOrderUrl}" style="background-color: #0056b3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; margin: 0 10px;">View Order in Admin Panel</a>
      </div>
      
      <!-- Order Items -->
      <h3 style="margin: 20px 0 10px 0; color: #333; font-size: 16px;">ORDER ITEMS</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f3f3f3;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
            <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
          <tr>
            <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">Total:</td>
            <td style="padding: 8px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">€${order.totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      
      <!-- Reminder Status -->
      <div style="padding: 15px; background-color: #f8f9fa; border-radius: 6px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">REMINDER STATUS</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; width: 40%; font-weight: bold;">Initial Reminder (5-min):</td>
            <td style="padding: 5px 0;">
              ${order.initialReminderSent ? 
                `Sent at ${new Date(order.initialReminderSentAt || new Date()).toLocaleString()}` : 
                reminderType === 'initial' ? 'Sending now' : 'Not sent yet'}
            </td>
          </tr>
          <tr>
            <td style="padding: 5px 0; font-weight: bold;">Follow-up Reminder (24h):</td>
            <td style="padding: 5px 0;">
              ${order.followupReminderSent ? 
                `Sent at ${new Date(order.followupReminderSentAt || new Date()).toLocaleString()}` : 
                reminderType === 'followup' ? 'Sending now' : 'Scheduled for ${new Date(new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000).toLocaleString()}'}
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Next Steps -->
      ${nextStepsHtml}
      
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f3f3f3; padding: 15px; text-align: center; font-size: 14px; color: #777;">
      <p style="margin: 0;">This is an automated admin notification. No action is required unless specified above.</p>
    </div>
  </div>
</body>
</html>
`;
};

/**
 * Format an admin-specific plain text email for payment reminders
 * @param {Object} order - The order object
 * @param {String} adminOrderUrl - URL to the admin panel for this order
 * @param {String} reminderType - Type of reminder ('initial', 'followup', or null)
 * @returns {String} - Plain text email content
 */
const formatAdminPaymentReminderPlainText = (order, adminOrderUrl, reminderType) => {
  // Get customer info
  const customerName = order.customer?.name || order.deliveryDetails?.fullName || 'Customer';
  const customerEmail = order.customer?.email || order.deliveryDetails?.email || 'N/A';
  const customerPhone = order.customer?.phone || order.deliveryDetails?.phone || 'N/A';
  
  // Format order items for display
  const itemsList = order.items.map(item => 
    `${item.name} - ${item.quantity} x €${item.price.toFixed(2)} = €${(item.quantity * item.price).toFixed(2)}`
  ).join('\n');
  
  // Get reminder-specific information
  let reminderTypeText = 'Payment reminder';
  let reminderNote = 'The initial 5-minute reminder has been sent to the customer.';
  
  if (reminderType === 'followup') {
    reminderTypeText = 'FINAL Payment reminder (24-hour)';
    reminderNote = 'The 24-hour FINAL reminder has been sent to the customer. Consider contacting them directly.';
  } else if (reminderType === 'initial') {
    reminderTypeText = 'Initial Payment reminder (5-minute)';
    reminderNote = 'The initial 5-minute reminder has been sent to the customer. A follow-up will be sent in 24 hours if no action is taken.';
  }
  
  // Get time elapsed since order creation
  const orderCreatedAt = new Date(order.createdAt);
  const now = new Date();
  const hoursElapsed = Math.round((now - orderCreatedAt) / (1000 * 60 * 60) * 10) / 10;
  
  // Determine next steps based on reminder type
  let nextSteps = '';
  if (reminderType === 'followup') {
    nextSteps = `
RECOMMENDED ACTIONS:
1. Consider contacting the customer directly (phone: ${customerPhone})
2. If no response within 48 hours, consider voiding the order
3. Check payment logs for any failed payment attempts`;
  } else if (reminderType === 'initial') {
    nextSteps = `
NEXT STEPS:
1. A follow-up reminder will be automatically sent in 24 hours if the payment is still pending
2. No immediate action required from admin
3. The customer has been provided with a direct link to complete their payment`;
  }

  return `
ADMIN: ${reminderTypeText.toUpperCase()} SENT

Note: ${reminderNote}

ORDER INFORMATION:
Order ID: ${order.paypalOrderId}
Status: PAYER_ACTION_REQUIRED
Created Date: ${new Date(order.createdAt).toLocaleString()}
Time Elapsed: ${hoursElapsed} hours
Total Amount: €${order.totalAmount.toFixed(2)}

CUSTOMER INFORMATION:
Name: ${customerName}
Email: ${customerEmail}
Phone: ${customerPhone}

View Order in Admin Panel: ${adminOrderUrl}

ORDER ITEMS:
${itemsList}

Total: €${order.totalAmount.toFixed(2)}

REMINDER STATUS:
Initial Reminder (5-min): ${order.initialReminderSent ? 
  `Sent at ${new Date(order.initialReminderSentAt || new Date()).toLocaleString()}` : 
  reminderType === 'initial' ? 'Sending now' : 'Not sent yet'}
Follow-up Reminder (24h): ${order.followupReminderSent ? 
  `Sent at ${new Date(order.followupReminderSentAt || new Date()).toLocaleString()}` : 
  reminderType === 'followup' ? 'Sending now' : `Scheduled for ${new Date(new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000).toLocaleString()}`}

${nextSteps}

This is an automated admin notification. No action is required unless specified above.
`;
};

/**
 * Format an admin-specific email for general order status updates
 * @param {Object} order - The order object
 * @param {String} previousStatus - The previous status of the order
 * @returns {String} - HTML email content
 */
const formatAdminOrderEmail = (order, previousStatus) => {
  // Similar to formatAdminPaymentReminderEmail but for general order status updates
  // Will include information about the status change, timestamps, etc.
  
  // Get status-specific styling
  const statusInfo = getStatusInfo(order.status);
  
  // Format items list
  const itemsList = order.items.map(item => 
    `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">€${item.price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">€${(item.quantity * item.price).toFixed(2)}</td>
    </tr>`
  ).join('');
  
  // Get status change information
  let statusChangeHtml = '';
  if (previousStatus) {
    statusChangeHtml = `
    <div style="padding: 15px; background-color: #f8f9fa; border-radius: 6px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">STATUS CHANGE</h3>
      <p style="margin: 0; font-size: 15px;">Previous Status: <strong>${previousStatus}</strong></p>
      <p style="margin: 5px 0 0 0; font-size: 15px;">New Status: <strong style="color: ${statusInfo.statusColor};">${order.status}</strong></p>
      <p style="margin: 5px 0 0 0; font-size: 15px;">Changed At: ${new Date().toLocaleString()}</p>
    </div>`;
  }
  
  // Get customer info
  const customerName = order.customer?.name || order.deliveryDetails?.fullName || 'Customer';
  const customerEmail = order.customer?.email || order.deliveryDetails?.email || 'N/A';
  const customerPhone = order.customer?.phone || order.deliveryDetails?.phone || 'N/A';
  
  // Get admin panel URL
  const adminBaseUrl = process.env.NODE_ENV === 'production'
    ? process.env.ADMIN_URL_PROD || process.env.FRONTEND_URL_PROD + '/admin'
    : process.env.ADMIN_URL_LOCAL || process.env.FRONTEND_URL_LOCAL + '/admin';
  
  const adminOrderUrl = `${adminBaseUrl}/orders/${order.paypalOrderId}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin: Order Status Update</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.4; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f7f7;">
  <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
    <!-- Header -->
    <div style="background-color: ${statusInfo.headerColor}; padding: 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 1px;">ADMIN: ORDER STATUS UPDATE</h1>
    </div>
    
    <!-- Status Message -->
    <div style="padding: 15px; background-color: ${statusInfo.messageBgColor}; border-bottom: 1px solid #eaeaea;">
      <p style="margin: 0; font-size: 15px; color: ${statusInfo.messageColor};">
        <strong>Status:</strong> ${order.status} (Order #${order.paypalOrderId})
      </p>
    </div>
    
    <!-- Order Info -->
    <div style="padding: 20px;">
      ${statusChangeHtml}
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Order ID:</td>
          <td style="padding: 8px 0;">${order.paypalOrderId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Status:</td>
          <td style="padding: 8px 0; color: ${statusInfo.statusColor}; font-weight: bold;">${order.status}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Created Date:</td>
          <td style="padding: 8px 0;">${new Date(order.createdAt).toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Updated Date:</td>
          <td style="padding: 8px 0;">${order.updatedAt ? new Date(order.updatedAt).toLocaleString() : new Date().toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">Total Amount:</td>
          <td style="padding: 8px 0; font-weight: bold;">€${order.totalAmount.toFixed(2)}</td>
        </tr>
      </table>
      
      <div style="padding: 15px; background-color: #f8f9fa; border-radius: 6px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">CUSTOMER INFORMATION</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; width: 30%; font-weight: bold;">Name:</td>
            <td style="padding: 5px 0;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; font-weight: bold;">Email:</td>
            <td style="padding: 5px 0;">${customerEmail}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; font-weight: bold;">Phone:</td>
            <td style="padding: 5px 0;">${customerPhone}</td>
          </tr>
        </table>
      </div>
      
      <!-- Quick Links -->
      <div style="text-align: center; margin-bottom: 20px;">
        <a href="${adminOrderUrl}" style="background-color: #0056b3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; margin: 0 10px;">View Order in Admin Panel</a>
      </div>
      
      <!-- Order Items -->
      <h3 style="margin: 20px 0 10px 0; color: #333; font-size: 16px;">ORDER ITEMS</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f3f3f3;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
            <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
          <tr>
            <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">Total:</td>
            <td style="padding: 8px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">€${order.totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      
      <!-- Status-specific content from original template -->
      ${statusInfo.additionalContent}
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f3f3f3; padding: 15px; text-align: center; font-size: 14px; color: #777;">
      <p style="margin: 0;">This is an automated admin notification.</p>
    </div>
  </div>
</body>
</html>
`;
};

/**
 * Format an admin-specific plain text email for general order status updates
 * @param {Object} order - The order object
 * @param {String} previousStatus - The previous status of the order
 * @returns {String} - Plain text email content
 */
const formatAdminPlainTextEmail = (order, previousStatus) => {
  // Get status-specific styling
  const statusInfo = getStatusInfo(order.status);
  
  // Format items list
  const itemsList = order.items.map(item => 
    `${item.name} - ${item.quantity} x €${item.price.toFixed(2)} = €${(item.quantity * item.price).toFixed(2)}`
  ).join('\n');
  
  // Get status change information
  let statusChangeText = '';
  if (previousStatus) {
    statusChangeText = `
STATUS CHANGE:
Previous Status: ${previousStatus}
New Status: ${order.status}
Changed At: ${new Date().toLocaleString()}`;
  }
  
  // Get customer info
  const customerName = order.customer?.name || order.deliveryDetails?.fullName || 'Customer';
  const customerEmail = order.customer?.email || order.deliveryDetails?.email || 'N/A';
  const customerPhone = order.customer?.phone || order.deliveryDetails?.phone || 'N/A';
  
  // Get admin panel URL
  const adminBaseUrl = process.env.NODE_ENV === 'production'
    ? process.env.ADMIN_URL_PROD || process.env.FRONTEND_URL_PROD + '/admin'
    : process.env.ADMIN_URL_LOCAL || process.env.FRONTEND_URL_LOCAL + '/admin';
  
  const adminOrderUrl = `${adminBaseUrl}/orders/${order.paypalOrderId}`;

  return `
ADMIN: ORDER STATUS UPDATE

Status: ${order.status} (Order #${order.paypalOrderId})
${statusChangeText}

ORDER INFORMATION:
Order ID: ${order.paypalOrderId}
Status: ${order.status}
Created Date: ${new Date(order.createdAt).toLocaleString()}
Updated Date: ${order.updatedAt ? new Date(order.updatedAt).toLocaleString() : new Date().toLocaleString()}
Total Amount: €${order.totalAmount.toFixed(2)}

CUSTOMER INFORMATION:
Name: ${customerName}
Email: ${customerEmail}
Phone: ${customerPhone}

View Order in Admin Panel: ${adminOrderUrl}

ORDER ITEMS:
${itemsList}

Total: €${order.totalAmount.toFixed(2)}

This is an automated admin notification.
`;
};

/**
 * Get status-specific information for email customization
 * @param {String} status - Order status
 * @param {String} orderUrl - Optional URL to the order page
 * @param {String} reminderType - Type of reminder ('initial', 'followup', or null)
 * @returns {Object} - Status-specific information
 */
const getStatusInfo = (status, orderUrl = null, reminderType = null) => {
  if (status === 'PAYER_ACTION_REQUIRED') {
    // Custom messaging for payment action required
    let message = 'Your order requires additional action to complete the payment process.';
    let additionalContent = '';
    
    if (orderUrl) {
      if (reminderType === 'followup') {
        message = 'URGENT: Your order from 24 hours ago still requires payment action. To avoid cancellation, please complete your payment as soon as possible.';
        additionalContent = `
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #dc3545; border-radius: 4px;">
          <p style="margin: 0 0 15px 0; font-size: 15px;"><strong>This is our final reminder:</strong> Your order from 24 hours ago still requires your action to complete the payment process. If no action is taken, the order may be cancelled.</p>
          <p style="margin: 0 0 15px 0; font-size: 15px;">We've noticed that you started the checkout process but haven't completed the payment. If you experienced any issues during checkout, please try again or contact our customer support for assistance.</p>
          <div style="margin-top: 20px; text-align: center;">
            <a href="${orderUrl}" style="background-color: #dc3545; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Complete Your Payment Now</a>
          </div>
          <p style="margin: 15px 0 0 0; font-size: 13px; color: #6c757d; text-align: center;">Having trouble? Contact us at ${process.env.EMAIL_USER} for assistance.</p>
        </div>`;
      } else if (reminderType === 'initial') {
        message = 'Reminder: Your recent order requires payment action to be completed.';
        additionalContent = `
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #fd7e14; border-radius: 4px;">
          <p style="margin: 0 0 15px 0; font-size: 15px;">We noticed that you recently placed an order with us, but the payment process needs to be completed. This is likely because:</p>
          <ul style="margin: 0 0 15px 20px; padding: 0;">
            <li>You may have closed the browser before payment completion</li>
            <li>There might have been an issue with PayPal during checkout</li>
            <li>Additional verification is required by your payment provider</li>
          </ul>
          <p style="margin: 0 0 15px 0; font-size: 15px;">To complete your purchase, simply click the button below to return to your order:</p>
          <div style="margin-top: 20px; text-align: center;">
            <a href="${orderUrl}" style="background-color: #fd7e14; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Complete Your Order</a>
          </div>
          <p style="margin: 15px 0 0 0; font-size: 13px; color: #6c757d; text-align: center;">Your order details and items are saved and waiting for you.</p>
        </div>`;
      } else {
        additionalContent = `
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #fd7e14; border-radius: 4px;">
          <p style="margin: 0 0 15px 0; font-size: 15px;">Please check your PayPal account for additional instructions to complete your payment, or click the button below to revisit your order:</p>
          <div style="margin-top: 20px; text-align: center;">
            <a href="${orderUrl}" style="background-color: #fd7e14; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Order Details</a>
          </div>
        </div>`;
      }
    }
    
    return {
      title: reminderType === 'followup' ? 'URGENT: Payment Reminder' : 'Payment Reminder',
      headerText: reminderType === 'followup' ? 'FINAL PAYMENT REMINDER' : 'PAYMENT REMINDER',
      headerColor: reminderType === 'followup' ? '#dc3545' : '#fd7e14', // red for followup, orange for initial
      statusColor: reminderType === 'followup' ? '#dc3545' : '#fd7e14',
      messageBgColor: '#fff3cd',
      messageColor: '#856404',
      message: message,
      thankYouMessage: 'Thank you for choosing VARONA. We look forward to completing your order.',
      additionalContent: additionalContent
    };
  }
  
  // Return default status info for other statuses - using existing code
  switch(status) {
    case 'COMPLETED':
      return {
        title: 'Order Confirmation',
        headerText: 'ORDER CONFIRMATION',
        headerColor: '#3a3a3a',
        statusColor: '#28a745', // green
        messageBgColor: '#d4edda',
        messageColor: '#155724',
        message: 'Your payment has been successfully processed and your order is confirmed.',
        thankYouMessage: 'Thank you for your order! We will process it as soon as possible.',
        additionalContent: ''
      };
    // ... other cases remain unchanged
    default:
      return {
        title: 'Order Update',
        headerText: 'ORDER UPDATE',
        headerColor: '#6c757d',
        statusColor: '#6c757d', // gray
        messageBgColor: '#e2e3e5',
        messageColor: '#383d41',
        message: `Your order status has been updated to: ${status}`,
        thankYouMessage: 'Thank you for choosing VARONA. We appreciate your business.',
        additionalContent: ''
      };
  }
};

/**
 * Formats the order data into a stylish HTML email
 * @param {Object} order - The order object from the database
 * @param {String} orderUrl - Optional URL to the order page
 * @param {String} reminderType - Type of reminder ('initial', 'followup', or null)
 * @returns {String} - Formatted HTML email content
 */
const formatOrderEmail = (order, orderUrl = null, reminderType = null) => {
  // Using existing formatting code but with updated content from getStatusInfo
  // Get status specific styling and messaging
  const statusInfo = getStatusInfo(order.status, orderUrl, reminderType);
  
  // Format items for the email with styling
  const itemsList = order.items.map(item => 
    `<tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eaeaea;">${item.name}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eaeaea; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eaeaea; text-align: right;">€${item.price.toFixed(2)}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eaeaea; text-align: right;">€${(item.quantity * item.price).toFixed(2)}</td>
    </tr>`
  ).join('');

  // Format measurements - only include the values
  let measurementsSection = '';
  if (order.measurements && Object.keys(order.measurements).length > 0) {
    measurementsSection = `
    <tr>
      <td colspan="4" style="padding: 15px 8px; background-color: #f9f9f9;">
        <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">YOUR MEASUREMENTS</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; width: 25%;"><strong>Height:</strong></td>
            <td style="padding: 8px;">${order.measurements.height} cm</td>
            <td style="padding: 8px; width: 25%;"><strong>Chest:</strong></td>
            <td style="padding: 8px;">${order.measurements.chest} cm</td>
          </tr>
          <tr>
            <td style="padding: 8px; width: 25%;"><strong>Waist:</strong></td>
            <td style="padding: 8px;">${order.measurements.waist} cm</td>
            <td style="padding: 8px; width: 25%;"><strong>Hips:</strong></td>
            <td style="padding: 8px;">${order.measurements.hips} cm</td>
          </tr>
        </table>
      </td>
    </tr>`;
  }

  // Format delivery details
  let deliverySection = '';
  if (order.deliveryDetails) {
    const delivery = order.deliveryDetails;
    deliverySection = `
    <tr>
      <td colspan="4" style="padding: 15px 8px; background-color: #f9f9f9;">
        <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">DELIVERY DETAILS</h3>
        <p style="margin: 5px 0;">${delivery.fullName}</p>
        <p style="margin: 5px 0;">${delivery.address}</p>
        <p style="margin: 5px 0;">${delivery.postalCode}, ${delivery.city}</p>
        <p style="margin: 5px 0;">${delivery.country}</p>
        <p style="margin: 5px 0;">Email: ${delivery.email}</p>
        <p style="margin: 5px 0;">Phone: ${delivery.phone}</p>
      </td>
    </tr>`;
  }

  // Format shipping address if available from PayPal
  let shippingSection = '';
  if (order.shippingAddress) {
    const address = order.shippingAddress;
    shippingSection = `
    <tr>
      <td colspan="4" style="padding: 15px 8px; background-color: #f9f9f9;">
        <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">SHIPPING ADDRESS</h3>
        <p style="margin: 5px 0;">${address.addressLine1 || ''}</p>
        ${address.addressLine2 ? `<p style="margin: 5px 0;">${address.addressLine2}</p>` : ''}
        <p style="margin: 5px 0;">${address.adminArea2 || ''}, ${address.adminArea1 || ''} ${address.postalCode || ''}</p>
        <p style="margin: 5px 0;">${address.countryCode || ''}</p>
      </td>
    </tr>`;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusInfo.title}</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.4; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f7f7;">
  <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
    <!-- Header -->
    <div style="background-color: ${statusInfo.headerColor}; padding: 25px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">${statusInfo.headerText}</h1>
    </div>
    
    <!-- Status Message -->
    <div style="padding: 20px; background-color: ${statusInfo.messageBgColor}; text-align: center;">
      <p style="margin: 0; font-size: 16px; color: ${statusInfo.messageColor};">${statusInfo.message}</p>
    </div>
    
    <!-- Order Info -->
    <div style="padding: 25px;">
      <p style="margin: 0 0 5px 0; font-size: 16px;"><strong>Order ID:</strong> ${order.paypalOrderId}</p>
      <p style="margin: 0 0 5px 0; font-size: 16px;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      <p style="margin: 0 0 15px 0; font-size: 16px;"><strong>Status:</strong> <span style="color: ${statusInfo.statusColor}; font-weight: bold;">${order.status}</span></p>
      
      <div style="background-color: #f9f9f9; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">CUSTOMER INFORMATION</h3>
        <p style="margin: 5px 0;"><strong>Name:</strong> ${order.customer?.name || order.deliveryDetails?.fullName || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${order.customer?.email || order.deliveryDetails?.email || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.customer?.phone || order.deliveryDetails?.phone || 'N/A'}</p>
      </div>
      
      <!-- Order Items -->
      <h3 style="margin: 20px 0 10px 0; color: #333; font-size: 16px;">ORDER ITEMS</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f3f3f3;">
            <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
            <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
            <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
            <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
          <tr>
            <td colspan="3" style="padding: 12px 8px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">Total:</td>
            <td style="padding: 12px 8px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">€${order.totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      
      <!-- Additional Sections -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tbody>
          ${deliverySection}
          ${measurementsSection}
          ${shippingSection}
        </tbody>
      </table>
      
      <!-- Status-specific content -->
      ${statusInfo.additionalContent}
      
      <!-- Thank You Message -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center;">
        <p style="font-size: 16px; color: #555;">${statusInfo.thankYouMessage}</p>
        <p style="font-size: 14px; color: #777; margin-top: 20px;">If you have any questions, please contact us at ${process.env.EMAIL_USER}</p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f3f3f3; padding: 15px; text-align: center; font-size: 14px; color: #777;">
      <p style="margin: 0;">© ${new Date().getFullYear()} VARONA. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};

/**
 * Format plain text email
 * @param {Object} order - The order object
 * @param {String} orderUrl - URL to the order page (optional)
 * @param {String} reminderType - Type of reminder ('initial', 'followup', or null)
 * @returns {String} - Plain text email content
 */
const formatPlainTextEmail = (order, orderUrl = null, reminderType = null) => {
  // Format items for the email
  const itemsList = order.items.map(item => 
    `${item.name} - ${item.quantity} x €${item.price.toFixed(2)} = €${(item.quantity * item.price).toFixed(2)}`
  ).join('\n');

  // Get status-specific messaging
  const statusInfo = getStatusInfo(order.status, orderUrl, reminderType);
  
  // Add order URL to plain text email
  let orderUrlText = '';
  if (orderUrl) {
    orderUrlText = `\nComplete your payment here: ${orderUrl}\n`;
  }

  return `
${statusInfo.headerText} - VARONA

${statusInfo.message}

Order ID: ${order.paypalOrderId}
Date: ${new Date(order.createdAt).toLocaleString()}
Status: ${order.status}
${orderUrlText}

CUSTOMER INFORMATION:
Name: ${order.customer?.name || order.deliveryDetails?.fullName || 'N/A'}
Email: ${order.customer?.email || order.deliveryDetails?.email || 'N/A'}
Phone: ${order.customer?.phone || order.deliveryDetails?.phone || 'N/A'}

ITEMS:
${itemsList}

TOTAL: €${order.totalAmount.toFixed(2)}

${reminderType === 'followup' ? 'URGENT: This is our final reminder. Please complete your payment to avoid order cancellation.' : ''}
${reminderType === 'initial' ? 'Please complete your payment to finalize your order. A link has been provided above.' : ''}

${statusInfo.thankYouMessage}

If you have any questions, please contact us at ${process.env.EMAIL_USER}.

VARONA Team
`;
};

// Original function (maintained for backwards compatibility)
export const sendOrderConfirmationEmail = async (orderId) => {
  return sendOrderStatusEmail(orderId);
};

export default { sendOrderStatusEmail, sendOrderConfirmationEmail, sendPayerActionRequiredEmail };
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
 * Formats the order data into a stylish HTML email
 * @param {Object} order - The order object from the database
 * @returns {String} - Formatted HTML email content
 */
const formatOrderEmail = (order) => {
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

  // Get status specific styling and messaging
  const statusInfo = getStatusInfo(order.status);

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
 * Get status-specific information for email customization
 * @param {String} status - Order status
 * @returns {Object} - Status-specific information
 */
const getStatusInfo = (status) => {
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
    case 'CREATED':
      return {
        title: 'Order Created',
        headerText: 'ORDER CREATED',
        headerColor: '#0056b3',
        statusColor: '#0056b3', // blue
        messageBgColor: '#cce5ff',
        messageColor: '#004085',
        message: 'Your order has been created and is waiting for payment.',
        thankYouMessage: 'Thank you for choosing VARONA. Please complete your payment to proceed with your order.',
        additionalContent: `
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #0056b3; border-radius: 4px;">
          <p style="margin: 0; font-size: 15px;">Please complete your payment to proceed with your order. If you encounter any issues, feel free to contact our support team.</p>
        </div>`
      };
    case 'APPROVED':
      return {
        title: 'Order Approved',
        headerText: 'ORDER APPROVED',
        headerColor: '#28a745',
        statusColor: '#28a745', // green
        messageBgColor: '#d4edda',
        messageColor: '#155724',
        message: 'Your order has been approved and is now being processed.',
        thankYouMessage: 'Thank you for your order! We are preparing it for fulfillment.',
        additionalContent: ''
      };
    case 'SAVED':
      return {
        title: 'Order Saved',
        headerText: 'ORDER SAVED',
        headerColor: '#6c757d',
        statusColor: '#6c757d', // gray
        messageBgColor: '#e2e3e5',
        messageColor: '#383d41',
        message: 'Your order has been saved in our system.',
        thankYouMessage: 'Thank you for your interest in VARONA. Your order details have been saved.',
        additionalContent: `
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #6c757d; border-radius: 4px;">
          <p style="margin: 0; font-size: 15px;">This is a saved order that hasn't been completed yet. You can complete your purchase at any time.</p>
        </div>`
      };
    case 'VOIDED':
      return {
        title: 'Order Voided',
        headerText: 'ORDER VOIDED',
        headerColor: '#dc3545',
        statusColor: '#dc3545', // red
        messageBgColor: '#f8d7da',
        messageColor: '#721c24',
        message: 'Your order has been voided and will not be processed.',
        thankYouMessage: 'Thank you for your interest in VARONA. Feel free to place a new order at any time.',
        additionalContent: `
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #dc3545; border-radius: 4px;">
          <p style="margin: 0; font-size: 15px;">This order has been voided. If this was not expected, please contact our customer support.</p>
        </div>`
      };
    case 'PAYER_ACTION_REQUIRED':
      return {
        title: 'Action Required',
        headerText: 'ACTION REQUIRED',
        headerColor: '#fd7e14',
        statusColor: '#fd7e14', // orange
        messageBgColor: '#fff3cd',
        messageColor: '#856404',
        message: 'Your order requires additional action to complete the payment process.',
        thankYouMessage: 'Thank you for choosing VARONA. Please complete the required actions to process your order.',
        additionalContent: `
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #fd7e14; border-radius: 4px;">
          <p style="margin: 0; font-size: 15px;">Please check your email or PayPal account for additional instructions to complete your payment.</p>
        </div>`
      };
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

// Simple text version for email clients that don't support HTML
const formatPlainTextEmail = (order) => {
  // Format items for the email
  const itemsList = order.items.map(item => 
    `${item.name} - ${item.quantity} x €${item.price.toFixed(2)} = €${(item.quantity * item.price).toFixed(2)}`
  ).join('\n');

  // Format measurements - only include the values, not the full object
  let measurementsSection = '';
  if (order.measurements && Object.keys(order.measurements).length > 0) {
    measurementsSection = `
MEASUREMENTS:
Height: ${order.measurements.height} cm
Chest: ${order.measurements.chest} cm
Waist: ${order.measurements.waist} cm
Hips: ${order.measurements.hips} cm
`;
  }
  
  // Format delivery details
  let deliverySection = '';
  if (order.deliveryDetails) {
    const delivery = order.deliveryDetails;
    deliverySection = `
DELIVERY DETAILS:
Full Name: ${delivery.fullName}
Address: ${delivery.address}
Postal Code: ${delivery.postalCode}
City: ${delivery.city}
Country: ${delivery.country}
Email: ${delivery.email}
Phone: ${delivery.phone}
`;
  }

  // Format shipping address if available
  let shippingSection = '';
  if (order.shippingAddress) {
    const address = order.shippingAddress;
    shippingSection = `
SHIPPING ADDRESS:
${address.addressLine1 || ''}
${address.addressLine2 || ''}
${address.adminArea2 || ''}, ${address.adminArea1 || ''} ${address.postalCode || ''}
${address.countryCode || ''}
`;
  }

  // Get status-specific messaging
  const statusInfo = getStatusInfo(order.status);

  return `
${statusInfo.headerText} - VARONA

${statusInfo.message}

Order ID: ${order.paypalOrderId}
Date: ${new Date(order.createdAt).toLocaleString()}
Status: ${order.status}

CUSTOMER INFORMATION:
Name: ${order.customer?.name || order.deliveryDetails?.fullName || 'N/A'}
Email: ${order.customer?.email || order.deliveryDetails?.email || 'N/A'}
Phone: ${order.customer?.phone || order.deliveryDetails?.phone || 'N/A'}

ITEMS:
${itemsList}

TOTAL: €${order.totalAmount.toFixed(2)}
${deliverySection}
${measurementsSection}
${shippingSection}
${statusInfo.thankYouMessage}

If you have any questions, please contact us at ${process.env.EMAIL_USER}.

VARONA Team
`;
};


export const sendPayerActionRequiredEmail = async (orderId) => {
  try {
    // Find the order in the database
    const order = await Order.findOne({ paypalOrderId: orderId });
    
    if (!order) {
      console.error(`Order not found with ID: ${orderId}`);
      return false;
    }
    
    // Continue even if the status hasn't changed - this is important for PAYER_ACTION_REQUIRED
    // as we always want to send this particular notification
    
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
    const emailSubject = `VARONA - ${statusInfo.title} #${orderId} - Action Required`;

    // Send email to customer(s) with more urgent subject line
    const customerMailOptions = {
      from: `VARONA <${process.env.EMAIL_USER}>`,
      to: recipientEmails.join(', '), // Join emails with commas for multiple recipients
      subject: emailSubject,
      text: textContent,
      html: htmlContent
    };

    await transporter.sendMail(customerMailOptions);

    // Send notification email to admin
    const adminMailOptions = {
      from: `VARONA Order System <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to admin email
      subject: `Order Requires Customer Action: ${order.status} #${orderId}`,
      text: `An order requires customer action to complete payment:\n\n${textContent}`,
      html: htmlContent
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
    console.error('Error sending payer action required email:', error);
    return false;
  }
};


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

    if (order.status === 'PAYER_ACTION_REQUIRED') {
      return sendPayerActionRequiredEmail(orderId);
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

    // Send notification email to admin
    const adminMailOptions = {
      from: `VARONA Order System <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to admin email
      subject: `Order Status Update: ${order.status} #${orderId}`,
      text: `An order status has been updated:\n\n${textContent}`,
      html: htmlContent
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

// Original function (maintained for backwards compatibility)
export const sendOrderConfirmationEmail = async (orderId) => {
  return sendOrderStatusEmail(orderId);
};

export default { sendOrderStatusEmail, sendOrderConfirmationEmail };





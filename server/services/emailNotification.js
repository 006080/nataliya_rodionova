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
 * Formats the order data into a readable email
 * @param {Object} order - The order object from the database
 * @returns {String} - Formatted email content
 */
const formatOrderEmail = (order) => {
  // Format items for the email
  const itemsList = order.items.map(item => 
    `${item.name} - ${item.quantity} x €${item.price.toFixed(2)} = €${(item.quantity * item.price).toFixed(2)}`
  ).join('\n');

  // Format measurements
  let measurementsSection = '';
  if (order.measurements && Object.keys(order.measurements).length > 0) {
    measurementsSection = `
MEASUREMENTS:
${Object.entries(order.measurements)
  .filter(([key, value]) => value && key !== '_id')
  .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
  .join('\n')}
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
City: ${delivery.city}
Postal Code: ${delivery.postalCode}
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

  return `
ORDER CONFIRMATION - VARONA

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
Thank you for your order! We will process it as soon as possible.

If you have any questions, please contact us at ${process.env.EMAIL_USER}.

VARONA Team
`;
};

/**
 * Sends an order confirmation email to the customer
 * @param {String} orderId - The PayPal order ID
 * @returns {Promise<Boolean>} - Whether the email was sent successfully
 */
export const sendOrderConfirmationEmail = async (orderId) => {
  try {
    // Find the order in the database
    const order = await Order.findOne({ paypalOrderId: orderId });

    const paypalEmail = order.customer?.email;
    const deliveryEmail = order.deliveryDetails?.email;

    if (!paypalEmail && !deliveryEmail) {
      console.error(`No email available for order: ${orderId}`);
      return false;
    }
    
    if (!order) {
      console.error(`Order not found with ID: ${orderId}`);
      return false;
    }

    // If email was already sent, don't send again
    if (order.emailSent) {
      console.log(`Email already sent for order: ${orderId}`);
      return true;
    }

    // Skip if customer email is not available
    if (!order.customer?.email) {
      console.error(`Customer email not available for order: ${orderId}`);
      return false;
    }

    const recipientEmails = [...new Set([
      paypalEmail, 
      deliveryEmail
    ].filter(email => email))]

    const emailContent = formatOrderEmail(order);

    // Send email to customer
    const customerMailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmails.join(', '), 
      subject: `VARONA - Order Confirmation #${orderId}`,
      text: emailContent
    };

    await transporter.sendMail(customerMailOptions);

    // Send notification email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to admin email
      subject: `New Order Received #${orderId}`,
      text: `A new order has been received:\n\n${emailContent}`
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

    console.log(`Order confirmation email sent for order: ${orderId}`);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};

export default { sendOrderConfirmationEmail };
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
        <p style="margin: 5px 0;">${delivery.city}, ${delivery.postalCode}</p>
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
  <title>Order Confirmation</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.4; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f7f7;">
  <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
    <!-- Header -->
    <div style="background-color: #3a3a3a; padding: 25px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">ORDER CONFIRMATION</h1>
    </div>
    
    <!-- Order Info -->
    <div style="padding: 25px;">
      <p style="margin: 0 0 5px 0; font-size: 16px;"><strong>Order ID:</strong> ${order.paypalOrderId}</p>
      <p style="margin: 0 0 5px 0; font-size: 16px;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
      <p style="margin: 0 0 15px 0; font-size: 16px;"><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">${order.status}</span></p>
      
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
      
      <!-- Thank You Message -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center;">
        <p style="font-size: 16px; color: #555;">Thank you for your order! We will process it as soon as possible.</p>
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

// Update the sendOrderConfirmationEmail function
export const sendOrderConfirmationEmail = async (orderId) => {
  try {
    // Find the order in the database
    const order = await Order.findOne({ paypalOrderId: orderId });
    
    if (!order) {
      console.error(`Order not found with ID: ${orderId}`);
      return false;
    }

    // Get emails from both PayPal and delivery details
    const paypalEmail = order.customer?.email;
    const deliveryEmail = order.deliveryDetails?.email;

    if (!paypalEmail && !deliveryEmail) {
      console.error(`No email available for order: ${orderId}`);
      return false;
    }

    // If email was already sent, don't send again
    if (order.emailSent) {
      console.log(`Email already sent for order: ${orderId}`);
      return true;
    }

    // Create an array of recipient emails (removing duplicates)
    const recipientEmails = [...new Set([
      paypalEmail, 
      deliveryEmail
    ].filter(email => email))]; // filter out undefined/null values

    // Generate both HTML and plain text versions of the email
    const htmlContent = formatOrderEmail(order);
    const textContent = formatPlainTextEmail(order);

    // Send email to customer(s)
    const customerMailOptions = {
      from: `VARONA <${process.env.EMAIL_USER}>`,
      to: recipientEmails.join(', '), // Join emails with commas for multiple recipients
      subject: `VARONA - Order Confirmation #${orderId}`,
      text: textContent,
      html: htmlContent
    };

    await transporter.sendMail(customerMailOptions);

    // Send notification email to admin
    const adminMailOptions = {
      from: `VARONA Order System <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to admin email
      subject: `New Order Received #${orderId}`,
      text: `A new order has been received:\n\n${textContent}`,
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

    console.log(`Order confirmation email sent for order: ${orderId}`);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};

export default { sendOrderConfirmationEmail };

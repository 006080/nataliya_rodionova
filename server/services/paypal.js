import Order from '../Models/Order.js';
import { Buffer } from "node:buffer";
import { sendOrderStatusEmail } from '../services/emailNotification.js';
import { schedulePaymentReminders, cancelExistingReminders } from '../services/paymentReminderService.js';

/**
 * Get PayPal access token for API authentication
 * @returns {Promise<string>} PayPal access token
 */
const getPayPalAccessToken = async () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal Client ID or Secret is missing!");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error(`PayPal token request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.access_token) {
      throw new Error("Failed to get PayPal access token");
    }

    return data.access_token;
  } catch (error) {
    console.error("PayPal token error:", error);
    throw new Error("Failed to authenticate with PayPal");
  }
};

/**
 * Format price to always have 2 decimal places
 * @param {number} price - The price to format
 * @returns {string} Formatted price with 2 decimal places
 */
const formatPrice = (price) => {
  return Number(price).toFixed(2);
};

/**
 * Create a PayPal order and save it in MongoDB
 * @param {Array} cartItems - Array of cart items
 * @param {Object} measurements - Measurements data
 * @param {Object} deliveryDetails - Delivery details
 * @returns {Object} Created PayPal order data
 */
const createPayPalOrder = async (cartItems, measurements, deliveryDetails) => {
  const accessToken = await getPayPalAccessToken();

  let totalAmount = 0;
  
  const items = cartItems.map(item => {
    const itemTotal = item.price * item.quantity;
    totalAmount += itemTotal;
    
    return {
      name: item.name,
      description: item.description || '',
      quantity: item.quantity.toString(),
      unit_amount: {
        currency_code: 'EUR',
        value: formatPrice(item.price)
      }
    };
  });

  const orderData = {
    intent: "CAPTURE",
    purchase_units: [
      {
        items: items,
        amount: {
          currency_code: 'EUR',
          value: formatPrice(totalAmount),
          breakdown: {
            item_total: {
              currency_code: 'EUR',
              value: formatPrice(totalAmount)
            }
          }
        }
      }
    ],
    payment_source: {
      paypal: {
        experience_context: {
          brand_name: 'VARONA',
          shipping_preference: 'GET_FROM_FILE',
          // user_action: 'PAY_NOW',
          // return_url: process.env.FRONTEND_URL_PROD + '/checkout',
          // cancel_url: process.env.FRONTEND_URL_PROD + '/cart'
        },
      },
    },
  };

  try {
    const response = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "PayPal-Request-Id": `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PayPal order creation failed:", errorText);
      throw new Error(`Failed to create PayPal order: ${response.status}`);
    }

    const data = await response.json();
    
    // Store order in MongoDB
    const orderItems = cartItems.map(item => ({
      productId: item.id,
      name: item.name,
      description: item.description || '',
      quantity: item.quantity,
      price: Number(item.price)
    }));
    
    const newOrder = new Order({
      paypalOrderId: data.id,
      status: data.status,
      items: orderItems,
      totalAmount: totalAmount,
      currency: 'EUR',
      createdAt: new Date(),
      measurements,
      deliveryDetails,
      // Set initial fulfillment status based on PayPal status
      fulfillmentStatus: 'Processing'
    });
    
    await newOrder.save();

    // Send email notification for order creation EXCEPT for PAYER_ACTION_REQUIRED
    // For PAYER_ACTION_REQUIRED, schedule reminders instead
    if (data.status === 'PAYER_ACTION_REQUIRED') {
      await schedulePaymentReminders(data.id);
    } else {
      // Send regular order status email for other statuses
      await sendOrderStatusEmail(data.id);
    }
    
    return data;
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    throw error;
  }
};

/**
 * Capture a PayPal payment and update the order in MongoDB
 * @param {string} orderId - PayPal order ID
 * @returns {Object} Captured payment data
 */
const capturePayPalOrder = async (orderId) => {
  try {
    // Get the current order status before updating
    const currentOrder = await Order.findOne({ paypalOrderId: orderId });
    const previousStatus = currentOrder ? currentOrder.status : null;
    
    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "PayPal-Request-Id": `capture-${orderId}-${Date.now()}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PayPal capture failed:", errorText);
      throw new Error(`Failed to capture payment: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract customer and shipping information
    const customerInfo = data.payer ? {
      'customer.name': `${data.payer.name.given_name} ${data.payer.name.surname}`,
      'customer.email': data.payer.email_address,
      'customer.paypalPayerId': data.payer.payer_id
    } : {};
    
    const shippingInfo = data.purchase_units[0]?.shipping?.address ? {
      shippingAddress: {
        addressLine1: data.purchase_units[0].shipping.address.address_line_1,
        addressLine2: data.purchase_units[0].shipping.address.address_line_2 || '',
        adminArea1: data.purchase_units[0].shipping.address.admin_area_1 || '',
        adminArea2: data.purchase_units[0].shipping.address.admin_area_2 || '',
        postalCode: data.purchase_units[0].shipping.address.postal_code || '',
        countryCode: data.purchase_units[0].shipping.address.country_code || ''
      }
    } : {};
    
    // Update order in MongoDB
    const updatedOrder = await Order.findOneAndUpdate(
      { paypalOrderId: orderId },
      { 
        status: data.status,
        paymentDetails: data,
        updatedAt: new Date(),
        ...customerInfo,
        ...shippingInfo,
        // Add fulfillment status if not already set
        $setOnInsert: { fulfillmentStatus: 'Processing' }
      },
      { new: true, upsert: false }
    );
    
    if (!updatedOrder) {
      console.error("Order not found in database:", orderId);
    } else {
      // Check if the status has changed
      if (previousStatus !== data.status) {
        // If status changed to PAYER_ACTION_REQUIRED, schedule reminder emails
        if (data.status === 'PAYER_ACTION_REQUIRED') {
          await schedulePaymentReminders(orderId);
          // Note: No immediate email is sent now, only reminders are scheduled
        } 
        // If status changed to COMPLETED, cancel any scheduled reminders
        else if (data.status === 'COMPLETED' || data.status === 'APPROVED') {
          await cancelExistingReminders(orderId);
          
          // Send regular order status email for non-PAYER_ACTION_REQUIRED statuses
          await sendOrderStatusEmail(orderId, previousStatus);
        } else {
          // For all other status changes (not to PAYER_ACTION_REQUIRED)
          await sendOrderStatusEmail(orderId, previousStatus);
        }
      }
    }
    
    return data;
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    throw error;
  }
};

/**
 * Update an order's status and send notification email
 * @param {string} orderId - PayPal order ID
 * @param {string} newStatus - New status to set
 * @returns {Object} Updated order
 */
const updateOrderStatus = async (orderId, newStatus) => {
  try {
    // Get current order status before update
    const currentOrder = await Order.findOne({ paypalOrderId: orderId });
    
    if (!currentOrder) {
      throw new Error(`Order not found: ${orderId}`);
    }
    
    const previousStatus = currentOrder.status;
    
    // Skip update if status is the same
    if (previousStatus === newStatus) {
      return currentOrder;
    }
    
    // Update the order status
    const updatedOrder = await Order.findOneAndUpdate(
      { paypalOrderId: orderId },
      { 
        status: newStatus,
        updatedAt: new Date(),
        // Reset email sent flag when status changes to ensure a new email is sent
        emailSent: false
      },
      { new: true }
    );
    
    // Handle status-specific actions
    if (newStatus === 'PAYER_ACTION_REQUIRED') {
      // Schedule reminder emails but don't send immediate email
      await schedulePaymentReminders(orderId);
    } else if (newStatus === 'COMPLETED' || newStatus === 'APPROVED' || newStatus === 'VOIDED') {
      // Cancel any scheduled reminders
      await cancelExistingReminders(orderId);
      
      // Send email notification for the status change
      await sendOrderStatusEmail(orderId, previousStatus);
    } else {
      // For all other status changes (not to PAYER_ACTION_REQUIRED)
      await sendOrderStatusEmail(orderId, previousStatus);
    }
    
    return updatedOrder;
  } catch (error) {
    console.error(`Error updating order status: ${error}`);
    throw error;
  }
};

/**
 * Get PayPal order details by ID
 * @param {string} orderId - PayPal order ID
 * @returns {Object} PayPal order details
 */
const getPayPalOrderDetails = async (orderId) => {
  try {
    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get order details: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting PayPal order details:", error);
    throw error;
  }
};


/**
 * Cancel an order manually and send notification emails
 * @param {string} orderId - PayPal order ID
 * @param {string} reason - Reason for cancellation (optional)
 * @returns {Object} Updated order
 */
const cancelOrder = async (orderId, reason = 'Payment action not completed within required time') => {
  try {
    // Get current order status before update
    const currentOrder = await Order.findOne({ paypalOrderId: orderId });
    
    if (!currentOrder) {
      throw new Error(`Order not found: ${orderId}`);
    }
    
    const previousStatus = currentOrder.status;
    
    // Skip update if already canceled or completed
    if (previousStatus === 'VOIDED' || previousStatus === 'CANCELED' || previousStatus === 'COMPLETED') {
      return currentOrder;
    }
    
    // Update the order status to CANCELED (custom status)
    const updatedOrder = await Order.findOneAndUpdate(
      { paypalOrderId: orderId },
      { 
        status: 'CANCELED', // Custom status for manual cancellation
        updatedAt: new Date(),
        cancelReason: reason,
        cancelledAt: new Date(),
        // Also update fulfillment status
        fulfillmentStatus: 'Cancelled',
        // Reset email sent flag to ensure cancellation email is sent
        emailSent: false
      },
      { new: true }
    );
    
    // Cancel any scheduled reminders
    await cancelExistingReminders(orderId);
    
    // Send cancellation email notification
    await sendOrderStatusEmail(orderId, previousStatus);
    
    return updatedOrder;
  } catch (error) {
    console.error(`Error cancelling order: ${error}`);
    throw error;
  }
};

export { 
  getPayPalAccessToken, 
  createPayPalOrder, 
  capturePayPalOrder,
  updateOrderStatus,
  getPayPalOrderDetails,
  cancelOrder
};
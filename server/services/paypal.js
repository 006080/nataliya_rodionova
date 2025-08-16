import Order from '../Models/Order.js';
import { Buffer } from "node:buffer";
import { sendOrderStatusEmail } from '../services/emailNotification.js';
import { schedulePaymentReminders, cancelExistingReminders } from '../services/paymentReminderService.js';
import { getCountryName } from '../../src/utils/countries.js';

// In-memory cache for temporary orders 
const tempOrderCache = new Map();

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
 * Create a PayPal order but don't save it to MongoDB yet
 * @param {Array} cartItems - Array of cart items
 * @param {Object} measurements - Measurements data
 * @param {Object} deliveryDetails - Delivery details
 * @param {Object} colorPreference - Color preference data (added parameter)
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
          brand_name: 'VARONA_by_Nataliya_Rodionova',
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
    
    // Store order info in temporary cache instead of database
    const orderInfo = {
      paypalOrderId: data.id,
      status: data.status,
      items: cartItems.map(item => ({
        productId: item.id,
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        price: Number(item.price),
        color: item.color || ''
      })),
      totalAmount,
      currency: 'EUR',
      measurements,
      deliveryDetails,
      createdAt: new Date(),
      timestamp: Date.now()
    };

    
    // Store in temporary cache
    tempOrderCache.set(data.id, orderInfo);
    console.log(`Temporary order created: ${data.id}`);
    
    return data;
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    throw error;
  }
};


/**
 * Check if PayPal order has user interaction, with detailed response
 * @returns {Object} Object with interaction details
 */
const checkPayPalUserInteraction = async (orderId) => {
  try {
    const paypalOrder = await getPayPalOrderDetails(orderId);
    
    // Check specifically for email presence
    const hasEmail = Boolean(
      (paypalOrder.payer && paypalOrder.payer.email_address) ||
      (paypalOrder.payment_source && 
       paypalOrder.payment_source.paypal && 
       paypalOrder.payment_source.paypal.email_address)
    );
    
    // Extract customer data
    let customerEmail = null;
    let customerName = null;
    let payerId = null;
    
    if (paypalOrder.payer) {
      if (paypalOrder.payer.email_address) {
        customerEmail = paypalOrder.payer.email_address;
      }
      
      if (paypalOrder.payer.name) {
        customerName = `${paypalOrder.payer.name.given_name || ''} ${paypalOrder.payer.name.surname || ''}`.trim();
      }
      
      if (paypalOrder.payer.payer_id) {
        payerId = paypalOrder.payer.payer_id;
      }
    } else if (paypalOrder.payment_source && paypalOrder.payment_source.paypal) {
      if (paypalOrder.payment_source.paypal.email_address) {
        customerEmail = paypalOrder.payment_source.paypal.email_address;
      }
      
      if (paypalOrder.payment_source.paypal.name) {
        customerName = `${paypalOrder.payment_source.paypal.name.given_name || ''} ${paypalOrder.payment_source.paypal.name.surname || ''}`.trim();
      }
      
      if (paypalOrder.payment_source.paypal.account_id) {
        payerId = paypalOrder.payment_source.paypal.account_id;
      }
    }
    
    // General interaction check
    const hasInteraction = Boolean(
      paypalOrder.payer || 
      (paypalOrder.payment_source && 
       paypalOrder.payment_source.paypal && 
       (paypalOrder.payment_source.paypal.email_address || 
        paypalOrder.payment_source.paypal.account_id))
    );
    
    // Return detailed interaction information
    return {
      hasInteraction,
      hasEmail,
      customerData: {
        email: customerEmail,
        name: customerName,
        payerId: payerId
      }
    };
  } catch (error) {
    console.error(`Error checking PayPal user interaction: ${error}`);
    // In case of error, return detailed error info
    return {
      hasInteraction: false,
      hasEmail: false,
      customerData: null,
      error: error.message
    };
  }
};

/**
 * Persist order to MongoDB if it's not already there
 */
const persistOrderToDatabase = async (orderId) => {
  try {
    // First check if order already exists in database
    const existingOrder = await Order.findOne({ paypalOrderId: orderId });
    
    if (existingOrder) {
      return existingOrder;
    }
    
    // Check if we have temp data for this order
    const tempOrderData = tempOrderCache.get(orderId);
    
    if (!tempOrderData) {
      console.error(`No temp data found for order: ${orderId}`);
      throw new Error('Order data not found');
    }
    
    // Check with PayPal if user has interacted and get their info
    const interactionData = await checkPayPalUserInteraction(orderId);
    
    if (!interactionData.hasInteraction) {
      return null;
    }
    
    // Get customer info from PayPal
    const paypalOrder = await getPayPalOrderDetails(orderId);
    
    // Extract email from PayPal response
    let customerEmail = null;
    let customerName = null;
    
    if (paypalOrder.payer && paypalOrder.payer.email_address) {
      customerEmail = paypalOrder.payer.email_address;
      if (paypalOrder.payer.name) {
        customerName = `${paypalOrder.payer.name.given_name || ''} ${paypalOrder.payer.name.surname || ''}`.trim();
      }
    } else if (paypalOrder.payment_source && 
               paypalOrder.payment_source.paypal && 
               paypalOrder.payment_source.paypal.email_address) {
      customerEmail = paypalOrder.payment_source.paypal.email_address;
      // Try to get name from payment_source if available
      if (paypalOrder.payment_source.paypal.name) {
        customerName = `${paypalOrder.payment_source.paypal.name.given_name || ''} ${paypalOrder.payment_source.paypal.name.surname || ''}`.trim();
      }
    }
    
    // Prepare customer object
    const customer = {};
    
    // Add email if found from PayPal
    if (customerEmail) {
      customer.email = customerEmail;
    }
    
    // Add name if found from PayPal, otherwise use delivery details
    if (customerName) {
      customer.name = customerName;
    } else if (tempOrderData.deliveryDetails && tempOrderData.deliveryDetails.fullName) {
      customer.name = tempOrderData.deliveryDetails.fullName;
    }
    
    // If we still don't have email in customer, use the one from delivery details
    if (!customer.email && tempOrderData.deliveryDetails && tempOrderData.deliveryDetails.email) {
      customer.email = tempOrderData.deliveryDetails.email;
    }

    // Convert country code to country name in delivery details
    const deliveryDetails = { ...tempOrderData.deliveryDetails };
    if (deliveryDetails && deliveryDetails.country) {
      // Convert the country code to full country name
      deliveryDetails.country = getCountryName(deliveryDetails.country);
    }
    

    // User has interacted, create in database
    const newOrder = new Order({
      paypalOrderId: orderId,
      status: 'PAYER_ACTION_REQUIRED',
      items: tempOrderData.items,
      totalAmount: tempOrderData.totalAmount,
      currency: tempOrderData.currency || 'EUR',
      createdAt: new Date(),
      measurements: tempOrderData.measurements,
      deliveryDetails: deliveryDetails, 
      fulfillmentStatus: 'Processing',
      customer: Object.keys(customer).length > 0 ? customer : undefined
    });
    
    await newOrder.save();
    
    // Schedule reminders since user has interacted
    await schedulePaymentReminders(orderId);
    
    // Clean up temp data
    tempOrderCache.delete(orderId);
    
    return newOrder;
  } catch (error) {
    console.error(`Error persisting order to database: ${error}`);
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
    // Ensure order exists in database before capture
    await persistOrderToDatabase(orderId);
    
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

// Run cleanup job every 30 minutes
setInterval(() => {
  try {
    const now = Date.now();
    const expireTime = 30 * 60 * 1000; // 30 minutes
    
    let count = 0;
    for (const [orderId, orderData] of tempOrderCache.entries()) {
      if (now - orderData.timestamp > expireTime) {
        tempOrderCache.delete(orderId);
        count++;
      }
    }
    
    if (count > 0) {
      console.log(`Cleaned up ${count} temporary orders`);
    }
  } catch (error) {
    console.error("Error in temp order cleanup:", error);
  }
}, 30 * 60 * 1000);

export { 
  getPayPalAccessToken, 
  createPayPalOrder, 
  capturePayPalOrder,
  updateOrderStatus,
  getPayPalOrderDetails,
  cancelOrder,
  persistOrderToDatabase,
  checkPayPalUserInteraction
};
import Order from '../Models/Order.js';
import { Buffer } from "node:buffer";


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

const formatPrice = (price) => {
  // Ensure price is always formatted with 2 decimal places
  return Number(price).toFixed(2);
};

const createPayPalOrder = async (cartItems, measurements = null) => {
  const accessToken = await getPayPalAccessToken();

  // Map cart items to PayPal format and calculate total
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
          brand_name: 'VARONA'
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
    console.log("PayPal Order Created:", data.id);
    
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
      ...(measurements && { measurements })
    });


    
    await newOrder.save();
    console.log("Order saved to database:", newOrder._id);

    return data;
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    throw error;
  }
};

const capturePayPalOrder = async (orderId) => {
  try {
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
    
    // Update order in MongoDB
    const updatedOrder = await Order.findOneAndUpdate(
      { paypalOrderId: orderId },
      { 
        status: data.status,
        paymentDetails: data,
        updatedAt: new Date(),
        // Extract customer info if available
        ...(data.payer && {
          'customer.name': `${data.payer.name.given_name} ${data.payer.name.surname}`,
          'customer.email': data.payer.email_address,
          'customer.paypalPayerId': data.payer.payer_id
        }),
        // Extract shipping address if available
        ...(data.purchase_units[0]?.shipping && {
          shippingAddress: data.purchase_units[0].shipping.address
        })
      },
      { new: true }
    );
    
    console.log("Order updated after capture:", updatedOrder._id);
    
    return data;
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    throw error;
  }
};

export { getPayPalAccessToken, createPayPalOrder, capturePayPalOrder };




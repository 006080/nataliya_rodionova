import PaymentGateway from './paymentGateway.js';
import Order from '../Models/Order.js';
import { Buffer } from "node:buffer";

class PayPalGateway extends PaymentGateway {
  async getAccessToken() {
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
  }

  formatPrice(price) {
    return Number(price).toFixed(2);
  }

  async createPaymentIntent(cart, measurements, orderReference) {
    const accessToken = await this.getAccessToken();
    
    // Check if payment already exists for this order reference
    const existingOrder = await Order.findOne({ orderReference });
    if (existingOrder && existingOrder.isPaid) {
      throw new Error("This order has already been paid");
    }

    // Map cart items to PayPal format and calculate total
    let totalAmount = 0;
    
    const items = cart.map(item => {
      const itemTotal = item.price * item.quantity;
      totalAmount += itemTotal;
      
      return {
        name: item.name,
        description: item.description || '',
        quantity: item.quantity.toString(),
        unit_amount: {
          currency_code: 'EUR',
          value: this.formatPrice(item.price)
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
            value: this.formatPrice(totalAmount),
            breakdown: {
              item_total: {
                currency_code: 'EUR',
                value: this.formatPrice(totalAmount)
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
          "PayPal-Request-Id": orderReference // Use orderReference for idempotency
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
      const orderItems = cart.map(item => ({
        productId: item.id,
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        price: Number(item.price)
      }));
      
      // Check if we need to create a new order or update existing
      if (existingOrder) {
        // Update existing order
        await Order.findByIdAndUpdate(existingOrder._id, {
          'paymentIds.paypalOrderId': data.id,
          paymentMethod: 'paypal',
          status: data.status,
          updatedAt: new Date()
        });
      } else {
        // Create new order
        const newOrder = new Order({
          orderReference,
          paymentMethod: 'paypal',
          paymentIds: {
            paypalOrderId: data.id
          },
          status: data.status,
          items: orderItems,
          totalAmount: totalAmount,
          currency: 'EUR',
          ...(measurements && { measurements }),
          createdAt: new Date()
        });
        
        await newOrder.save();
        console.log("Order saved to database:", newOrder._id);
      }

      return {
        id: data.id,
        status: data.status,
        orderReference
      };
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      throw error;
    }
  }

  async capturePayment(paymentId, orderReference) {
    try {
      // Check if order has already been paid
      const existingOrder = await Order.findOne({ 
        orderReference,
        'paymentIds.paypalOrderId': paymentId
      });
      
      if (!existingOrder) {
        throw new Error("Order not found");
      }
      
      if (existingOrder.isPaid) {
        throw new Error("This order has already been paid");
      }
      
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${paymentId}/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "PayPal-Request-Id": `capture-${orderReference}`
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
        { 'paymentIds.paypalOrderId': paymentId },
        { 
          status: data.status,
          isPaid: data.status === 'COMPLETED',
          paymentDetails: data,
          updatedAt: new Date(),
          // Extract customer info if available
          ...(data.payer && {
            'customer.name': `${data.payer.name.given_name} ${data.payer.name.surname}`,
            'customer.email': data.payer.email_address,
            'customer.payerId': data.payer.payer_id
          }),
          // Extract shipping address if available
          ...(data.purchase_units[0]?.shipping && {
            shippingAddress: data.purchase_units[0].shipping.address
          })
        },
        { new: true }
      );
      
      console.log("Order updated after capture:", updatedOrder._id);
      
      return {
        id: data.id,
        status: data.status,
        orderReference: existingOrder.orderReference
      };
    } catch (error) {
      console.error("Error capturing PayPal order:", error);
      throw error;
    }
  }
  
  async getPaymentStatus(paymentId) {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${paymentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get payment status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error("Error getting PayPal payment status:", error);
      throw error;
    }
  }
}

export default PayPalGateway;
// import express from 'express';
// import { createPayPalOrder, capturePayPalOrder } from '../services/paypal.js';
// import Order from '../Models/Order.js';

// const router = express.Router();


// router.post("/api/orders", async (req, res) => {
//   try {
//     console.log("Received request to create order:", req.body);

//     const { cart, measurements } = req.body;
    
//     if (!cart || !Array.isArray(cart) || cart.length === 0) {
//       return res.status(400).json({ error: "Invalid cart data" });
//     }
    
//     for (const item of cart) {
//       if (!item.id || !item.name || !item.price || !item.quantity) {
//         return res.status(400).json({ 
//           error: "Each cart item must have id, name, price, and quantity" 
//         });
//       }
      
//       if (isNaN(Number(item.price)) || Number(item.price) <= 0) {
//         return res.status(400).json({ error: "Price must be a positive number" });
//       }
      
//       if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0) {
//         return res.status(400).json({ error: "Quantity must be a positive integer" });
//       }
//     }

//     if (measurements) {
//       if (typeof measurements !== 'object') {
//         return res.status(400).json({ error: "Measurements must be an object" });
//       }
//     }

//     const order = await createPayPalOrder(cart, measurements);

//     if (!order || !order.id) {
//       return res.status(500).json({ error: "Failed to create order" });
//     }

//     res.json({ id: order.id });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     res.status(500).json({ 
//       error: "Internal Server Error",
//       message: error.message 
//     });
//   }
// });

// router.post("/api/orders/:orderID/capture", async (req, res) => {
//   try {
//     const { orderID } = req.params;
    
//     if (!orderID) {
//       return res.status(400).json({ error: "Order ID is required" });
//     }
    
//     const captureData = await capturePayPalOrder(orderID);
    
//     if (captureData.status === 'COMPLETED') {
//       // You could send order confirmation email here
//       console.log(`Order ${orderID} completed successfully`);
//     }
    
//     res.json(captureData);
//   } catch (error) {
//     console.error("Error capturing order:", error);
//     res.status(500).json({ 
//       error: "Failed to capture order",
//       message: error.message
//     });
//   }
// });

// // Get order status
// router.get("/api/orders/:orderID", async (req, res) => {
//   try {
//     const { orderID } = req.params;
    
//     if (!orderID) {
//       return res.status(400).json({ error: "Order ID is required" });
//     }
    
//     const order = await Order.findOne({ paypalOrderId: orderID });
    
//     if (!order) {
//       return res.status(404).json({ error: "Order not found" });
//     }
    
//     res.json({
//       id: order.paypalOrderId,
//       status: order.status,
//       items: order.items,
//       totalAmount: order.totalAmount,
//       currency: order.currency,
//       measurements: order.measurements,
//       createdAt: order.createdAt,
//       customer: order.customer
//     });
//   } catch (error) {
//     console.error("Error fetching order:", error);
//     res.status(500).json({ error: "Failed to fetch order details" });
//   }
// });

// export default router;



import express from 'express';
import { createPayPalOrder, capturePayPalOrder } from '../services/paypal.js';
import Order from '../Models/Order.js';
import { sendOrderConfirmationEmail } from '../services/emailNotification.js';

const router = express.Router();

/**
 * Create a new PayPal order
 */
router.post("/api/payments", async (req, res) => {
  try {
    console.log("Received request to create order:", req.body);

    const { cart, measurements, deliveryDetails } = req.body;
    
    // Validate cart
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Invalid cart data" });
    }
    
    // Validate cart items
    for (const item of cart) {
      if (!item.id || !item.name || !item.price || !item.quantity) {
        return res.status(400).json({ 
          error: "Each cart item must have id, name, price, and quantity" 
        });
      }
      
      if (isNaN(Number(item.price)) || Number(item.price) <= 0) {
        return res.status(400).json({ error: "Price must be a positive number" });
      }
      
      if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0) {
        return res.status(400).json({ error: "Quantity must be a positive integer" });
      }
    }

    // Validate measurements (required)
    if (!measurements || typeof measurements !== 'object') {
      return res.status(400).json({ error: "Measurements are required and must be an object" });
    }
    
    const requiredMeasurements = ['height', 'chest', 'waist', 'hips'];
    const missingMeasurements = requiredMeasurements.filter(field => !measurements[field]);
    
    if (missingMeasurements.length > 0) {
      return res.status(400).json({ 
        error: `Missing required measurements: ${missingMeasurements.join(', ')}` 
      });
    }

    // Validate delivery details (required)
    if (!deliveryDetails || typeof deliveryDetails !== 'object') {
      return res.status(400).json({ error: "Delivery details are required and must be an object" });
    }
    
    const requiredDeliveryFields = ['fullName', 'address', 'city', 'postalCode', 'email', 'phone'];
    const missingDeliveryFields = requiredDeliveryFields.filter(field => !deliveryDetails[field]);
    
    if (missingDeliveryFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required delivery fields: ${missingDeliveryFields.join(', ')}` 
      });
    }

    // Create PayPal order with all required data
    const order = await createPayPalOrder(cart, measurements, deliveryDetails);

    if (!order || !order.id) {
      return res.status(500).json({ error: "Failed to create order" });
    }

    res.json({ id: order.id });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      message: error.message 
    });
  }
});

/**
 * Capture a PayPal payment
 */
router.post("/api/payments/:orderID/capture", async (req, res) => {
  try {
    const { orderID } = req.params;
    
    if (!orderID) {
      return res.status(400).json({ error: "Order ID is required" });
    }
    
    // Capture the payment
    const captureData = await capturePayPalOrder(orderID);
    
    if (captureData.status === 'COMPLETED') {
      // Send order confirmation email
      await sendOrderConfirmationEmail(orderID);
      console.log(`Order ${orderID} completed successfully and email sent`);
    }
    
    res.json(captureData);
  } catch (error) {
    console.error("Error capturing order:", error);
    res.status(500).json({ 
      error: "Failed to capture order",
      message: error.message
    });
  }
});

/**
 * Get order status and details
 */
router.get("/api/payments/:orderID", async (req, res) => {
  try {
    const { orderID } = req.params;
    
    if (!orderID) {
      return res.status(400).json({ error: "Order ID is required" });
    }
    
    const order = await Order.findOne({ paypalOrderId: orderID });
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.json({
      id: order.paypalOrderId,
      status: order.status,
      items: order.items,
      totalAmount: order.totalAmount,
      currency: order.currency,
      measurements: order.measurements,
      createdAt: order.createdAt,
      customer: order.customer,
      emailSent: order.emailSent,
      emailSentAt: order.emailSentAt
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

/**
 * Manually trigger sending email for an order (useful for testing or resending)
 */
router.post("/api/payments/:orderID/send-email", async (req, res) => {
  try {
    const { orderID } = req.params;
    
    if (!orderID) {
      return res.status(400).json({ error: "Order ID is required" });
    }
    
    const success = await sendOrderConfirmationEmail(orderID);
    
    if (success) {
      res.json({ message: "Order confirmation email sent successfully" });
    } else {
      res.status(400).json({ error: "Failed to send order confirmation email" });
    }
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get all orders (with pagination and filtering)
 * This endpoint should be secured with authentication in production
 */
router.get("/api/payments", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sort = "createdAt", order = "desc" } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }
    
    const options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
      sort: { [sort]: order === "asc" ? 1 : -1 }
    };
    
    const orders = await Order.find(query, null, options);
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalOrders: total
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

export default router;
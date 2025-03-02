// Replace your existing PayPal routes with these
import express from 'express';
import { createPayPalOrder, capturePayPalOrder } from '../services/paypal.js';
import Order from '../Models/Order.js';

const router = express.Router();

// Create a new PayPal order
router.post("/api/orders", async (req, res) => {
  try {
    console.log("Received request to create order:", req.body);

    const { cart, measurements } = req.body;
    
    // Validate cart data
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Invalid cart data" });
    }
    
    // Validate each cart item
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

    if (measurements) {
      if (typeof measurements !== 'object') {
        return res.status(400).json({ error: "Measurements must be an object" });
      }
    }

    const order = await createPayPalOrder(cart, measurements);

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

// Capture a PayPal payment
router.post("/api/orders/:orderID/capture", async (req, res) => {
  try {
    const { orderID } = req.params;
    
    if (!orderID) {
      return res.status(400).json({ error: "Order ID is required" });
    }
    
    const captureData = await capturePayPalOrder(orderID);
    
    // Process order completion (could trigger email, etc.)
    if (captureData.status === 'COMPLETED') {
      // You could send order confirmation email here
      console.log(`Order ${orderID} completed successfully`);
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

// Get order status (useful for order confirmation page)
router.get("/api/orders/:orderID", async (req, res) => {
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
      customer: order.customer
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

export default router;
// routes/payment.js
import express from 'express';
import { createPayment, capturePayment } from '../services/payment.js';
import Order from '../Models/Order.js';

const router = express.Router();

// Create a payment (generic endpoint for any payment provider)
router.post("/api/payments", async (req, res) => {
  try {
    const { cart, paymentProvider = 'paypal'} = req.body;

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
    
    // Validate payment provider
    const supportedProviders = ['paypal', 'stripe', 'mollie'];
    if (!supportedProviders.includes(paymentProvider)) {
      return res.status(400).json({ error: `Unsupported payment provider: ${paymentProvider}` });
    }

    const payment = await createPayment(cart, paymentProvider);
    res.json(payment);
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ 
      error: "Payment creation failed",
      message: error.message 
    });
  }
});

// Capture a payment (generic endpoint for any payment provider)
router.post("/api/payments/:paymentId/capture", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paymentProvider = 'paypal' } = req.body;
    
    if (!paymentId) {
      return res.status(400).json({ error: "Payment ID is required" });
    }
    
    const captureData = await capturePayment(paymentId, paymentProvider);
    res.json(captureData);
  } catch (error) {
    console.error("Error capturing payment:", error);
    res.status(500).json({ 
      error: "Failed to capture payment",
      message: error.message
    });
  }
});

// Get order status by payment ID (useful for order confirmation page)
router.get("/api/payments/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paymentProvider = 'paypal' } = req.query;
    
    if (!paymentId) {
      return res.status(400).json({ error: "Payment ID is required" });
    }
    
    const order = await Order.findOne({ paymentId, paymentProvider })
      .populate('items.productId');
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.json({
      id: order._id,
      paymentId: order.paymentId,
      paymentProvider: order.paymentProvider,
      status: order.status,
      items: order.items,
      totalAmount: order.totalAmount,
      currency: order.currency,
      customer: order.customer,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

// Get all orders for a customer (e.g. for order history)
router.get("/api/orders", async (req, res) => {
  try {
    const { email, limit = 10, page = 1 } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: "Customer email is required" });
    }
    
    const skip = (page - 1) * limit;
    
    const orders = await Order.find({ 
      'customer.email': email,
      status: 'COMPLETED'
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .select('-paymentDetails');
    
    const totalOrders = await Order.countDocuments({ 
      'customer.email': email,
      status: 'COMPLETED'
    });
    
    res.json({
      orders,
      pagination: {
        total: totalOrders,
        page: Number(page),
        pages: Math.ceil(totalOrders / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({ error: "Failed to fetch order history" });
  }
});

export default router;
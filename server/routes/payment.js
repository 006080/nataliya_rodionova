import express from 'express';
import PaymentService from '../services/paymentService.js';
import Order from '../Models/Order.js';
import { validatePaymentRequest } from '../middleware/paymentValidator.js';

const router = express.Router();

router.post("/api/payments", validatePaymentRequest, async (req, res) => {
  try {
    const { cart, measurements, paymentMethod = 'paypal' } = req.body;
    
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Invalid cart data" });
    }
    
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

    if (measurements && typeof measurements !== 'object') {
      return res.status(400).json({ error: "Measurements must be an object" });
    }

    try {
      const paymentService = new PaymentService(paymentMethod);
      
      const payment = await paymentService.createPayment(cart, measurements);
      
      res.json(payment);
    } catch (error) {
      if (error.message.includes('not implemented')) {
        return res.status(400).json({ 
          error: `Payment method '${paymentMethod}' is not available` 
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ 
      error: "Failed to create payment",
      message: error.message 
    });
  }
});

router.post("/api/payments/:paymentId/capture", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { orderReference, paymentMethod = 'paypal' } = req.body;
    
    if (!paymentId) {
      return res.status(400).json({ error: "Payment ID is required" });
    }
    
    if (!orderReference) {
      return res.status(400).json({ error: "Order reference is required" });
    }
    
    // Check if order exists and is not already paid
    let order;
    
    switch (paymentMethod) {
      case 'paypal':
        order = await Order.findOne({ 'paymentIds.paypalOrderId': paymentId });
        break;
      case 'stripe':
        order = await Order.findOne({ 'paymentIds.stripePaymentIntentId': paymentId });
        break;
      case 'mollie':
        order = await Order.findOne({ 'paymentIds.molliePaymentId': paymentId });
        break;
      default:
        return res.status(400).json({ error: "Invalid payment method" });
    }
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    if (order.isPaid) {
      return res.status(400).json({ 
        error: "This order has already been paid",
        orderId: order._id,
        status: 'COMPLETED' 
      });
    }
    
    const paymentService = new PaymentService(paymentMethod);
    
    const captureData = await paymentService.capturePayment(paymentId, orderReference);
    
    await Order.findByIdAndUpdate(order._id, {
      $push: {
        paymentAttempts: {
          provider: paymentMethod,
          paymentId: paymentId,
          status: captureData.status,
          amount: order.totalAmount,
          timestamp: new Date()
        }
      }
    });
    
    // Process order completion (could trigger email, etc.)
    if (captureData.status === 'COMPLETED') {
      // You could send order confirmation email here
      console.log(`Payment ${paymentId} for order ${orderReference} completed successfully`);
    }
    
    res.json(captureData);
  } catch (error) {
    console.error("Error capturing payment:", error);
    res.status(500).json({ 
      error: "Failed to capture payment",
      message: error.message
    });
  }
});

export default router;
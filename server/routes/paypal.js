import express from 'express';
import { 
  createPayPalOrder, 
  capturePayPalOrder,
  updateOrderStatus,
  getPayPalOrderDetails, 
  cancelOrder
} from '../services/paypal.js';
import Order from '../Models/Order.js';
import { sendOrderStatusEmail } from '../services/emailNotification.js';
import { findAbandonedOrders, syncOrderStatus } from '../services/adminService.js';

const router = express.Router();

/**
 * Create a new PayPal order
 */
router.post("/api/payments", async (req, res) => {
  try {

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
    
    const requiredDeliveryFields = ['fullName', 'address', 'postalCode', 'city', 'country', 'email', 'phone'];
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

      // If user is authenticated, link order to user
      if (req.user && req.user._id) {
        await Order.findOneAndUpdate(
          { paypalOrderId: order.id },
          { user: req.user._id },
          { new: true }
        );
        console.log(`Order ${order.id} linked to user ${req.user._id}`);
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
    
    // Capture the payment - email will be sent automatically if status changes
    const captureData = await capturePayPalOrder(orderID);

    // If user is authenticated, ensure order is linked to their account
    if (req.user && req.user._id) {
      await Order.findOneAndUpdate(
        { paypalOrderId: orderID, user: { $exists: false } },
        { user: req.user._id },
        { new: true }
      );
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

     // If user is authenticated, ensure order is linked to their account
    // But only if the order email matches the user's email
    if (req.user && req.user._id && !order.user) {
      const userEmail = req.user.email.toLowerCase();
      const orderEmail = (order.customer?.email || order.deliveryDetails?.email || '').toLowerCase();
      
      if (userEmail === orderEmail) {
        order.user = req.user._id;
        await order.save();
        console.log(`Order ${orderID} linked to user ${req.user._id}`);
      }
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
      emailSentAt: order.emailSentAt,
      fulfillmentStatus: order.fulfillmentStatus,
      trackingNumber: order.trackingNumber,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      // Include user ID if order is linked to a user
      user: order.user
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
    
    const success = await sendOrderStatusEmail(orderID);
    
    if (success) {
      res.json({ message: "Order status email sent successfully" });
    } else {
      res.status(400).json({ error: "Failed to send order status email" });
    }
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Update order status manually
 */
router.patch("/api/payments/:orderID/status", async (req, res) => {
  try {
    const { orderID } = req.params;
    const { status } = req.body;
    
    if (!orderID) {
      return res.status(400).json({ error: "Order ID is required" });
    }
    
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    
    // Validate status
    const validStatuses = ['CREATED', 'SAVED', 'APPROVED', 'VOIDED', 'COMPLETED', 'PAYER_ACTION_REQUIRED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    // Update status and send notification email
    const updatedOrder = await updateOrderStatus(orderID, status);

    // Handle fulfillment status based on payment status
    if (status === 'COMPLETED' && updatedOrder.fulfillmentStatus === undefined) {
      await Order.findByIdAndUpdate(
        updatedOrder._id,
        { fulfillmentStatus: 'Processing' }
      );
    }
    
    res.json({
      id: updatedOrder.paypalOrderId,
      status: updatedOrder.status,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ 
      error: "Failed to update order status",
      message: error.message
    });
  }
});

/**
 * Sync order with PayPal (useful for ensuring order status is up to date)
 */
router.post("/api/payments/:orderID/sync", async (req, res) => {
  try {
    const { orderID } = req.params;
    
    if (!orderID) {
      return res.status(400).json({ error: "Order ID is required" });
    }
    
    // Get order details from PayPal
    const paypalOrder = await getPayPalOrderDetails(orderID);
    
    // Get current order from database
    const dbOrder = await Order.findOne({ paypalOrderId: orderID });
    
    if (!dbOrder) {
      return res.status(404).json({ error: "Order not found in database" });
    }
    
    // Update order in database if status is different
    if (dbOrder.status !== paypalOrder.status) {
      const updatedOrder = await updateOrderStatus(orderID, paypalOrder.status);
      
      return res.json({
        id: updatedOrder.paypalOrderId,
        status: updatedOrder.status,
        synced: true,
        previousStatus: dbOrder.status,
        message: `Order status synced from PayPal (${dbOrder.status} → ${paypalOrder.status})`
      });
    }
    
    // If status is the same, just return the current order
    res.json({
      id: dbOrder.paypalOrderId,
      status: dbOrder.status,
      synced: false,
      message: "Order status already in sync with PayPal"
    });
  } catch (error) {
    console.error("Error syncing order with PayPal:", error);
    res.status(500).json({ 
      error: "Failed to sync order with PayPal",
      message: error.message
    });
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


/**
 * Cancel order manually
 */
router.post("/api/payments/:orderID/cancel", async (req, res) => {
  try {
    const { orderID } = req.params;
    const { reason } = req.body;
    
    if (!orderID) {
      return res.status(400).json({ error: "Order ID is required" });
    }
    
    // Cancel the order
    const cancelledOrder = await cancelOrder(orderID, reason);

    // Update fulfillment status to match payment status
    await Order.findByIdAndUpdate(
      cancelledOrder._id,
      { fulfillmentStatus: 'Cancelled' }
    );
    
    res.json({
      id: cancelledOrder.paypalOrderId,
      status: cancelledOrder.status,
      message: `Order cancelled successfully: ${reason || 'Payment action not completed within required time'}`
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ 
      error: "Failed to cancel order",
      message: error.message
    });
  }
});


router.post("/api/admin/orders/:orderID/sync", async (req, res) => {
  try {
    const { orderID } = req.params;
    
    if (!orderID) {
      return res.status(400).json({ error: "Order ID is required" });
    }
    
    // Sync the order status (send notifications, cancel reminders, etc.)
    const order = await syncOrderStatus(orderID);
    
    res.json({
      id: order.paypalOrderId,
      status: order.status,
      message: `Order synced successfully: ${order.status}`
    });
  } catch (error) {
    console.error("Error syncing order:", error);
    res.status(500).json({ 
      error: "Failed to sync order",
      message: error.message
    });
  }
});

/**
 * Find abandoned orders (for admin interface)
 */
router.get("/api/admin/orders/abandoned", async (req, res) => {
  try {
    const abandonedOrders = await findAbandonedOrders();
    
    res.json({
      count: abandonedOrders.length,
      orders: abandonedOrders.map(order => ({
        id: order.paypalOrderId,
        status: order.status,
        createdAt: order.createdAt,
        followupReminderSentAt: order.followupReminderSentAt,
        totalAmount: order.totalAmount,
        customerEmail: order.customer?.email || order.deliveryDetails?.email
      }))
    });
  } catch (error) {
    console.error("Error finding abandoned orders:", error);
    res.status(500).json({ 
      error: "Failed to find abandoned orders",
      message: error.message
    });
  }
});


/**
 * Continue payment for an existing order
 * This endpoint checks if an order is available for continuation
 */
router.get("/api/payments/:orderID/continue", async (req, res) => {
  try {
    const { orderID } = req.params;
    
    if (!orderID) {
      return res.status(400).json({ error: "Order ID is required" });
    }
    
    // Check if order exists and is in a state that allows continuing payment
    const order = await Order.findOne({ paypalOrderId: orderID });
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    if (order.status !== 'PAYER_ACTION_REQUIRED' && 
        order.status !== 'CREATED' && 
        order.status !== 'SAVED') {
      return res.status(400).json({ 
        error: "Cannot continue payment for this order",
        message: `Order status is ${order.status} which does not allow continuing payment`
      });
    }
    
    // Get PayPal order details to ensure it's still valid
    try {
      const paypalOrder = await getPayPalOrderDetails(orderID);
      
      if (paypalOrder.status === 'COMPLETED' || 
          paypalOrder.status === 'VOIDED' ||
          paypalOrder.status === 'CANCELLED') {
        
        // Update our database if PayPal has a different status
        if (paypalOrder.status !== order.status) {
          await Order.findOneAndUpdate(
            { paypalOrderId: orderID },
            { status: paypalOrder.status }
          );
        }
        
        return res.status(400).json({ 
          error: "Cannot continue payment for this order",
          message: `Order status in PayPal is ${paypalOrder.status} which does not allow continuing payment`
        });
      }
      
      // Return the order ID to use for payment
      res.json({ 
        id: orderID,
        status: paypalOrder.status,
        message: "Order is available for payment continuation"
      });
      
    } catch (error) {
      console.error("Error getting PayPal order details:", error);
      
      // If we can't get details from PayPal but our DB has it as PAYER_ACTION_REQUIRED,
      // assume it's still valid to continue
      res.json({ 
        id: orderID,
        status: order.status,
        message: "Order is available for payment continuation (based on local status)"
      });
    }
    
  } catch (error) {
    console.error("Error continuing payment:", error);
    res.status(500).json({ 
      error: "Failed to continue payment",
      message: error.message
    });
  }
});

export default router;
import express from 'express';
import Order from '../Models/Order.js';
import { authenticate } from '../middleware/auth.js';
import { businessLogger } from '../middleware/logging.js';
import logger from '../services/logger.js';

const router = express.Router();

router.post('/api/orders/:id/close', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the order
    const order = await Order.findById(id);
    
    if (!order) {
      await logger.warn('ORDER_CLOSE_NOT_FOUND', 'POST /api/orders/:id/close', `Order not found for closing: ${id}`, {
        userId: req.user._id.toString(),
        orderId: id
      });
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Verify the order belongs to the current user
    // const userEmail = req.user.email.toLowerCase();
    // const orderCustomerEmail = (order.customer?.email || '').toLowerCase();
    // const orderDeliveryEmail = (order.deliveryDetails?.email || '').toLowerCase();
    
    // const isOrderOwner = order.user?.equals(req.user._id) || 
    //                     userEmail === orderCustomerEmail 
                        // userEmail === orderDeliveryEmail;
    
    // if (!isOrderOwner && req.user.role !== 'admin') {
    //   await logger.warn('ORDER_CLOSE_UNAUTHORIZED', 'POST /api/orders/:id/close', `Unauthorized order close attempt for order ${id}`, {
    //     userId: req.user._id.toString(),
    //     orderId: id,
    //     userEmail: userEmail,
    //     orderEmail: orderCustomerEmail
    //   });
    //   return res.status(403).json({ error: 'Unauthorized to close this order' });
    // }
    
    // Check if order can be closed (only PaymentActionRequired orders can be closed by user)
    const canClose = order.status === 'PAYER_ACTION_REQUIRED' ||
                     (req.user.role === 'admin'); // Admin can close any order
    
    if (!canClose) {
      await logger.warn('ORDER_CLOSE_INVALID_STATUS', 'POST /api/orders/:id/close', `Invalid order status for closing: ${order.status} for order ${id}`, {
        userId: req.user._id.toString(),
        orderId: id,
        currentStatus: order.status
      });
      return res.status(400).json({ 
        error: "Cannot close order",
        message: `Order with status '${order.status}' cannot be closed`
      });
    }

    // const previousStatus = order.status; 
    // const closeReason = reason || 'Order closed by user';
    

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { 
        status: 'CANCELED',
        updatedAt: new Date(),
        // cancelReason: closeReason,
        // cancelledAt: new Date()
      },
      { new: true }
    );

    businessLogger.orderClosed(id, req.user._id.toString());

    await logger.info('ORDER_CLOSED_SUCCESS', 'POST /api/orders/:id/close', `Order ${id} successfully closed.`, {
      userId: req.user._id.toString(),
      orderId: id,
      // previousStatus: previousStatus,
      newStatus: 'CANCELED',
      // closeReason: closeReason
    });

    
    res.json({
      id: updatedOrder._id,
      status: updatedOrder.status,
      message: "Order closed successfully"
    });
  } catch (error) {
    console.error('Error closing order:', error);
    await logger.error('ORDER_CLOSE_ERROR', 'POST /api/orders/:id/close', `Failed to close order ${req.params.id}: ${error.message}`, {
      userId: req.user._id.toString(),
      orderId: req.params.id
    });
    res.status(500).json({ error: 'Server error - Unable to close order' });
  }
});

export default router;
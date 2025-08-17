import express from 'express';
import Order from '../Models/Order.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/api/orders/:id/close', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the order
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Verify the order belongs to the current user
    const userEmail = req.user.email.toLowerCase();
    const orderCustomerEmail = (order.customer?.email || '').toLowerCase();
    // const orderDeliveryEmail = (order.deliveryDetails?.email || '').toLowerCase();
    
    const isOrderOwner = order.user?.equals(req.user._id) || 
                        userEmail === orderCustomerEmail 
                        // userEmail === orderDeliveryEmail;
    
    if (!isOrderOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to close this order' });
    }
    
    // Check if order can be closed (only PaymentActionRequired orders can be closed by user)
    const canClose = order.status === 'PAYER_ACTION_REQUIRED' ||
                     (req.user.role === 'admin'); // Admin can close any order
    
    if (!canClose) {
      return res.status(400).json({ 
        error: "Cannot close order",
        message: `Order with status '${order.status}' cannot be closed`
      });
    }
    
    // Simple status update - just change to "Cancelled"
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { 
        status: 'CANCELED',
        updatedAt: new Date()
      },
      { new: true }
    );
    
    res.json({
      id: updatedOrder._id,
      status: updatedOrder.status,
      message: "Order closed successfully"
    });
  } catch (error) {
    console.error('Error closing order:', error);
    res.status(500).json({ error: 'Server error - Unable to close order' });
  }
});

export default router;
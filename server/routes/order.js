// server/routes/order.js
import express from 'express';
import Order from '../Models/Order.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/api/orders', authenticate, async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();
    
    // Find both orders linked to user ID AND orders with matching email
    const orders = await Order.find({
      $or: [
        { user: req.user._id },
        { 'customer.email': { $regex: new RegExp(userEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } },
        // { 'deliveryDetails.email': { $regex: new RegExp(userEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } }
      ]
    }).sort({ createdAt: -1 });

    console.log(`Found ${orders.length} orders for user`);
    
    // Link any found orders by email to this user for future queries
    // for (const order of orders) {
    //   if (!order.user) {
    //     order.user = req.user._id;
    //     await order.save();
    //     console.log(`Linked order ${order._id} to user ${req.user._id}`);
    //   }
    // }
    //     //Link any unlinked orders to this user
    //     let linkedCount = 0;
    //     for (const order of orders) {
    //       if (!order.user) {
    //         order.user = req.user._id;
    //         await order.save();
    //         linkedCount++;
    //         console.log(`Linked order ${order._id} to user ${req.user._id}`);
    //       }
    //     }
        
    //     if (linkedCount > 0) {
    //       console.log(`Linked ${linkedCount} previously unlinked orders to user ${req.user._id}`);
    //     }

    const formattedOrders = orders.map(order => ({
      id: order._id,
      paypalOrderId: order.paypalOrderId,
      date: order.createdAt.toISOString().split('T')[0],
      status: order.getStatusText(), 
      total: order.totalAmount,
      isPaid: ['COMPLETED', 'APPROVED'].includes(order.status),
      isDelivered: order.fulfillmentStatus === 'Delivered',
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity
      }))
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Server error - Unable to fetch orders' });
  }
});

/**
 * Get detailed order by ID
 */
router.get('/api/orders/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    // Check if order exists
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify the order belongs to the current user (via ID or email)
    const userEmail = req.user.email.toLowerCase();
    const orderCustomerEmail = (order.customer?.email || '').toLowerCase();
    const orderDeliveryEmail = (order.deliveryDetails?.email || '').toLowerCase();
    
    if (
      // Check if order is linked to user
      !order.user?.equals(req.user._id) && 
      // Or if email matches
      userEmail !== orderCustomerEmail && 
      userEmail !== orderDeliveryEmail && 
      // Unless user is admin
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ error: 'Unauthorized access to this order' });
    }

    // If this is the first time a logged-in user is viewing their order,
    // associate the order with their user account
    if (!order.user && req.user._id) {
      order.user = req.user._id;
      await order.save();
      console.log(`Order ${order._id} associated with user ${req.user._id}`);
    }

    // Format the shipping address
    let formattedShippingAddress = null;
    
    if (order.deliveryDetails) {
      formattedShippingAddress = {
        fullName: order.deliveryDetails.fullName,
        address: order.deliveryDetails.address,
        city: order.deliveryDetails.city,
        state: '', // Add if available
        postalCode: order.deliveryDetails.postalCode,
        country: order.deliveryDetails.country,
        phone: order.deliveryDetails.phone
      };
    } else if (order.shippingAddress) {
      formattedShippingAddress = {
        fullName: order.customer?.name || '',
        address: order.shippingAddress.addressLine1,
        addressLine2: order.shippingAddress.addressLine2 || '',
        city: order.shippingAddress.adminArea2 || '',
        state: order.shippingAddress.adminArea1 || '',
        postalCode: order.shippingAddress.postalCode || '',
        country: order.shippingAddress.countryCode || '',
        phone: order.customer?.phone || ''
      };
    }

    // Format the response
    const orderResponse = {
      id: order._id,
      paypalOrderId: order.paypalOrderId,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      },
      orderItems: order.items.map(item => ({
        id: item.productId,
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
        image: '' // Add image URL if available
      })),
      shippingAddress: formattedShippingAddress,
      paymentMethod: 'PayPal', // Default to PayPal
      totalPrice: order.totalAmount,
      currency: order.currency || 'EUR',
      status: order.getStatusText(), 
      paymentStatus: order.status,
      isPaid: ['COMPLETED', 'APPROVED'].includes(order.status),
      paidAt: order.status === 'COMPLETED' ? order.updatedAt : null,
      isDelivered: order.fulfillmentStatus === 'Delivered',
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt,
      measurements: order.measurements,
      trackingNumber: order.trackingNumber,
      shippedAt: order.shippedAt,
      estimatedDeliveryDate: order.estimatedDeliveryDate
    };

    res.json(orderResponse);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Server error - Unable to fetch order details' });
  }
});

/**
 * Update order fulfillment status (for admin use)
 */
router.patch('/api/orders/:id/fulfillment', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }
    
    // Validate status
    const validStatuses = ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Update fields based on provided data
    const updateData = {};
    
    if (status) {
      updateData.fulfillmentStatus = status;
      
      // Update related timestamps based on status
      if (status === 'Shipped') {
        updateData.shippedAt = new Date();
      } else if (status === 'Delivered') {
        updateData.deliveredAt = new Date();
      } else if (status === 'Cancelled' && !order.cancelledAt) {
        updateData.cancelledAt = new Date();
      }
    }
    
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    
    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    
    res.json({
      id: updatedOrder._id,
      status: updatedOrder.fulfillmentStatus,
      trackingNumber: updatedOrder.trackingNumber,
      message: `Order fulfillment updated successfully`
    });
  } catch (error) {
    console.error('Error updating order fulfillment:', error);
    res.status(500).json({ error: 'Server error - Unable to update order fulfillment' });
  }
});

export default router;
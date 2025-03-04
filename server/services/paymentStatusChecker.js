import cron from 'node-cron';
import Order from '../Models/Order.js';
import PaymentService from './paymentService.js';

export const startPaymentStatusChecker = () => {
  // Run every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    try {
      console.log('Running payment status check...');
      
      // Find orders that are in progress (not paid, not failed)
      const pendingOrders = await Order.find({
        isPaid: false,
        status: { $nin: ['COMPLETED', 'FAILED', 'VOIDED'] },
        createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24h only
      });
      
      console.log(`Found ${pendingOrders.length} pending orders to check`);
      
      // Check status for each order
      for (const order of pendingOrders) {
        const paymentService = new PaymentService(order.paymentMethod);
        
        let paymentId;
        switch (order.paymentMethod) {
          case 'paypal':
            paymentId = order.paymentIds.paypalOrderId;
            break;
          case 'stripe':
            paymentId = order.paymentIds.stripePaymentIntentId;
            break;
          case 'mollie':
            paymentId = order.paymentIds.molliePaymentId;
            break;
        }
        
        if (!paymentId) continue;
        
        try {
          const currentStatus = await paymentService.getPaymentStatus(paymentId);
          
          // Update if status has changed
          if (currentStatus !== order.status) {
            order.status = currentStatus;
            order.isPaid = currentStatus === 'COMPLETED';
            order.updatedAt = new Date();
            if (order.isPaid) {
              order.paidAt = new Date();
            }
            
            await order.save();
            console.log(`Updated order ${order._id} status to ${currentStatus}`);
          }
        } catch (error) {
          console.error(`Error checking payment status for order ${order._id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in payment status checker:', error);
    }
  });
  
  console.log('Payment status checker started');
};
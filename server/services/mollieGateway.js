import PaymentGateway from './paymentGateway.js';
import Order from '../Models/Order.js';
import { createMollieClient } from '@mollie/api-client';

class MollieGateway extends PaymentGateway {
  constructor() {
    super();
    this.mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });
  }
  
  async createPaymentIntent(cart, measurements, orderReference) {
    // Check if payment already exists for this order reference
    const existingOrder = await Order.findOne({ orderReference });
    if (existingOrder && existingOrder.isPaid) {
      throw new Error("This order has already been paid");
    }
    
    // Calculate total amount
    const totalAmount = cart.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    
    try {
      // Create description from cart items
      const description = cart.map(item => 
        `${item.name} x${item.quantity}`
      ).join(', ');
      
      // Create payment in Mollie
      const payment = await this.mollie.payments.create({
        amount: {
          currency: 'EUR',
          value: totalAmount.toFixed(2)
        },
        description: description.substring(0, 100), // Max 100 chars
        redirectUrl: `${process.env.FRONTEND_URL}/order-complete`,
        webhookUrl: `${process.env.API_URL}/api/webhooks/mollie`,
        metadata: {
          orderReference,
          measurements: JSON.stringify(measurements)
        }
      });
      
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
          'paymentIds.molliePaymentId': payment.id,
          paymentMethod: 'mollie',
          status: 'CREATED',
          updatedAt: new Date()
        });
      } else {
        // Create new order
        const newOrder = new Order({
          orderReference,
          paymentMethod: 'mollie',
          paymentIds: {
            molliePaymentId: payment.id
          },
          status: 'CREATED',
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
        id: payment.id,
        status: 'CREATED',
        orderReference,
        checkoutUrl: payment.getCheckoutUrl(), // URL to redirect user to Mollie checkout
      };
    } catch (error) {
      console.error("Error creating Mollie payment:", error);
      throw error;
    }
  }
  
  async capturePayment(paymentId, orderReference) {
    try {
      // Check if order has already been paid
      const existingOrder = await Order.findOne({ 
        orderReference,
        'paymentIds.molliePaymentId': paymentId
      });
      
      if (!existingOrder) {
        throw new Error("Order not found");
      }
      
      if (existingOrder.isPaid) {
        return {
          id: paymentId,
          status: 'COMPLETED',
          orderReference
        };
      }
      
      // Get payment details from Mollie
      const payment = await this.mollie.payments.get(paymentId);
      
      if (payment.status === 'paid') {
        // Update order in MongoDB
        const updatedOrder = await Order.findOneAndUpdate(
          { 'paymentIds.molliePaymentId': paymentId },
          { 
            status: 'COMPLETED',
            isPaid: true,
            paymentDetails: payment,
            updatedAt: new Date()
          },
          { new: true }
        );
        
        console.log("Order updated after capture:", updatedOrder._id);
        
        return {
          id: paymentId,
          status: 'COMPLETED',
          orderReference
        };
      } else {
        throw new Error(`Payment not successful. Status: ${payment.status}`);
      }
    } catch (error) {
      console.error("Error capturing Mollie payment:", error);
      throw error;
    }
  }
  
  async getPaymentStatus(paymentId) {
    try {
      const payment = await this.mollie.payments.get(paymentId);
      
      // Map Mollie status to our status format
      let status;
      switch(payment.status) {
        case 'paid':
          status = 'COMPLETED';
          break;
        case 'pending':
        case 'authorized':
          status = 'APPROVED';
          break;
        case 'open':
          status = 'CREATED';
          break;
        case 'canceled':
        case 'expired':
          status = 'VOIDED';
          break;
        case 'failed':
        default:
          status = 'FAILED';
      }
      
      return status;
    } catch (error) {
      console.error("Error getting Mollie payment status:", error);
      throw error;
    }
  }
}

export default MollieGateway;
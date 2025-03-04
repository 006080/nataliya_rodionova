import PaymentGateway from './paymentGateway.js';
import Order from '../Models/Order.js';
import Stripe from 'stripe'; 

class StripeGateway extends PaymentGateway {
  constructor() {
    super();
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  
  async createPaymentIntent(cart, measurements, orderReference) {
    // Check if payment already exists for this order reference
    const existingOrder = await Order.findOne({ orderReference });
    if (existingOrder && existingOrder.isPaid) {
      throw new Error("This order has already been paid");
    }
    
    const totalAmount = cart.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), 
        currency: 'eur',
        metadata: {
          orderReference,
          measurements: JSON.stringify(measurements)
        }
      }, {
        idempotencyKey: orderReference // Prevents duplicate charges
      });
      
      const orderItems = cart.map(item => ({
        productId: item.id,
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        price: Number(item.price)
      }));
      
      // Check if we need to create a new order or update existing
      if (existingOrder) {
        await Order.findByIdAndUpdate(existingOrder._id, {
          'paymentIds.stripePaymentIntentId': paymentIntent.id,
          paymentMethod: 'stripe',
          status: 'CREATED',
          updatedAt: new Date()
        });
      } else {
        const newOrder = new Order({
          orderReference,
          paymentMethod: 'stripe',
          paymentIds: {
            stripePaymentIntentId: paymentIntent.id
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
        id: paymentIntent.id,
        status: 'CREATED',
        orderReference,
        clientSecret: paymentIntent.client_secret 
      };
    } catch (error) {
      console.error("Error creating Stripe payment:", error);
      throw error;
    }
  }
  
  async capturePayment(paymentId, orderReference) {
    try {
      // Check if order has already been paid
      const existingOrder = await Order.findOne({ 
        orderReference,
        'paymentIds.stripePaymentIntentId': paymentId
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
      
      // Retrieve payment intent to check status
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
      
      if (paymentIntent.status === 'succeeded') {
        const updatedOrder = await Order.findOneAndUpdate(
          { 'paymentIds.stripePaymentIntentId': paymentId },
          { 
            status: 'COMPLETED',
            isPaid: true,
            paymentDetails: paymentIntent,
            updatedAt: new Date(),
            // Extract customer info if available
            ...(paymentIntent.customer && {
              'customer.stripeCustomerId': paymentIntent.customer
            })
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
        throw new Error(`Payment not successful. Status: ${paymentIntent.status}`);
      }
    } catch (error) {
      console.error("Error capturing Stripe payment:", error);
      throw error;
    }
  }
  
  async getPaymentStatus(paymentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
      
      // Map Stripe status to our status format
      let status;
      switch(paymentIntent.status) {
        case 'succeeded':
          status = 'COMPLETED';
          break;
        case 'processing':
          status = 'APPROVED';
          break;
        case 'requires_payment_method':
        case 'requires_confirmation':
        case 'requires_action':
          status = 'CREATED';
          break;
        case 'canceled':
          status = 'VOIDED';
          break;
        default:
          status = 'FAILED';
      }
      
      return status;
    } catch (error) {
      console.error("Error getting Stripe payment status:", error);
      throw error;
    }
  }
}

export default StripeGateway;
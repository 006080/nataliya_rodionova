import PayPalGateway from './paypalGateway.js';
import StripeGateway from './stripeGateway.js';
import MollieGateway from './mollieGateway.js';
import { v4 as uuidv4 } from 'uuid'; 

class PaymentService {
  constructor(paymentMethod = 'paypal') {
    this.paymentMethod = paymentMethod;
    this.gateway = this.createGateway(paymentMethod);
  }
  
  createGateway(method) {
    switch (method) {
      case 'paypal':
        return new PayPalGateway();
      case 'stripe':
       return new StripeGateway();
      case 'mollie':
        return new MollieGateway();
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }
  }
  
  async createPayment(cart, measurements) {
    const orderReference = `order-${uuidv4()}`;
    
    return this.gateway.createPaymentIntent(cart, measurements, orderReference);
  }
  
  async capturePayment(paymentId, orderReference) {
    return this.gateway.capturePayment(paymentId, orderReference);
  }
  
  async getPaymentStatus(paymentId) {
    return this.gateway.getPaymentStatus(paymentId);
  }
}

export default PaymentService;
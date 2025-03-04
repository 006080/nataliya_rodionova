import PayPalGateway from './paypalGateway.js';
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
        // Will be implemented later
        throw new Error('Stripe payment method not implemented yet');
      case 'mollie':
        // Will be implemented later
        throw new Error('Mollie payment method not implemented yet');
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
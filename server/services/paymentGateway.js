class PaymentGateway {
  async createPaymentIntent(cart, measurements, orderReference) {
    throw new Error('Method not implemented');
  }
  
  async capturePayment(paymentId, orderReference) {
    throw new Error('Method not implemented');
  }
  
  async getPaymentStatus(paymentId) {
    throw new Error('Method not implemented');
  }
}

export default PaymentGateway;
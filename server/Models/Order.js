import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderReference: {
    type: String,
    required: true,
    unique: true
  },
  
  paymentMethod: {
    type: String,
    enum: ['paypal', 'stripe', 'mollie'],
    required: true
  },
  
  paymentIds: {
    paypalOrderId: String,
    stripePaymentIntentId: String,
    molliePaymentId: String
  },
  
  status: {
    type: String,
    enum: ['CREATED', 'APPROVED', 'VOIDED', 'COMPLETED', 'SAVED', 'PAYER_ACTION_REQUIRED', 'FAILED'],
    required: true,
    default: 'CREATED'
  },
  
  isPaid: {
    type: Boolean,
    default: false
  },
  
  items: [{
    productId: String,
    name: String,
    description: String,
    quantity: Number,
    price: Number
  }],
  
  measurements: {
    height: String,
    chest: String,
    waist: String,
    hips: String
  },
  
  customer: {
    name: String,
    email: String,
    payerId: String
  },
  
  currency: {
    type: String,
    default: 'EUR'
  },
  
  totalAmount: {
    type: Number,
    required: true
  },
  
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  
  shippingAddress: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Track all payment attempts
  paymentAttempts: [{
    provider: {
      type: String,
      enum: ['paypal', 'stripe', 'mollie'],
      required: true
    },
    paymentId: String,
    status: String,
    amount: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Track when payment was completed
  paidAt: Date,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add pre-save hook to prevent duplicate payments
OrderSchema.pre('save', function(next) {
  // If marking as paid, ensure it wasn't already paid
  if (this.isPaid && !this.isModified('isPaid') && !this.paidAt) {
    this.paidAt = new Date();
  }
  
  // Always update the updatedAt timestamp
  this.updatedAt = new Date();
  
  next();
});

// Add method to check if an order is already paid
OrderSchema.methods.checkAlreadyPaid = function() {
  return this.isPaid && this.paidAt;
};

// Add method to get payment ID based on payment method
OrderSchema.methods.getPaymentId = function() {
  switch(this.paymentMethod) {
    case 'paypal':
      return this.paymentIds.paypalOrderId;
    case 'stripe':
      return this.paymentIds.stripePaymentIntentId;
    case 'mollie':
      return this.paymentIds.molliePaymentId;
    default:
      return null;
  }
};

// Add method to add a payment attempt
OrderSchema.methods.addPaymentAttempt = function(provider, paymentId, status, amount) {
  this.paymentAttempts.push({
    provider,
    paymentId,
    status,
    amount,
    timestamp: new Date()
  });
};

// Add indexes - make sure the indexes on nested fields use sparse option
OrderSchema.index({ orderReference: 1 }, { unique: true });
OrderSchema.index({ 'paymentIds.paypalOrderId': 1 }, { unique: true, sparse: true });
OrderSchema.index({ 'paymentIds.stripePaymentIntentId': 1 }, { unique: true, sparse: true });
OrderSchema.index({ 'paymentIds.molliePaymentId': 1 }, { unique: true, sparse: true });
OrderSchema.index({ status: 1 });
OrderSchema.index({ isPaid: 1 });
OrderSchema.index({ createdAt: 1 });
OrderSchema.index({ 'customer.email': 1 });

const Order = mongoose.model('Order', OrderSchema);

export default Order;
// import mongoose from 'mongoose';

// const OrderSchema = new mongoose.Schema({
//   paypalOrderId: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   status: {
//     type: String,
//     enum: ['CREATED', 'APPROVED', 'VOIDED', 'COMPLETED', 'SAVED', 'PAYER_ACTION_REQUIRED', 'FAILED'],
//     required: true,
//     default: 'CREATED'
//   },
//   items: [{
//     productId: String,
//     name: String,
//     description: String,
//     quantity: Number,
//     price: Number
//   }],
//   customer: {
//     name: String,
//     email: String,
//     paypalPayerId: String
//   },
//   currency: {
//     type: String,
//     default: 'EUR'
//   },
//   totalAmount: {
//     type: Number,
//     required: true
//   },
//   paymentDetails: {
//     type: mongoose.Schema.Types.Mixed
//   },
//   shippingAddress: {
//     type: mongoose.Schema.Types.Mixed
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// // Add index for faster lookups
// OrderSchema.index({ paypalOrderId: 1 });
// OrderSchema.index({ status: 1 });
// OrderSchema.index({ createdAt: 1 });
// OrderSchema.index({ 'customer.email': 1 });

// const Order = mongoose.model('Order', OrderSchema);

// export default Order;


//==============================================================================




// Models/Order.js
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  // Generic payment fields
  paymentProvider: {
    type: String,
    enum: ['paypal', 'stripe', 'mollie'],
    required: true
  },
  paymentId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'CREATED', 'APPROVED', 'COMPLETED', 'VOIDED', 'FAILED', 'PAYER_ACTION_REQUIRED', 'REFUNDED'],
    required: true,
    default: 'PENDING'
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    description: String,
    quantity: Number,
    price: Number
  }],
  customer: {
    name: String,
    email: String,
    paymentProviderId: String,
    phone: String
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
  billingAddress: {
    type: mongoose.Schema.Types.Mixed
  },
  errorMessage: String,
  refundId: String,
  refundDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for faster lookups
OrderSchema.index({ paymentId: 1 });
OrderSchema.index({ paymentProvider: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: 1 });
OrderSchema.index({ 'customer.email': 1 });
OrderSchema.index({ 'items.productId': 1 });

const Order = mongoose.model('Order', OrderSchema);

export default Order;
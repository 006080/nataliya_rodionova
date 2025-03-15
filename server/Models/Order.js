import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const MeasurementSchema = new mongoose.Schema({
  chest: Number,
  waist: Number,
  hips: Number,
  height: Number
}, { _id: false });

const DeliveryDetailsSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  }
}, { _id: false });

const CustomerSchema = new mongoose.Schema({
  name: String,
  email: String,
  paypalPayerId: String,
  phone: String
}, { _id: false });

const ShippingAddressSchema = new mongoose.Schema({
  addressLine1: String,
  addressLine2: String,
  adminArea1: String, // State or province
  adminArea2: String, // City or town
  postalCode: String,
  countryCode: String
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  paypalOrderId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['CREATED', 'SAVED', 'APPROVED', 'VOIDED', 'COMPLETED', 'PAYER_ACTION_REQUIRED'],
    default: 'CREATED'
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  customer: CustomerSchema,
  deliveryDetails: DeliveryDetailsSchema,
  shippingAddress: ShippingAddressSchema,
  measurements: MeasurementSchema,
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Index for faster queries
OrderSchema.index({ paypalOrderId: 1 });
OrderSchema.index({ 'customer.email': 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: 1 });

const Order = mongoose.model('Order', OrderSchema);

export default Order;














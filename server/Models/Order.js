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
  },
  color: {
    type: String,
    default: ''
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
  },
  color: {
    type: String,
    default: ''
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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Add fulfillment status (separate from payment status)
  fulfillmentStatus: {
    type: String,
    enum: ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  
  // Original fields
  paypalOrderId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['CREATED', 'SAVED', 'APPROVED', 'VOIDED', 'COMPLETED', 'PAYER_ACTION_REQUIRED', 'CANCELED'],
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
  initialReminderSent: {
    type: Boolean,
    default: false
  },
  initialReminderSentAt: Date,
  followupReminderSent: {
    type: Boolean,
    default: false
  },
  followupReminderSentAt: Date,
  cancelReason: String,
  cancelledAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date,
  
  // Order fulfillment tracking fields
  trackingNumber: String,
  shippedAt: Date,
  deliveredAt: Date,
  estimatedDeliveryDate: Date
});

// Index for faster queries
OrderSchema.index({ paypalOrderId: 1 });
OrderSchema.index({ 'customer.email': 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: 1 });
OrderSchema.index({ user: 1 }); 
OrderSchema.index({ fulfillmentStatus: 1 }); 

// Virtual for formatted date
OrderSchema.virtual('dateFormatted').get(function() {
  return this.createdAt ? this.createdAt.toISOString().split('T')[0] : '';
});

OrderSchema.methods.getStatusText = function() {
  if (this.status === 'PAYER_ACTION_REQUIRED') return 'Payment Pending';
  if (this.status === 'CANCELED' || this.status === 'VOIDED') return 'Cancelled';
  
  if (this.status === 'Shipped' || this.status === 'SHIPPED') return 'Shipped';
  if (this.status === 'Delivered' || this.status === 'DELIVERED') return 'Delivered';
  
  if (this.fulfillmentStatus === 'Shipped' || 
      this.fulfillmentStatus === 'Delivered' || 
      this.fulfillmentStatus === 'Cancelled') {
    return this.fulfillmentStatus;
  }
  
  if (this.fulfillmentStatus) {
    return this.fulfillmentStatus;
  }
  
  const statusMap = {
    'CREATED': 'Processing',
    'SAVED': 'Processing',
    'APPROVED': 'Processing',
    'COMPLETED': 'Processing'
  };
  
  return statusMap[this.status] || 'Processing';
};

const Order = mongoose.model('Order', OrderSchema);

export default Order;



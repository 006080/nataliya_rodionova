import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String
  },
  imageUrls: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['AVAILABLE', 'RESERVED', 'SOLD'],
    default: 'AVAILABLE'
  },
  category: {
    type: String
  },
  tags: [{
    type: String
  }],
  reservedAt: {
    type: Date
  },
  soldAt: {
    type: Date
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ProductSchema.index({ status: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ tags: 1 });

const Product = mongoose.model('Product', ProductSchema);

export default Product;
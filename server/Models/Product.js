// // Models/Product.js
// import mongoose from 'mongoose';

// const ProductSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   description: {
//     type: String
//   },
//   price: {
//     type: Number,
//     required: true
//   },
//   imageUrl: {
//     type: String
//   },
//   status: {
//     type: String,
//     enum: ['AVAILABLE', 'RESERVED', 'SOLD'],
//     default: 'AVAILABLE'
//   },
//   category: {
//     type: String
//   },
//   tags: [{
//     type: String
//   }],
//   // For tracking reservations
//   reservedAt: {
//     type: Date
//   },
//   // For tracking sales
//   soldAt: {
//     type: Date
//   },
//   // For tracking the order that bought this product
//   orderId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Order'
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

// // Add indexes for faster lookups
// ProductSchema.index({ status: 1 });
// ProductSchema.index({ category: 1 });
// ProductSchema.index({ tags: 1 });

// const Product = mongoose.model('Product', ProductSchema);

// export default Product;


// Models/Product.js



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
  // Add support for multiple images
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
  // For tracking reservations
  reservedAt: {
    type: Date
  },
  // For tracking sales
  soldAt: {
    type: Date
  },
  // For tracking the order that bought this product
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
// scripts/seedProducts.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../Models/Product.js';

// Load environment variables
dotenv.config({ path: './.env.local' });

// Sample product data
const productData = [
  {
    name: 'Silk Scarf',
    description: 'Luxury silk scarf with elegant pattern',
    price: 100.0,
    imageUrl: '/images/products/silk-scarf.jpg',
    status: 'AVAILABLE',
    category: 'Accessories',
    tags: ['silk', 'luxury', 'scarf', 'fashion']
  },
  {
    name: 'Cap',
    description: 'Elegant cap with a matching scarf',
    price: 50.0,
    imageUrl: '/images/products/cap.jpg',
    status: 'AVAILABLE',
    category: 'Accessories',
    tags: ['cap', 'headwear', 'fashion']
  },
  {
    name: 'Leather Wallet',
    description: 'Handcrafted genuine leather wallet',
    price: 75.0,
    imageUrl: '/images/products/wallet.jpg',
    status: 'AVAILABLE',
    category: 'Accessories',
    tags: ['leather', 'wallet', 'handcrafted']
  },
  {
    name: 'Sunglasses',
    description: 'UV-protected stylish sunglasses',
    price: 120.0,
    imageUrl: '/images/products/sunglasses.jpg',
    status: 'AVAILABLE',
    category: 'Accessories',
    tags: ['sunglasses', 'uv-protection', 'summer']
  },
  {
    name: 'Tote Bag',
    description: 'Eco-friendly canvas tote bag',
    price: 45.0,
    imageUrl: '/images/products/tote-bag.jpg',
    status: 'AVAILABLE',
    category: 'Bags',
    tags: ['bag', 'eco-friendly', 'canvas']
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    seedProducts();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Seed function
async function seedProducts() {
  try {
    // Clear existing products (optional - remove if you don't want to clear the collection)
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const result = await Product.insertMany(productData);
    console.log(`${result.length} products inserted successfully`);
    
    // Display the inserted products with their IDs
    console.log('Inserted products with their MongoDB IDs:');
    result.forEach(product => {
      console.log(`${product.name}: ${product._id}`);
    });

    // Close the connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding products:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}
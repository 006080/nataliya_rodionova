import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../Models/Product.js';
import { Cloudinary } from '@cloudinary/url-gen';

dotenv.config({ path: './.env.local' });

const cld = new Cloudinary({
  cloud: {
    cloudName: "dwenvtwyx",
  },
});


const productData = [
  {
    name: 'COLLAR',
    description: 'Made entirely from 100% cotton, this collar ensures comfort and breathability. The ruffled style, adorned with delicate lace detailing, exudes vintage elegance. Convenient drawstrings at the front allow for easy closure or adjustment.',
    price: 180.0,
    // Store the primary image in imageUrl, and additional images in an array if needed
    imageUrl: 'https://res.cloudinary.com/dwenvtwyx/image/upload/collar_vzz5yo',
    imageUrls: ['https://res.cloudinary.com/dwenvtwyx/image/upload/collar_vzz5yo'],
    status: 'AVAILABLE',
    category: 'Accessories',
    tags: ['collar', 'cotton', 'vintage', 'lace', 'handcrafted']
  },
  {
    name: 'SCARF',
    description: 'Made entirely from 100% cotton, this scarf ensures comfort and breathability. The ruffled style, adorned with delicate lace detailing, exudes vintage elegance. Convenient drawstrings at the front allow for easy closure or adjustment.',
    price: 180.0,
    imageUrl: 'https://res.cloudinary.com/dwenvtwyx/image/upload/image_6483441_8_lr6b1a',
    imageUrls: [
      'https://res.cloudinary.com/dwenvtwyx/image/upload/image_6483441_8_lr6b1a',
      'https://res.cloudinary.com/dwenvtwyx/image/upload/image_6483441_6_qhuykn',
      'https://res.cloudinary.com/dwenvtwyx/image/upload/image_6483441_9_txsndd'
    ],
    status: 'AVAILABLE',
    category: 'Accessories',
    tags: ['scarf', 'cotton', 'vintage', 'lace', 'handcrafted']
  },
  {
    name: 'TROUSERS',
    description: 'Made entirely from 100% cotton, these trousers ensure comfort and breathability. The ruffled style, adorned with delicate lace detailing, exudes vintage elegance. Convenient drawstrings at the front allow for easy closure or adjustment.',
    price: 180.0,
    imageUrl: 'https://res.cloudinary.com/dwenvtwyx/image/upload/trousers_x3ryc0',
    imageUrls: ['https://res.cloudinary.com/dwenvtwyx/image/upload/trousers_x3ryc0'],
    status: 'AVAILABLE',
    category: 'Clothing',
    tags: ['trousers', 'cotton', 'vintage', 'lace', 'handcrafted']
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    seedProducts();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

async function seedProducts() {
  try {
    // await Product.deleteMany({});
    // console.log('Cleared existing products');

    const hasImageUrlsField = Object.keys(Product.schema.paths).includes('imageUrls');
    if (!hasImageUrlsField) {
      console.log('Note: Your Product schema might need to be updated to support multiple images');
      console.log('Consider adding an imageUrls array field to your schema');
    }

    const result = await Product.insertMany(productData);
    console.log(`${result.length} products inserted successfully`);

    console.log('Inserted products with their MongoDB IDs:');
    result.forEach(product => {
      console.log(`${product.name}: ${product._id}`);
    });

    console.log('\nProduct data inserted successfully. You might need to:');
    console.log('1. Update your Product schema to support multiple images if needed');
    console.log('2. Update your Shop component to handle the new data structure');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding products:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}
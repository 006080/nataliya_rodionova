// services/product.js
import Product from '../Models/Product.js';

/**
 * Get all available products
 * @param {Object} options - Query options
 * @param {Number} options.limit - Number of products to return
 * @param {Number} options.page - Page number for pagination
 * @param {String} options.category - Filter by category
 * @param {Array} options.tags - Filter by tags
 * @returns {Promise<Object>} - Products and pagination info
 */
export const getProducts = async (options = {}) => {
  try {
    const { 
      limit = 10, 
      page = 1, 
      category = null,
      tags = [],
      status = 'AVAILABLE'
    } = options;
    
    const query = { status };
    
    // Add category filter if provided
    if (category) {
      query.category = category;
    }
    
    // Add tags filter if provided
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }
    
    const skip = (page - 1) * limit;
    
    // Execute query with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination
    const total = await Product.countDocuments(query);
    
    return {
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Get a single product by ID
 * @param {String} id - Product ID
 * @returns {Promise<Object>} - Product object
 */
export const getProductById = async (id) => {
  try {
    const product = await Product.findById(id);
    
    if (!product) {
      throw new Error(`Product not found with ID: ${id}`);
    }
    
    return product;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new product
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} - Created product
 */
export const createProduct = async (productData) => {
  try {
    const newProduct = new Product({
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await newProduct.validate();
    await newProduct.save();
    
    return newProduct;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Update an existing product
 * @param {String} id - Product ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Updated product
 */
export const updateProduct = async (id, updates) => {
  try {
    const product = await Product.findById(id);
    
    if (!product) {
      throw new Error(`Product not found with ID: ${id}`);
    }
    
    // Update fields
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'createdAt') {
        product[key] = updates[key];
      }
    });
    
    product.updatedAt = new Date();
    
    await product.save();
    return product;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a product
 * @param {String} id - Product ID
 * @returns {Promise<Boolean>} - Success status
 */
export const deleteProduct = async (id) => {
  try {
    const result = await Product.findByIdAndDelete(id);
    
    if (!result) {
      throw new Error(`Product not found with ID: ${id}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};
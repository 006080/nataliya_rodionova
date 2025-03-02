// routes/product.js
import express from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct,
  updateProduct,
  deleteProduct
} from '../services/product.js';

const router = express.Router();

// Get all products (with filtering and pagination)
router.get("/api/products", async (req, res) => {
  try {
    const { 
      limit, 
      page, 
      category,
      tags,
      status = 'AVAILABLE'
    } = req.query;
    
    // Parse tags if provided as a comma-separated string
    const parsedTags = tags ? tags.split(',') : [];
    
    const options = { 
      limit: Number(limit) || 10, 
      page: Number(page) || 1,
      category,
      tags: parsedTags,
      status
    };
    
    const result = await getProducts(options);
    res.json(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ 
      error: "Failed to fetch products",
      message: error.message 
    });
  }
});

// Get a single product by ID
router.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(error.message.includes('not found') ? 404 : 500).json({ 
      error: "Failed to fetch product",
      message: error.message 
    });
  }
});

// Create a new product
router.post("/api/products", async (req, res) => {
  try {
    const productData = req.body;
    
    // Basic validation
    if (!productData.name || !productData.price) {
      return res.status(400).json({ 
        error: "Product name and price are required" 
      });
    }
    
    const newProduct = await createProduct(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ 
      error: "Failed to create product",
      message: error.message 
    });
  }
});

// Update a product
router.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedProduct = await updateProduct(id, updates);
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ 
      error: "Failed to update product",
      message: error.message 
    });
  }
});

// Delete a product
router.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteProduct(id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(error.message.includes('not found') ? 404 : 500).json({ 
      error: "Failed to delete product",
      message: error.message 
    });
  }
});

export default router;
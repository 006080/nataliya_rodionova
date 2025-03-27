import express from 'express';
import { authenticate } from '../middleware/auth.js';
import CartItem from '../Models/CartItem.js';

const router = express.Router();

router.get('/api/cart', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    const cartItems = await CartItem.find({ userId });
    
    res.json({
      success: true,
      items: cartItems.map(item => ({
        id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        description: item.description
      }))
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Error fetching cart items' });
  }
});

// Save cart items for authenticated user
router.post('/api/cart', authenticate, async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user._id;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }
    
    // Clear existing cart items for this user
    await CartItem.deleteMany({ userId });
    
    // Insert new cart items
    if (items.length > 0) {
      const cartItems = items.map(item => ({
        userId,
        productId: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`, // Use ID or generate one
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image || '',
        description: item.description || `${item.name} product`,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      await CartItem.insertMany(cartItems);
    }
    
    res.json({
      success: true,
      message: 'Cart saved successfully'
    });
  } catch (error) {
    console.error('Error saving cart:', error);
    res.status(500).json({ error: 'Error saving cart items' });
  }
});

// Delete cart for authenticated user
router.delete('/api/cart', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Delete all cart items for this user
    await CartItem.deleteMany({ userId });
    
    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Error clearing cart' });
  }
});

// Merge guest cart with user cart
router.post('/api/cart/merge', authenticate, async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user._id;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }
    
    // Get existing cart items
    const existingItems = await CartItem.find({ userId });
    
    // Create a map of existing items by productId/name for easy lookup
    const existingItemsMap = new Map();
    existingItems.forEach(item => {
      // First index by productId
      existingItemsMap.set(item.productId, item);
      // Also index by name for fallback matching
      existingItemsMap.set(item.name, item);
    });
    
    // Process items to merge
    const itemsToUpdate = [];
    const itemsToInsert = [];
    
    items.forEach(item => {
      const productId = item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`;
      
      // Look for existing item by id or name
      const existingItem = existingItemsMap.get(productId) || existingItemsMap.get(item.name);
      
      if (existingItem) {
        // Update quantity for existing item
        existingItem.quantity += Number(item.quantity);
        existingItem.updatedAt = new Date();
        itemsToUpdate.push(existingItem);
      } else {
        // Create new cart item
        itemsToInsert.push({
          userId,
          productId,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          image: item.image || '',
          description: item.description || `${item.name} product`,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });
    
    // Perform bulk operations
    const updatePromises = itemsToUpdate.map(item => 
      CartItem.updateOne(
        { _id: item._id }, 
        { $set: { quantity: item.quantity, updatedAt: item.updatedAt } }
      )
    );
    
    await Promise.all(updatePromises);
    
    if (itemsToInsert.length > 0) {
      await CartItem.insertMany(itemsToInsert);
    }
    
    // Fetch updated cart to return
    const updatedCart = await CartItem.find({ userId });
    
    res.json({
      success: true,
      message: 'Cart merged successfully',
      items: updatedCart.map(item => ({
        id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        description: item.description
      }))
    });
  } catch (error) {
    console.error('Error merging cart:', error);
    res.status(500).json({ error: 'Error merging cart items' });
  }
});

export default router;
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
        description: item.description,
        color: item.color 
      }))
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Error fetching cart items' });
  }
});


router.post('/api/cart', authenticate, async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user._id;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }

    await CartItem.deleteMany({ userId });
    
    if (items.length > 0) {
      const cartItems = items.map(item => ({
        userId,
        productId: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`, 
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image || '',
        description: item.description || `${item.name} product`,
        color: item.color || '',
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

router.delete('/api/cart', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
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

router.post('/api/cart/merge', authenticate, async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user._id;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }
    
    const existingItems = await CartItem.find({ userId });
    
    const existingItemsMap = new Map();
    existingItems.forEach(item => {
      const compositeKey = `${item.productId}|${item.color || ''}`;
      existingItemsMap.set(compositeKey, item);
      
      const nameColorKey = `name:${item.name}|${item.color || ''}`;
      existingItemsMap.set(nameColorKey, item);
    });
    
    const itemsToUpdate = [];
    const itemsToInsert = [];
    
    items.forEach(item => {
      const productId = item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`;
      const itemColor = item.color || '';
      
      const compositeKey = `${productId}|${itemColor}`;
      const nameColorKey = `name:${item.name}|${itemColor}`;
      
      const existingItem = existingItemsMap.get(compositeKey) || existingItemsMap.get(nameColorKey);
      
      if (existingItem) {
        existingItem.quantity += Number(item.quantity);
        existingItem.updatedAt = new Date();
        itemsToUpdate.push(existingItem);
      } else {
        itemsToInsert.push({
          userId,
          productId,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          image: item.image || '',
          description: item.description || `${item.name} product`,
          color: itemColor,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });
    
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
        description: item.description,
        color: item.color 
      }))
    });
  } catch (error) {
    console.error('Error merging cart:', error);
    res.status(500).json({ error: 'Error merging cart items' });
  }
});

export default router;
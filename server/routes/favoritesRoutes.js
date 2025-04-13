import express from 'express';
import { authenticate } from '../middleware/auth.js';
import FavoriteItem from '../Models/FavoriteItem.js';

const router = express.Router();

// Get all favorites for a user
router.get('/api/favorites', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const favoriteItems = await FavoriteItem.find({ userId });
    
    res.json({
      success: true,
      items: favoriteItems.map(item => ({
        id: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        description: item.description,
        material: item.material,
        color: item.color,
        addedAt: item.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Error fetching favorite items' });
  }
});

// Save all favorites for a user (replaces existing)
router.post('/api/favorites', authenticate, async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user._id;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }
    
    await FavoriteItem.deleteMany({ userId });
    
    if (items.length > 0) {
      const favoriteItems = items.map(item => ({
        userId,
        productId: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: item.name,
        price: Number(item.price),
        image: item.image || '',
        description: item.description || '',
        material: item.material || '',
        color: item.color || '',
        createdAt: item.addedAt ? new Date(item.addedAt) : new Date(),
        updatedAt: new Date()
      }));
      
      await FavoriteItem.insertMany(favoriteItems);
    }
    
    res.json({
      success: true,
      message: 'Favorites saved successfully'
    });
  } catch (error) {
    console.error('Error saving favorites:', error);
    res.status(500).json({ error: 'Error saving favorite items' });
  }
});

// Toggle a single product in favorites
router.post('/api/favorites/toggle', authenticate, async (req, res) => {
  try {
    const { product } = req.body;
    const userId = req.user._id;
    
    if (!product || !product.id) {
      return res.status(400).json({ error: 'Invalid product data' });
    }
    
    const productId = product.id;
    
    // Check if product already exists in favorites
    const existingFavorite = await FavoriteItem.findOne({ 
      userId, 
      productId 
    });
    
    if (existingFavorite) {
      // Remove from favorites
      await FavoriteItem.deleteOne({ _id: existingFavorite._id });
      
      // Get updated favorites list
      const updatedFavorites = await FavoriteItem.find({ userId });
      
      return res.json({
        success: true,
        added: false,
        message: 'Item removed from favorites',
        items: updatedFavorites.map(item => ({
          id: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          description: item.description,
          material: item.material,
          color: item.color,
          addedAt: item.createdAt
        }))
      });
    } else {
      // Add to favorites
      const newFavorite = new FavoriteItem({
        userId,
        productId,
        name: product.name,
        price: Number(product.price),
        image: product.image || '',
        description: product.description || '',
        material: product.material || '',
        color: product.color || '',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await newFavorite.save();
      
      // Get updated favorites list
      const updatedFavorites = await FavoriteItem.find({ userId });
      
      return res.json({
        success: true,
        added: true,
        message: 'Item added to favorites',
        items: updatedFavorites.map(item => ({
          id: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          description: item.description,
          material: item.material,
          color: item.color,
          addedAt: item.createdAt
        }))
      });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Error updating favorites' });
  }
});

// Clear all favorites for a user
router.delete('/api/favorites', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    await FavoriteItem.deleteMany({ userId });
    
    res.json({
      success: true,
      message: 'Favorites cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing favorites:', error);
    res.status(500).json({ error: 'Error clearing favorites' });
  }
});

// Merge local favorites with database
router.post('/api/favorites/merge', authenticate, async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user._id;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }
    
    // Get existing favorites
    const existingFavorites = await FavoriteItem.find({ userId });
    
    // Create a map of existing product IDs
    const existingProductIds = new Set(existingFavorites.map(item => item.productId));
    
    // Filter out items that are already in favorites
    const newItems = items.filter(item => !existingProductIds.has(item.id));
    
    // Add new items to favorites
    if (newItems.length > 0) {
      const newFavoriteItems = newItems.map(item => ({
        userId,
        productId: item.id || `product-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: item.name,
        price: Number(item.price),
        image: item.image || '',
        description: item.description || '',
        material: item.material || '',
        color: item.color || '',
        createdAt: item.addedAt ? new Date(item.addedAt) : new Date(),
        updatedAt: new Date()
      }));
      
      await FavoriteItem.insertMany(newFavoriteItems);
    }
    
    // Get updated favorites list
    const updatedFavorites = await FavoriteItem.find({ userId });
    
    res.json({
      success: true,
      message: 'Favorites merged successfully',
      items: updatedFavorites.map(item => ({
        id: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        description: item.description,
        material: item.material,
        color: item.color,
        addedAt: item.createdAt
      }))
    });
  } catch (error) {
    console.error('Error merging favorites:', error);
    res.status(500).json({ error: 'Error merging favorites' });
  }
});

export default router;
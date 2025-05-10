import express from 'express';
import User from '../Models/User.js';
import CartItem from '../Models/CartItem.js';
import FavoriteItem from '../Models/FavoriteItem.js';
import Order from '../Models/Order.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Update user profile route
router.put('/api/users/me', authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    
    // Find user by ID
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user data
    if (name) user.name = name;
    
    await user.save();
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User soft deletion route - marks account for deletion but doesn't remove it
router.delete('/api/users/me', authenticate, async (req, res) => {
  try {
    // Find user by ID
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Mark user for deletion
    user.markedForDeletion = true;
    user.deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    
    await user.save();
    
    // Return success response
    res.json({ 
      success: true, 
      message: 'Account scheduled for deletion. You can restore it by logging in within 30 days.',
      deletionDate: user.deletionDate
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Account restoration route - when user logs in within 30 days
router.post('/api/users/restore', authenticate, async (req, res) => {
  try {
    // Find user by ID
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if account is marked for deletion
    if (!user.markedForDeletion) {
      return res.status(400).json({ error: 'Account is not marked for deletion' });
    }
    
    // Restore account
    user.markedForDeletion = false;
    user.deletionDate = undefined;
    
    await user.save();
    
    // Return success response
    res.json({ 
      success: true, 
      message: 'Account restored successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error('Restore user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ADMIN ROUTE: Permanently delete accounts past their deletion date
// This would typically be run as a CRON job
router.post('/api/admin/cleanup-deleted-users', async (req, res) => {
  try {
    // Find users marked for deletion with deletion date in the past
    const usersToDelete = await User.find({
      markedForDeletion: true,
      deletionDate: { $lt: new Date() }
    });
    
    // For each user, delete their associated data
    for (const user of usersToDelete) {
      // Delete cart items
      await CartItem.deleteMany({ userId: user._id });
      
      // Delete favorite items
      await FavoriteItem.deleteMany({ userId: user._id });
      
      // Anonymize orders (don't delete them, as they're part of business records)
      await Order.updateMany(
        { user: user._id },
        { $unset: { user: "" }, anonymized: true }
      );
      
      // Finally delete the user
      await User.deleteOne({ _id: user._id });
    }
    
    res.json({
      success: true,
      deletedCount: usersToDelete.length,
      message: `${usersToDelete.length} expired user accounts permanently deleted`
    });
  } catch (error) {
    console.error('Cleanup deleted users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
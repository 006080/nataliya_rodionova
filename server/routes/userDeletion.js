import express from 'express';
import User from '../Models/User.js';
import CartItem from '../Models/CartItem.js';
import FavoriteItem from '../Models/FavoriteItem.js';
import Order from '../Models/Order.js';
import { authenticate } from '../middleware/auth.js';
import Review from '../Models/Review.js';
import Feedback from '../Models/Feedback.js';

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
    
    // Get deletion reason if provided
    const { reason } = req.body;
    
    // Mark user for deletion
    user.markedForDeletion = true;
    user.deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    
    // Store deletion reason if provided
    if (reason) {
      user.deletionReason = reason;
    }
    
    await user.save();
    
    // Also mark associated data as pending anonymization
    // This helps to identify records that will be anonymized when deletion is finalized
    
    // Mark cart items (optional - these will be deleted anyway)
    await CartItem.updateMany(
      { userId: user._id },
      { $set: { pendingDeletion: true } }
    );
    
    // Mark favorite items (optional - these will be deleted anyway)
    await FavoriteItem.updateMany(
      { userId: user._id },
      { $set: { pendingDeletion: true } }
    );
    
    // Mark feedback from this user for anonymization
    await Feedback.updateMany(
      { email: user.email },
      { $set: { pendingAnonymization: true, anonymizationDate: user.deletionDate } }
    );
    
    // Mark reviews from this user for anonymization
    await Review.updateMany(
      { 
        $or: [
          { email: user.email },  // If review has email field
          { name: user.name }     // Try to match by name as fallback
        ]
      },
      { $set: { pendingAnonymization: true, anonymizationDate: user.deletionDate } }
    );
    
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
// Fixed Account Restoration Route
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
    
    console.log('Restoring account for user:', user._id, user.email);
    console.log('Before restoration:', {
      markedForDeletion: user.markedForDeletion,
      deletionDate: user.deletionDate,
      deletionReason: user.deletionReason
    });
    
    // Restore account - explicitly set fields to ensure they're updated
    const updateResult = await User.updateOne(
      { _id: user._id },
      { 
        $set: { markedForDeletion: false },
        $unset: { 
          deletionDate: "", 
          deletionReason: "" 
        }
      }
    );
    
    console.log('Update result:', updateResult);
    
    // Reload user to verify changes
    const updatedUser = await User.findById(user._id);
    console.log('After restoration:', {
      markedForDeletion: updatedUser.markedForDeletion,
      deletionDate: updatedUser.deletionDate,
      deletionReason: updatedUser.deletionReason
    });
    
    // Also restore associated data marked for anonymization/deletion
    
    // Restore cart items
    await CartItem.updateMany(
      { userId: user._id },
      { $unset: { pendingDeletion: "" } }
    );
    
    // Restore favorite items
    await FavoriteItem.updateMany(
      { userId: user._id },
      { $unset: { pendingDeletion: "" } }
    );
    
    // Restore feedback from this user
    await Feedback.updateMany(
      { email: user.email },
      { $unset: { pendingAnonymization: "", anonymizationDate: "" } }
    );
    
    // Restore reviews from this user
    await Review.updateMany(
      { 
        $or: [
          { email: user.email },  // If review has email field
          { name: user.name }     // Try to match by name as fallback
        ]
      },
      { $unset: { pendingAnonymization: "", anonymizationDate: "" } }
    );
    
    // Return success response
    res.json({ 
      success: true, 
      message: 'Account restored successfully',
      accountRestored: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        emailVerified: updatedUser.emailVerified
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
    
    // For each user, delete or anonymize their associated data
    for (const user of usersToDelete) {
      // Delete cart items
      await CartItem.deleteMany({ userId: user._id });
      
      // Delete favorite items
      await FavoriteItem.deleteMany({ userId: user._id });
      
      // Anonymize orders (don't delete them, as they're part of business records)
      await Order.updateMany(
        { user: user._id },
        { 
          $unset: { user: "" }, 
          $set: { 
            anonymized: true,
            anonymizedAt: new Date()
          } 
        }
      );
      
      // Anonymize feedback submissions
      await Feedback.updateMany(
        { email: user.email },
        {
          $set: {
            name: "Anonymous User",
            surname: "",
            email: "anonymous@deleted.user",
            phone: "",
            anonymized: true,
            anonymizedAt: new Date()
          }
        }
      );
      
      // Anonymize reviews
      await Review.updateMany(
        { 
          $or: [
            { email: user.email }, // If review has email field
            { name: user.name }    // Try to match by name as fallback
          ]
        },
        {
          $set: {
            name: "Anonymous User",
            email: "anonymous@deleted.user",
            ipAddress: "0.0.0.0",
            userAgent: "",
            anonymized: true,
            anonymizedAt: new Date()
          }
        }
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
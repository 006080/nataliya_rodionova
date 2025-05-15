import express from 'express';
import User from '../Models/User.js';
import CartItem from '../Models/CartItem.js';
import FavoriteItem from '../Models/FavoriteItem.js';
import { authenticate } from '../middleware/auth.js';
import Review from '../Models/Review.js';
import Feedback from '../Models/Feedback.js';
import mongoose from 'mongoose';

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

    // For production: 30 days from now
    const deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // For testing: 2 minutes from now (uncomment for testing)
    // const deletionDate = new Date(Date.now() + 2 * 60 * 1000);
    
    user.deletionDate = deletionDate;
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

    // Send account deletion notification email
    try {
      // Import the email service dynamically to avoid circular dependencies
      const accountEmailService = await import('../services/accountEmailService.js');
      await accountEmailService.sendAccountDeletionEmail(user, deletionDate);
      console.log(`Deletion notification email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Error sending account deletion email:', emailError);
      // Continue with the process even if email fails
    }
    
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


router.post('/api/users/restore', authenticate, async (req, res) => {
  try {
    console.log('RESTORE ENDPOINT: Starting account restoration process');
    
    // Find user by ID
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log('RESTORE ENDPOINT: User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if account is marked for deletion
    if (!user.markedForDeletion) {
      console.log('RESTORE ENDPOINT: Account is not marked for deletion');
      return res.status(400).json({ error: 'Account is not marked for deletion' });
    }
    
    console.log('RESTORE ENDPOINT: User before update:', {
      id: user._id.toString(),
      email: user.email,
      markedForDeletion: user.markedForDeletion,
      deletionDate: user.deletionDate,
      deletionReason: user.deletionReason
    });
    
    // This bypasses any Mongoose schema validation or middleware that might interfere
    const updateResult = await mongoose.connection.db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { markedForDeletion: false },
        $unset: { deletionDate: "", deletionReason: "" }
      }
    );
    
    console.log('RESTORE ENDPOINT: Direct MongoDB update result:', updateResult);
    
    // Verify the update worked by fetching the user again
    const updatedUser = await User.findById(user._id);
    
    console.log('RESTORE ENDPOINT: User after update:', {
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      markedForDeletion: updatedUser.markedForDeletion,
      deletionDate: updatedUser.deletionDate,
      deletionReason: updatedUser.deletionReason
    });
    
    // Also restore associated data marked for anonymization/deletion
    console.log('RESTORE ENDPOINT: Restoring associated data');
    
    await Promise.all([
      // Restore cart items
      CartItem.updateMany(
        { userId: user._id },
        { $unset: { pendingDeletion: "" } }
      ),
      
      // Restore favorite items
      FavoriteItem.updateMany(
        { userId: user._id },
        { $unset: { pendingDeletion: "" } }
      ),
      
      // Restore feedback from this user
      Feedback.updateMany(
        { email: user.email },
        { $unset: { pendingAnonymization: "", anonymizationDate: "" } }
      ),
      
      // Restore reviews from this user
      Review.updateMany(
        { 
          $or: [
            { email: user.email },
            { name: user.name }
          ]
        },
        { $unset: { pendingAnonymization: "", anonymizationDate: "" } }
      )
    ]);


      // Send welcome back email
      try {
        // Import the email service dynamically to avoid circular dependencies
        const accountEmailService = await import('../services/accountEmailService.js');
        await accountEmailService.sendAccountRestorationEmail(updatedUser);
        console.log(`Account restoration email sent to ${updatedUser.email}`);
      } catch (emailError) {
        console.error('Error sending account restoration email:', emailError);
        // Continue with the process even if email fails
      }
    
    console.log('RESTORE ENDPOINT: Account restoration complete');
    
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
    console.error('RESTORE ENDPOINT ERROR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


export default router;
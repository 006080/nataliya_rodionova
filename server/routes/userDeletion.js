import express from 'express';
import User from '../Models/User.js';
import CartItem from '../Models/CartItem.js';
import FavoriteItem from '../Models/FavoriteItem.js';
import { authenticate } from '../middleware/auth.js';
import Review from '../Models/Review.js';
import Feedback from '../Models/Feedback.js';
import mongoose from 'mongoose';
import { businessLogger } from '../middleware/logging.js';
import logger from '../services/logger.js';

const router = express.Router();

// Update user profile route
router.put('/api/users/me', authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    
    // Find user by ID
    const user = await User.findById(req.user._id);
    
    if (!user) {
      await logger.warn('USER_UPDATE_NOT_FOUND', 'PUT /api/users/me', `User not found for profile update: ${req.user._id}`, {
        userId: req.user._id.toString()
      });
      return res.status(404).json({ error: 'User not found' });
    }

    const oldName = user.name;
    // Update user data
  if (name && name !== user.name) {
      user.name = name;
      
      await user.save();
      
      // Log profile update
      await logger.info('USER_PROFILE_UPDATED', 'PUT /api/users/me', `User profile updated: ${oldName} → ${name}`, {
        userId: req.user._id.toString()
      });
    } else {
      // No changes made
      await logger.debug('USER_PROFILE_NO_CHANGES', 'PUT /api/users/me', `No profile changes for user: ${user.email}`, {
        userId: req.user._id.toString()
      });
    }
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified
    });
  } catch (error) {
    console.error('Update user error:', error);
    await logger.error('USER_UPDATE_ERROR', 'PUT /api/users/me', `Failed to update user profile: ${error.message}`, {
      userId: req.user._id.toString()
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User soft deletion route - marks account for deletion but doesn't remove it
router.delete('/api/users/me', authenticate, async (req, res) => {
  try {
    // Find user by ID
    const user = await User.findById(req.user._id);
    
    if (!user) {
      await logger.warn('USER_DELETE_NOT_FOUND', 'DELETE /api/users/me', `User not found for deletion: ${req.user._id}`, {
        userId: req.user._id.toString()
      });
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already marked for deletion
    if (user.markedForDeletion) {
      await logger.warn('USER_ALREADY_MARKED', 'DELETE /api/users/me', `User already marked for deletion: ${user.email}`, {
        userId: req.user._id.toString()
      });
      return res.status(400).json({ 
        error: 'Account is already scheduled for deletion',
        deletionDate: user.deletionDate 
      });
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
    
    try {
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
    await logger.info('USER_DATA_MARKED', 'DELETE /api/users/me', `Associated data marked for anonymization for user: ${user.email}`, {
        userId: req.user._id.toString()
      });
    } catch (dataError) {
      await logger.error('USER_DATA_MARK_ERROR', 'DELETE /api/users/me', `Failed to mark associated data for user ${user.email}: ${dataError.message}`, {
        userId: req.user._id.toString()
      });
    }

    // Send account deletion notification email
    try {
      // Import the email service dynamically to avoid circular dependencies
      const accountEmailService = await import('../services/accountEmailService.js');
      await accountEmailService.sendAccountDeletionEmail(user, deletionDate);
      await logger.info('DELETION_EMAIL_SENT', 'DELETE /api/users/me', `Deletion notification email sent to: ${user.email}`, {
        userId: req.user._id.toString()
      });
    } catch (emailError) {
      console.error('Error sending account deletion email:', emailError);
      await logger.error('DELETION_EMAIL_ERROR', 'DELETE /api/users/me', `Failed to send deletion email to ${user.email}: ${emailError.message}`, {
        userId: req.user._id.toString()
      });
      // Continue with the process even if email fails
    }

    businessLogger.accountDeleted(user._id, user.email);
    
    // Return success response
    res.json({ 
      success: true, 
      message: 'Account scheduled for deletion. You can restore it by logging in within 30 days.',
      deletionDate: user.deletionDate
    });
  } catch (error) {
    console.error('Delete user error:', error);
    await logger.error('USER_DELETE_ERROR', 'DELETE /api/users/me', `Failed to delete user account: ${error.message}`, {
      userId: req.user._id.toString()
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/api/users/restore', authenticate, async (req, res) => {
  try {
    await logger.info('USER_RESTORE_START', 'POST /api/users/restore', `Account restoration process started for user: ${req.user._id}`, {
      userId: req.user._id.toString()
    });
    
    // Find user by ID
    const user = await User.findById(req.user._id);
    
    if (!user) {
      await logger.warn('USER_RESTORE_NOT_FOUND', 'POST /api/users/restore', `User not found for restoration: ${req.user._id}`, {
        userId: req.user._id.toString()
      });
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if account is marked for deletion
    if (!user.markedForDeletion) {
      await logger.warn('USER_RESTORE_NOT_MARKED', 'POST /api/users/restore', `Account restoration attempted for non-deleted account: ${user.email}`, {
        userId: req.user._id.toString()
      });
      return res.status(400).json({ error: 'Account is not marked for deletion' });
    }
    
    
    // This bypasses any Mongoose schema validation or middleware that might interfere
    const updateResult = await mongoose.connection.db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { markedForDeletion: false },
        $unset: { deletionDate: "", deletionReason: "" }
      }
    );
    
    await logger.debug('USER_RESTORE_DB_UPDATE', 'POST /api/users/restore', `MongoDB update result: ${JSON.stringify(updateResult)}`, {
      userId: req.user._id.toString()
    });
    
    // Verify the update worked by fetching the user again
    const updatedUser = await User.findById(user._id);
    
    console.log('RESTORE ENDPOINT: User after update:', {
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      markedForDeletion: updatedUser.markedForDeletion,
      deletionDate: updatedUser.deletionDate,
      deletionReason: updatedUser.deletionReason
    });
    
    
    try {
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
    await logger.info('USER_DATA_RESTORED', 'POST /api/users/restore', `Associated data restored for user: ${user.email}`, {
        userId: req.user._id.toString()
      });
    } catch (dataError) {
      await logger.error('USER_DATA_RESTORE_ERROR', 'POST /api/users/restore', `Failed to restore associated data for user ${user.email}: ${dataError.message}`, {
        userId: req.user._id.toString()
      });
    }

      // Send welcome back email
      try {
        // Import the email service dynamically to avoid circular dependencies
        const accountEmailService = await import('../services/accountEmailService.js');
        await accountEmailService.sendAccountRestorationEmail(updatedUser);
        await logger.info('RESTORATION_EMAIL_SENT', 'POST /api/users/restore', `Account restoration email sent to: ${updatedUser.email}`, {
        userId: req.user._id.toString()
      });
      } catch (emailError) {
        console.error('Error sending account restoration email:', emailError);
        await logger.error('RESTORATION_EMAIL_ERROR', 'POST /api/users/restore', `Failed to send restoration email to ${updatedUser.email}: ${emailError.message}`, {
        userId: req.user._id.toString()
        });
        // Continue with the process even if email fails
      }
    
    businessLogger.accountRestored(updatedUser._id, updatedUser.email);
    
    await logger.info('USER_RESTORE_COMPLETE', 'POST /api/users/restore', `Account restoration completed successfully for: ${updatedUser.email}`, {
      userId: req.user._id.toString()
    });

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
    await logger.error('USER_RESTORE_ERROR', 'POST /api/users/restore', `Account restoration failed: ${error.message}`, {
      userId: req.user._id.toString()
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});


export default router;
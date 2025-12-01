import cron from 'node-cron';
import User from '../Models/User.js';
import CartItem from '../Models/CartItem.js';
import FavoriteItem from '../Models/FavoriteItem.js';
import Order from '../Models/Order.js';
import Feedback from '../Models/Feedback.js';
import Review from '../Models/Review.js';
import logger from './logger.js';

export const initializeCleanupJobs = () => {
  // For testing: Schedule user deletion cleanup to run every minute
  // This allows testing with 2-minute deletion periods
  // cron.schedule('* * * * *', async () => {
  //   console.log('Running scheduled user deletion cleanup...');
  //   await cleanupExpiredUserAccounts();
  // });
  
  // For production: Schedule user deletion cleanup to run every day at midnight
  // Uncomment this and comment out the above for production
  
  cron.schedule('0 0 * * *', async () => {
    await logger.info('CLEANUP_SCHEDULED', 'cleanupExpiredUserAccounts', 'Running scheduled user deletion cleanup');
    await cleanupExpiredUserAccounts();
  });
  
  
  // Schedule pending anonymization cleanup to run every day at 1am
  cron.schedule('0 1 * * *', async () => {
    await logger.info('ANONYMIZATION_SCHEDULED', 'processAnonymizations', 'Running scheduled data anonymization');
    await processAnonymizations();
  });
  logger.info('CLEANUP_JOBS_INIT', 'initializeCleanupJobs', 'Cleanup jobs initialized successfully');
};

/**
 * Clean up user accounts that have passed their deletion date
 */
export const cleanupExpiredUserAccounts = async () => {
  try {
    await logger.info('CLEANUP_START', 'cleanupExpiredUserAccounts', 'Starting user account cleanup process');
    // Find users marked for deletion with deletion date in the past
    const usersToDelete = await User.find({
      markedForDeletion: true,
      deletionDate: { $lt: new Date() }
    });
    
    await logger.info('CLEANUP_FOUND_USERS', 'cleanupExpiredUserAccounts', `Found ${usersToDelete.length} expired user accounts to process`);
    
    // Import email service
    let accountEmailService;
    try {
      accountEmailService = await import('../services/accountEmailService.js');
    } catch (importError) {
      console.error('Error importing account email service:', importError);
      await logger.error('CLEANUP_EMAIL_IMPORT_ERROR', 'cleanupExpiredUserAccounts', `Error importing account email service: ${importError.message}`);
    }
    
    // For each user, delete or anonymize their associated data
    for (const user of usersToDelete) {    
      try {
        await logger.info('CLEANUP_USER_START', 'cleanupExpiredUserAccounts', `Processing account deletion for user: ${user._id} (${user.email})`);
        // Store user email for final notification
        const userEmail = user.email;

        const userId = user._id.toString();
        
        // Delete cart items
        await CartItem.deleteMany({ userId: user._id });
        
        // Delete favorite items
        await FavoriteItem.deleteMany({ userId: user._id });
        
        // Anonymize orders
        const orderResult = await Order.updateMany(
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
        const feedbackResult = await Feedback.updateMany(
          { email: user.email },
          {
            $set: {
              name: "Anonymous User",
              surname: "",
              email: "anonymous@deleted.user",
              phone: "",
              anonymized: true,
              anonymizedAt: new Date(),
              pendingAnonymization: false
            }
          }
        );
        
        // Anonymize reviews
        const reviewResult = await Review.updateMany(
          { 
            $or: [
              { email: user.email },
              { name: user.name }
            ]
          },
          {
            $set: {
              name: "Anonymous User",
              email: "anonymous@deleted.user",
              ipAddress: "0.0.0.0",
              userAgent: "",
              anonymized: true,
              anonymizedAt: new Date(),
              pendingAnonymization: false
            }
          }
        );
        
        // Finally delete the user
        await User.deleteOne({ _id: user._id });
        
        // Send final deletion email if email service is available
        if (accountEmailService && userEmail) {
          try {
            await accountEmailService.sendFinalDeletionEmail(userEmail);
            await logger.info('CLEANUP_EMAIL_SENT', 'cleanupExpiredUserAccounts', `Final deletion email sent to ${userEmail}`);
          } catch (emailError) {
            console.error(`Error sending final deletion email to ${userEmail}:`, emailError);
            await logger.error('CLEANUP_EMAIL_ERROR', 'cleanupExpiredUserAccounts', `Error sending final deletion email to ${userEmail}: ${emailError.message}`);
            // Continue with next user even if there's an email error
          }
        }
        
        await logger.info('CLEANUP_USER_SUCCESS', 'cleanupExpiredUserAccounts', `Successfully processed account deletion for user: ${userId}`, {
          userId: userId,
          // cartItemsDeleted: cartResult.deletedCount,
          // favoriteItemsDeleted: favoriteResult.deletedCount,
          ordersAnonymized: orderResult.modifiedCount,
          feedbackAnonymized: feedbackResult.modifiedCount,
          reviewsAnonymized: reviewResult.modifiedCount
        });
      } catch (userError) {
        console.error(`Error processing user ${user._id}:`, userError);
        await logger.error('CLEANUP_USER_ERROR', 'cleanupExpiredUserAccounts', `Error processing user ${user._id}: ${userError.message}`, {
          userId: user._id.toString(),
          email: user.email
        });
        // Continue with next user even if there's an error
      }
    }

    await logger.info('CLEANUP_COMPLETE', 'cleanupExpiredUserAccounts', `User cleanup completed`, {
      totalFound: usersToDelete.length,
    });
    
    return {
      success: true,
      deletedCount: usersToDelete.length
    };
  } catch (error) {
    console.error('Cleanup deleted users error:', error);
    await logger.error('CLEANUP_ERROR', 'cleanupExpiredUserAccounts', `Cleanup process failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Process pending anonymizations for feedback and reviews
 */
export const processAnonymizations = async () => {
  const now = new Date();
  
  try {
    await logger.info('ANONYMIZATION_START', 'processAnonymizations', 'Starting data anonymization process');
    // Process feedback anonymizations
    const feedbackResult = await Feedback.updateMany(
      {
        pendingAnonymization: true,
        anonymizationDate: { $lt: now }
      },
      {
        $set: {
          name: "Anonymous User",
          surname: "",
          email: "anonymous@deleted.user",
          phone: "",
          anonymized: true,
          anonymizedAt: now,
          pendingAnonymization: false
        }
      }
    );
    
    // Process review anonymizations
    const reviewResult = await Review.updateMany(
      {
        pendingAnonymization: true,
        anonymizationDate: { $lt: now }
      },
      {
        $set: {
          name: "Anonymous User",
          email: "anonymous@deleted.user",
          ipAddress: "0.0.0.0",
          userAgent: "",
          anonymized: true,
          anonymizedAt: now,
          pendingAnonymization: false
        }
      }
    );

    const totalAnonymized = feedbackResult.modifiedCount + reviewResult.modifiedCount;
    
    if (totalAnonymized > 0) {
      await logger.info('ANONYMIZATION_COMPLETE', 'processAnonymizations', `Anonymization process completed`, {
        feedbackAnonymized: feedbackResult.modifiedCount,
        reviewsAnonymized: reviewResult.modifiedCount,
        totalAnonymized: totalAnonymized
      });
    } else {
      await logger.debug('ANONYMIZATION_NONE', 'processAnonymizations', 'No items required anonymization');
    }
        
    return {
      success: true,
      feedbackAnonymized: feedbackResult.modifiedCount,
      reviewsAnonymized: reviewResult.modifiedCount,
      totalAnonymized: totalAnonymized
    };
  } catch (error) {
    console.error('Error processing anonymizations:', error);
    await logger.error('ANONYMIZATION_ERROR', 'processAnonymizations', `Anonymization process failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};
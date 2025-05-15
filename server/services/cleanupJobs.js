// import cron from 'node-cron';
// import User from '../Models/User.js';
// import CartItem from '../Models/CartItem.js';
// import FavoriteItem from '../Models/FavoriteItem.js';
// import Order from '../Models/Order.js';
// import Feedback from '../Models/Feedback.js';
// import Review from '../Models/Review.js';


// export const initializeCleanupJobs = () => {
//   // Schedule user deletion cleanup to run every day at midnight
//   cron.schedule('0 0 * * *', async () => {
//     console.log('Running scheduled user deletion cleanup...');
//     await cleanupExpiredUserAccounts();
//   });
  
//   // Schedule pending anonymization cleanup to run every day at 1am
//   cron.schedule('0 1 * * *', async () => {
//     console.log('Running scheduled data anonymization...');
//     await processAnonymizations();
//   });
// };

// /**
//  * Clean up user accounts that have passed their deletion date
//  */
// export const cleanupExpiredUserAccounts = async () => {
//   try {
//     // Find users marked for deletion with deletion date in the past
//     const usersToDelete = await User.find({
//       markedForDeletion: true,
//       deletionDate: { $lt: new Date() }
//     });
    
//     console.log(`Found ${usersToDelete.length} expired user accounts to process`);
    
//     // For each user, delete or anonymize their associated data
//     for (const user of usersToDelete) {
//       console.log(`Processing account deletion for user: ${user._id} (${user.email})`);
      
//       try {
//         // Delete cart items
//         await CartItem.deleteMany({ userId: user._id });
        
//         // Delete favorite items
//         await FavoriteItem.deleteMany({ userId: user._id });
        
//         // Anonymize orders
//         const orderResult = await Order.updateMany(
//           { user: user._id },
//           { 
//             $unset: { user: "" }, 
//             $set: { 
//               anonymized: true,
//               anonymizedAt: new Date()
//             } 
//           }
//         );
        
//         // Anonymize feedback submissions
//         const feedbackResult = await Feedback.updateMany(
//           { email: user.email },
//           {
//             $set: {
//               name: "Anonymous User",
//               surname: "",
//               email: "anonymous@deleted.user",
//               phone: "",
//               anonymized: true,
//               anonymizedAt: new Date(),
//               pendingAnonymization: false
//             }
//           }
//         );
        
//         // Anonymize reviews
//         const reviewResult = await Review.updateMany(
//           { 
//             $or: [
//               { email: user.email },
//               { name: user.name }
//             ]
//           },
//           {
//             $set: {
//               name: "Anonymous User",
//               email: "anonymous@deleted.user",
//               ipAddress: "0.0.0.0",
//               userAgent: "",
//               anonymized: true,
//               anonymizedAt: new Date(),
//               pendingAnonymization: false
//             }
//           }
//         );
        
//         // Finally delete the user
//         await User.deleteOne({ _id: user._id });
        
//         console.log(`Successfully processed account deletion for user: ${user._id}`);
//         console.log(`- Anonymized orders: ${orderResult.modifiedCount}`);
//         console.log(`- Anonymized feedback: ${feedbackResult.modifiedCount}`);
//         console.log(`- Anonymized reviews: ${reviewResult.modifiedCount}`);
//       } catch (userError) {
//         console.error(`Error processing user ${user._id}:`, userError);
//         // Continue with next user even if there's an error
//       }
//     }
    
//     return {
//       success: true,
//       deletedCount: usersToDelete.length
//     };
//   } catch (error) {
//     console.error('Cleanup deleted users error:', error);
//     return {
//       success: false,
//       error: error.message
//     };
//   }
// };

// /**
//  * Process pending anonymizations for feedback and reviews
//  */
// export const processAnonymizations = async () => {
//   const now = new Date();
  
//   try {
//     // Process feedback anonymizations
//     const feedbackResult = await Feedback.updateMany(
//       {
//         pendingAnonymization: true,
//         anonymizationDate: { $lt: now }
//       },
//       {
//         $set: {
//           name: "Anonymous User",
//           surname: "",
//           email: "anonymous@deleted.user",
//           phone: "",
//           anonymized: true,
//           anonymizedAt: now,
//           pendingAnonymization: false
//         }
//       }
//     );
    
//     // Process review anonymizations
//     const reviewResult = await Review.updateMany(
//       {
//         pendingAnonymization: true,
//         anonymizationDate: { $lt: now }
//       },
//       {
//         $set: {
//           name: "Anonymous User",
//           email: "anonymous@deleted.user",
//           ipAddress: "0.0.0.0",
//           userAgent: "",
//           anonymized: true,
//           anonymizedAt: now,
//           pendingAnonymization: false
//         }
//       }
//     );
    
//     console.log(`Anonymization process completed: ${feedbackResult.modifiedCount} feedback and ${reviewResult.modifiedCount} reviews anonymized`);
    
//     return {
//       success: true,
//       feedbackAnonymized: feedbackResult.modifiedCount,
//       reviewsAnonymized: reviewResult.modifiedCount
//     };
//   } catch (error) {
//     console.error('Error processing anonymizations:', error);
//     return {
//       success: false,
//       error: error.message
//     };
//   }
// };




// Modified cleanupJobs.js with more frequent schedule for testing
import cron from 'node-cron';
import User from '../Models/User.js';
import CartItem from '../Models/CartItem.js';
import FavoriteItem from '../Models/FavoriteItem.js';
import Order from '../Models/Order.js';
import Feedback from '../Models/Feedback.js';
import Review from '../Models/Review.js';

export const initializeCleanupJobs = () => {
  // For testing: Schedule user deletion cleanup to run every minute
  // This allows testing with 2-minute deletion periods
  cron.schedule('* * * * *', async () => {
    console.log('Running scheduled user deletion cleanup...');
    await cleanupExpiredUserAccounts();
  });
  
  // For production: Schedule user deletion cleanup to run every day at midnight
  // Uncomment this and comment out the above for production
  /*
  cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled user deletion cleanup...');
    await cleanupExpiredUserAccounts();
  });
  */
  
  // Schedule pending anonymization cleanup to run every day at 1am
  cron.schedule('0 1 * * *', async () => {
    console.log('Running scheduled data anonymization...');
    await processAnonymizations();
  });
};

/**
 * Clean up user accounts that have passed their deletion date
 */
export const cleanupExpiredUserAccounts = async () => {
  try {
    // Find users marked for deletion with deletion date in the past
    const usersToDelete = await User.find({
      markedForDeletion: true,
      deletionDate: { $lt: new Date() }
    });
    
    console.log(`Found ${usersToDelete.length} expired user accounts to process`);
    
    // Import email service
    let accountEmailService;
    try {
      accountEmailService = await import('../services/accountEmailService.js');
    } catch (importError) {
      console.error('Error importing account email service:', importError);
    }
    
    // For each user, delete or anonymize their associated data
    for (const user of usersToDelete) {
      console.log(`Processing account deletion for user: ${user._id} (${user.email})`);
      
      try {
        // Store user email for final notification
        const userEmail = user.email;
        
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
            console.log(`Final deletion email sent to ${userEmail}`);
          } catch (emailError) {
            console.error(`Error sending final deletion email to ${userEmail}:`, emailError);
            // Continue with next user even if there's an email error
          }
        }
        
        console.log(`Successfully processed account deletion for user: ${user._id}`);
        console.log(`- Anonymized orders: ${orderResult.modifiedCount}`);
        console.log(`- Anonymized feedback: ${feedbackResult.modifiedCount}`);
        console.log(`- Anonymized reviews: ${reviewResult.modifiedCount}`);
      } catch (userError) {
        console.error(`Error processing user ${user._id}:`, userError);
        // Continue with next user even if there's an error
      }
    }
    
    return {
      success: true,
      deletedCount: usersToDelete.length
    };
  } catch (error) {
    console.error('Cleanup deleted users error:', error);
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
    
    console.log(`Anonymization process completed: ${feedbackResult.modifiedCount} feedback and ${reviewResult.modifiedCount} reviews anonymized`);
    
    return {
      success: true,
      feedbackAnonymized: feedbackResult.modifiedCount,
      reviewsAnonymized: reviewResult.modifiedCount
    };
  } catch (error) {
    console.error('Error processing anonymizations:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
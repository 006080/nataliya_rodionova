import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const BlacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true // Add index for performance
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0 // Auto-delete expired tokens
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // Add index for cleanup queries
  },
  userId: {
    type: String,
    index: true // Add index for user-specific queries
  }
});

// Create model if it doesn't exist
const BlacklistedToken = mongoose.models.BlacklistedToken || 
  mongoose.model('BlacklistedToken', BlacklistedTokenSchema);

export const addToBlacklist = async (token) => {
  try {
    if (!token) {
      console.log("No token provided to blacklist");
      return false;
    }
    
    // Decode token to get expiration and user ID
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, { ignoreExpiration: true });
    const expiresAt = new Date(decoded.exp * 1000);
    const userId = decoded.sub;
    
    // Store in blacklist
    await BlacklistedToken.create({ token, expiresAt, userId });
    
    // Periodic cleanup of expired tokens that weren't auto-deleted
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    await BlacklistedToken.deleteMany({ 
      expiresAt: { $lt: new Date() },
      createdAt: { $lt: oneHourAgo }
    });
    
    return true;
  } catch (error) {
    console.error('Error blacklisting token:', error);
    return false;
  }
};

export const isBlacklisted = async (token) => {
  try {
    if (!token) return true; // Consider missing tokens as blacklisted
    
    const found = await BlacklistedToken.findOne({ token });
    return !!found;
  } catch (error) {
    console.error('Error checking blacklisted token:', error);
    return true; // On error, consider token blacklisted for security
  }
};

export const blacklistAllUserTokens = async (userId) => {
  try {
    // Find all tokens for this user
    const userTokens = await BlacklistedToken.find({ userId });
    
    // Return the count of tokens found
    return userTokens.length;
  } catch (error) {
    console.error('Error blacklisting user tokens:', error);
    return 0;
  }
};

// Admin function to clear old blacklisted tokens
export const cleanupBlacklist = async () => {
  try {
    const result = await BlacklistedToken.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up blacklist:', error);
    return 0;
  }
};
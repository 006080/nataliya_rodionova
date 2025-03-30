import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const BlacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0 // Auto-delete expired tokens
  }
});

const BlacklistedToken = mongoose.model('BlacklistedToken', BlacklistedTokenSchema);

export const addToBlacklist = async (token) => {
  try {
    // Decode token to get expiration
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET, { ignoreExpiration: true });
    const expiresAt = new Date(decoded.exp * 1000);
    
    // Store in blacklist
    await BlacklistedToken.create({ token, expiresAt });
    return true;
  } catch (error) {
    console.error('Error blacklisting token:', error);
    return false;
  }
};

export const isBlacklisted = async (token) => {
  const found = await BlacklistedToken.findOne({ token });
  return !!found;
};


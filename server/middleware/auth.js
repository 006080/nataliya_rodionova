// server/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../Models/User.js';
import { rateLimit } from 'express-rate-limit';

// Environment variables
const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES = '15m',
  JWT_REFRESH_EXPIRES = '7d',
} = process.env;


// Generate tokens with complete user data in the payload
export const generateTokens = (userId, user = {}) => {
  // Create a payload with better error handling
  // Make sure user is always at least an empty object
  const userData = user || {};
  
  const payload = {
    sub: userId,
    // Include other essential user data with fallbacks
    name: userData.name || '',
    email: userData.email || '',
    emailVerified: userData.emailVerified || false,
    role: userData.role || 'customer'
  };

  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES,
  });
  
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES,
  });
  
  return { accessToken, refreshToken };
};


// Verify JWT token
export const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

// Auth middleware for protected routes
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    // Verify token
    const decoded = verifyToken(token, JWT_ACCESS_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
    
    // Find user
    const user = await User.findById(decoded.sub).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Rate limiters
export const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

export const refreshTokenLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 60, // 10 requests per IP
  standardHeaders: true, 
  legacyHeaders: false,
  message: { error: 'Too many token refresh attempts. Please try again later.' },
});

// Authorization middleware for specific roles
export const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Authentication required.' });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
    }
    
    next();
  };
};

// Store IP and user agent with login attempts
export const trackLoginAttempts = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return next();
    }
    
    const user = await User.findOne({ email });
    
    if (user) {
      // Track login attempt
      user.loginAttempts.push({
        timestamp: new Date(),
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        successful: false, // Will be updated on successful login
      });
      
      // Limit array size to prevent DoS
      if (user.loginAttempts.length > 10) {
        user.loginAttempts = user.loginAttempts.slice(-10);
      }
      
      await user.save();
    }
    
    next();
  } catch (error) {
    console.error('Error tracking login attempt:', error);
    next();
  }
};

// Middleware to extend user session based on activity
export const extendSession = (req, res, next) => {
  if (req.user) {
    // Generate new tokens
    const { accessToken } = generateTokens(req.user._id);
    
    // Add new token to response header
    res.set('X-New-Access-Token', accessToken);
  }
  next();
};
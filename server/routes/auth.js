import express from 'express';
import bcrypt from 'bcrypt';
import User from '../Models/User.js';
import crypto from 'crypto';
import { 
  generateTokens, 
  verifyToken, 
  loginLimiter, 
  refreshTokenLimiter, 
  trackLoginAttempts 
} from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';
import { generateVerificationToken, sendVerificationEmail } from '../services/emailVerification.js';

const router = express.Router();

// server/routes/auth.js - Improved login route with better verification handling
router.post('/api/auth/login', loginLimiter, trackLoginAttempts, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for email:', email);
    
    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    
    // Find user with password explicitly included
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    
    console.log('User lookup result:', {
      email: normalizedEmail,
      userFound: !!user,
      hasPassword: user ? !!user.password : false
    });
    
    if (!user) {
      console.log('User not found with email:', normalizedEmail);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    
    // Check if account is locked and handle temporary lockouts
    if (user.locked) {
      // Define lockout period (1 hour)
      const lockoutDuration = 60 * 60 * 1000; // 1 hour in milliseconds
      
      // Only process if we have a lockedAt timestamp
      if (user.lockedAt) {
        const lockExpires = new Date(user.lockedAt.getTime() + lockoutDuration);
        
        // If lock period has expired, automatically unlock the account
        if (Date.now() > lockExpires.getTime()) {
          console.log('Lock period expired, unlocking account for:', email);
          user.locked = false;
          user.failedLoginAttempts = 0;
          // Continue with login process
        } else {
          // Account is still locked - calculate and show remaining time
          const remainingMinutes = Math.ceil((lockExpires.getTime() - Date.now()) / 60000);
          console.log(`Account for ${email} is temporarily locked. ${remainingMinutes} minutes remaining.`);
          
          return res.status(403).json({ 
            error: `Your account is temporarily locked due to multiple failed attempts. Please try again in ${remainingMinutes} minute(s).`
          });
        }
      } else {
        // If for some reason lockedAt is missing, default to a full lockout period
        console.log('Account is locked but missing lockedAt timestamp');
        return res.status(403).json({ 
          error: 'Your account is temporarily locked. Please try again in 60 minutes.'
        });
      }
    }

    // Verify password exists
    if (!user.password) {
      console.error('Password field missing for user:', email);
      return res.status(500).json({ error: 'Account configuration error.' });
    }
    
    // Verify password with better error handling
    let validPassword = false;
    try {
      validPassword = await user.comparePassword(password);
      console.log('Password verification result:', validPassword);
    } catch (bcryptError) {
      console.error('bcrypt.compare error:', bcryptError);
      return res.status(500).json({ error: 'Error verifying credentials.' });
    }
    
    if (!validPassword) {
      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      
      console.log(`Failed login attempt ${user.failedLoginAttempts} for user:`, email);
      
      // Lock account after 5 failed attempts (with temporary lockout)
      if (user.failedLoginAttempts >= 5) {
        user.locked = true;
        user.lockedAt = new Date();
        
        await user.save();
        return res.status(403).json({ 
          error: 'Your account has been temporarily locked due to multiple failed login attempts. Please try again after 1 hour.' 
        });
      }
      
      await user.save();
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if email is verified with detailed status info
    console.log(`User ${email} email verification status:`, user.emailVerified);

    // IMPROVED: Check if email is verified with more details in response
    if (!user.emailVerified) {
      // Check if there's a pending verification
      const hasToken = !!user.emailVerificationToken;
      const isExpired = user.emailVerificationExpires && user.emailVerificationExpires < Date.now();
      
      return res.status(403).json({ 
        error: 'Please verify your email address before logging in.',
        needsVerification: true,
        verificationDetails: {
          email: user.email,
          hasPendingToken: hasToken,
          isTokenExpired: isExpired,
          tokenExpires: isExpired ? 'expired' : (user.emailVerificationExpires ? user.emailVerificationExpires : null)
        }
      });
    }
    
    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.locked = false; // Ensure account is unlocked
    
    // Update last login info
    user.lastLogin = new Date();
    user.lastLoginIp = req.ip;
    
    // Mark login attempt as successful
    const latestLoginAttempt = user.loginAttempts[user.loginAttempts.length - 1];
    if (latestLoginAttempt) {
      latestLoginAttempt.successful = true;
    }
    
    await user.save();
    console.log('Login successful for user:', email);
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Store refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    // Return access token and user info
    res.json({
      accessToken,
      refreshToken, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});







// Refresh token route
router.post('/api/auth/refresh-token', refreshTokenLimiter, async (req, res) => {
  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not found.' });
    }
    
    // Verify refresh token
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }
    
    // Find user
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }
    
    // Check if account is locked
    if (user.locked) {
      return res.status(403).json({ error: 'Account is locked. Please contact support.' });
    }
    
    // Generate new tokens
    const tokens = generateTokens(user._id);
    
    // Update refresh token cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    // Return new access token
    res.json({ accessToken: tokens.accessToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Store refresh token in cookie (called from client-side)
router.post('/api/auth/store-refresh-token', (req, res) => {
  console.log('Received refreshToken:!!!!!!!!!!!', req.body.refreshToken);

  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required.' });
    }
    
    // Store in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Store token error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Logout route
router.post('/api/auth/logout', (req, res) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Register route (with rate limiting)
const registerLimiter = rateLimit({
  // windowMs: 60 * 60 * 1000, // 1 hour
  windowMs: 1 * 60 * 1000, // 1 min
  max: 3, // 3 accounts per IP per hour
  message: { error: 'Too many accounts created. Please try again later.' },
});

router.post('/api/auth/register', registerLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }
    
    // Check password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use.' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);



              // Generate email verification token
              const { token, hashedToken } = generateVerificationToken();
    
                  // Create user with verification token
              const newUser = new User({
                name,
                email,
                password: hashedPassword,
                role: 'customer',
                registeredAt: new Date(),
                registrationIp: req.ip,
                emailVerificationToken: hashedToken,
                emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
              });

    // Create user
    // const newUser = new User({
    //   name,
    //   email,
    //   password: hashedPassword,
    //   role: 'customer', // Default role
    //   registeredAt: new Date(),
    //   registrationIp: req.ip,
    // });
    
    await newUser.save();


                // Send verification email
                try {
                  await sendVerificationEmail(email, name, token);
                  console.log('Verification email sent to:', email);
                } catch (emailError) {
                  console.error('Error sending verification email:', emailError);
                  // Continue with registration even if email fails
                }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser._id);
    
    // Store refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    // Return access token and user info
    res.status(201).json({
      accessToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        emailVerified: newUser.emailVerified,    // Add emailVerified field to response
      },
      message: 'Registration successful. Please verify your email address.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


// Fixed verification route that handles already verified users
router.get('/api/auth/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    console.log('Email verification request received for token:', token);
    
    // Hash the token to compare with stored token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    console.log('Looking for user with token hash:', hashedToken);
    
    // First, try to find by token
    let user = await User.findOne({
      emailVerificationToken: hashedToken
    });
    
    // Log the user if found
    if (user) {
      console.log('User found with token:', user.email);
    } else {
      console.log('No user found with this token hash');
    }
    
    // If no user found with token, we need to check if this token was previously used
    if (!user) {
      // This is the key part - extract email from token if possible
      const emailMatch = token.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      let email = null;
      
      if (emailMatch) {
        email = emailMatch[0];
        console.log('Extracted email from token:', email);
      }
      
      if (email) {
        // Try to find a user with this email that's already verified
        const verifiedUser = await User.findOne({
          email: email,
          emailVerified: true
        });
        
        if (verifiedUser) {
          console.log('Found already verified user with email:', email);
          return res.status(200).json({ 
            message: 'Your email is already verified. You can now login to your account.',
            verified: true
          });
        }
      }
      
      // If we get here, no user with this token and no verified user with extracted email
      return res.status(400).json({ 
        error: 'Invalid verification link. Please request a new one.',
        verified: false
      });
    }
    
    // Check if token is expired
    if (user.emailVerificationExpires && user.emailVerificationExpires < Date.now()) {
      console.log('Token is expired for user:', user.email);
      return res.status(400).json({ 
        error: 'Verification link has expired. Please request a new one.',
        verified: false
      });
    }
    
    // Check if already verified
    if (user.emailVerified) {
      console.log('User already verified:', user.email);
      return res.status(200).json({ 
        message: 'Your email is already verified. You can now login to your account.',
        verified: true
      });
    }
    
    // Mark email as verified and remove verification fields
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    
    await user.save();
    console.log('User email marked as verified:', user.email);
    
    // Return success response
    res.status(200).json({ 
      message: 'Email verification successful. You can now login to your account.',
      verified: true
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      error: 'Internal server error.',
      verified: false
    });
  }
});



// Improved resend verification endpoint with better error handling
router.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('Resend verification request for:', email);
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    // If no user found, return generic success to avoid email enumeration
    if (!user) {
      console.log('Resend verification requested for non-existent email:', email);
      return res.status(200).json({ 
        message: 'If your email exists in our system, you will receive a verification email shortly.' 
      });
    }
    
    // Check if email is already verified
    if (user.emailVerified) {
      console.log('Email already verified:', email);
      return res.status(200).json({ 
        message: 'Your email is already verified. You can now login to your account.',
        alreadyVerified: true
      });
    }
    
    // Generate new verification token
    const { token, hashedToken } = generateVerificationToken(email);
    
    // Update user verification token and expiry
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await user.save();
    console.log('Updated verification token for user:', email);
    
    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, token);
      console.log('Verification email sent to:', email);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return res.status(500).json({ 
        error: 'Failed to send verification email. Please try again later.' 
      });
    }
    
    // Return success response
    res.status(200).json({ 
      message: 'Verification email has been sent to your address.',
      email: user.email
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


router.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    // Always return success, even if user is not found (security best practice)
    if (!user) {
      return res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link.' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token before storing it
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set token expiration (1 hour)
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();
    
    // Send email with reset link
    // TODO: Implement email sending
    // For now, we'll just log the token for testing
    console.log('Password reset token:', resetToken);
    console.log('Reset link:', `http://localhost:3000/reset-password/${resetToken}`);
    
    res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link.' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Reset password with token
router.post('/api/auth/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }
    
    // Hash the token to compare with stored hashed token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }
    
    // Update password
    user.password = password;
    
    // Clear reset token fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // Reset failed login attempts
    user.failedLoginAttempts = 0;
    user.locked = false;
    
    await user.save();
    
    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Admin route to reset a user's password
router.post('/api/admin/reset-user-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    // Update password
    user.password = newPassword;
    
    // Reset failed login attempts
    user.failedLoginAttempts = 0;
    user.locked = false;
    
    await user.save();
    
    res.status(200).json({ message: 'User password has been reset successfully.' });
  } catch (error) {
    console.error('Admin password reset error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


export default router;
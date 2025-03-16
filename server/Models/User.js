import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const LoginAttemptSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  ip: String,
  userAgent: String,
  successful: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false // Don't include in queries by default
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'staff'],
    default: 'customer'
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  locked: {
    type: Boolean,
    default: false
  },
  lockedAt: Date,
  lastLogin: Date,
  lastLoginIp: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  registeredAt: {
    type: Date,
    default: Date.now
  },
  registrationIp: String,
  lastPasswordChange: Date,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  loginAttempts: [LoginAttemptSchema],
  activeTokens: [{
    token: String,
    expires: Date,
    userAgent: String,
    ip: String,
    lastUsed: Date
  }]
}, { timestamps: true });

// Fix the duplicate index issue by removing these
// UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ registeredAt: 1 });
UserSchema.index({ emailVerificationToken: 1 }, { sparse: true });
UserSchema.index({ passwordResetToken: 1 }, { sparse: true });

/**
 * Improved password comparison method with better error handling
 * @param {string} candidatePassword - The password to compare
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // If password doesn't exist or is empty
    if (!this.password) {
      console.error('User has no password to compare against');
      return false;
    }
    
    // Handle non-bcrypt passwords (for migration cases)
    if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
      console.warn('Password for user appears to not be hashed with bcrypt');
      // Simple equality check for plain text password (only for migration)
      return this.password === candidatePassword;
    }
    
    // Standard bcrypt comparison
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

/**
 * Enhanced pre-save middleware to hash password with better error handling
 */
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Skip hashing if the password is already hashed
    if (this.password && (this.password.startsWith('$2a$') || this.password.startsWith('$2b$'))) {
      console.log('Password appears to be already hashed, skipping hashing');
      return next();
    }
    
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    
    // Track password change date
    this.lastPasswordChange = new Date();
    
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Static methods
UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

UserSchema.statics.findByResetToken = function(token) {
  return this.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  });
};

UserSchema.statics.findByVerificationToken = function(token) {
  return this.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });
};

/**
 * Reset a user's password with proper hashing
 * @param {string} userId - The user ID
 * @param {string} newPassword - The new plain-text password
 * @returns {Promise<Object>} - Updated user or error
 */
UserSchema.statics.resetPassword = async function(userId, newPassword) {
  try {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate salt and hash
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Reset security fields
    user.failedLoginAttempts = 0;
    user.locked = false;
    user.lastPasswordChange = new Date();
    
    return await user.save();
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

/**
 * Utility to test if bcrypt is functioning correctly
 */
// UserSchema.statics.testBcrypt = async function() {
//   try {
//     console.log('Testing bcrypt functionality...');
//     const testPassword = 'TestPassword123!';
    
//     // Generate salt
//     const salt = await bcrypt.genSalt(10);
//     console.log('Generated salt:', salt);
    
//     // Hash password
//     const hash = await bcrypt.hash(testPassword, salt);
//     console.log('Hashed password:', hash);
    
//     // Compare correctly
//     const validComparison = await bcrypt.compare(testPassword, hash);
//     console.log('Valid comparison result:', validComparison);
    
//     // Compare incorrectly
//     const invalidComparison = await bcrypt.compare('WrongPassword', hash);
//     console.log('Invalid comparison result:', invalidComparison);
    
//     return {
//       success: true,
//       validComparison,
//       invalidComparison,
//       hash
//     };
//   } catch (error) {
//     console.error('Bcrypt test error:', error);
//     return {
//       success: false,
//       error: error.message
//     };
//   }
// };

// /**
//  * Migrate plain-text passwords to hashed ones
//  * Call this method as needed for system maintenance
//  */
// UserSchema.statics.migratePasswords = async function() {
//   try {
//     console.log('Starting password migration...');
    
//     // Find users with potentially unhashed passwords
//     // This requires 'password' field to be explicitly included
//     const users = await this.find().select('+password');
//     let migratedCount = 0;
    
//     for (const user of users) {
//       // Skip if password doesn't exist
//       if (!user.password) continue;
      
//       // Check if password is not a bcrypt hash
//       if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
//         console.log(`Migrating password for user: ${user._id}`);
        
//         // Store original password
//         const plainPassword = user.password;
        
//         // Generate hash
//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(plainPassword, salt);
//         user.lastPasswordChange = new Date();
        
//         await user.save();
//         migratedCount++;
//       }
//     }
    
//     console.log(`Migration complete. Migrated ${migratedCount} passwords.`);
//     return {
//       success: true,
//       migratedCount
//     };
//   } catch (error) {
//     console.error('Password migration error:', error);
//     return {
//       success: false,
//       error: error.message
//     };
//   }
// };

// Custom query methods
UserSchema.query.byRole = function(role) {
  return this.where({ role });
};

UserSchema.query.active = function() {
  return this.where({ locked: false });
};

const User = mongoose.model('User', UserSchema);

export default User;
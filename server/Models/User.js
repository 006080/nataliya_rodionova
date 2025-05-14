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
    select: false 
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
  }],
  // Account deletion fields
  markedForDeletion: {
    type: Boolean,
    default: false
  },
  deletionDate: {
    type: Date
  },
  deletionReason: {
    type: String
  }
}, { timestamps: true });

// UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ registeredAt: 1 });
UserSchema.index({ emailVerificationToken: 1 }, { sparse: true });
UserSchema.index({ passwordResetToken: 1 }, { sparse: true });
UserSchema.index({ markedForDeletion: 1, deletionDate: 1 }); // Add index for account deletion queries

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


UserSchema.statics.restoreAccount = async function(userId) {
  try {
    // Use native MongoDB operations to ensure fields are properly updated
    const result = await mongoose.connection.db.collection('users').updateOne(
      { _id: mongoose.Types.ObjectId(userId) },
      { 
        $set: { markedForDeletion: false },
        $unset: { deletionDate: "", deletionReason: "" }
      }
    );
    
    if (result.modifiedCount === 0) {
      throw new Error('User not found or account is not marked for deletion');
    }
    
    // Fetch the updated user document
    return await this.findById(userId);
  } catch (error) {
    console.error('Account restoration error:', error);
    throw error;
  }
};

// Custom query methods
UserSchema.query.byRole = function(role) {
  return this.where({ role });
};

UserSchema.query.active = function() {
  return this.where({ 
    locked: false,
    markedForDeletion: { $ne: true } 
  });
};

UserSchema.query.pendingDeletion = function() {
  return this.where({
    markedForDeletion: true,
    deletionDate: { $exists: true }
  });
};

const User = mongoose.model('User', UserSchema);

export default User;
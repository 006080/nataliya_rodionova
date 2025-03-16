// server/services/emailService.js
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configure transporter from environment variables
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Generate verification token
 * @returns {Object} token and hashed token
 */
export const generateVerificationToken = () => {
  // Create random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Hash token for storage
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
    
  return { token, hashedToken };
};

/**
 * Send verification email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} token - Verification token
 * @returns {Promise} Email sending result
 */
export const sendVerificationEmail = async (email, name, token) => {
  const frontendUrl = process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL_PROD 
    : process.env.FRONTEND_URL_LOCAL;
    
  const verificationUrl = `${frontendUrl}/verify-email/${token}`;
  
  const mailOptions = {
    from: `"VARONA" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Verify Email
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `
  };
  
  return transporter.sendMail(mailOptions);
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} token - Reset token
 * @returns {Promise} Email sending result
 */
export const sendPasswordResetEmail = async (email, name, token) => {
  const frontendUrl = process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL_PROD 
    : process.env.FRONTEND_URL_LOCAL;
    
  const resetUrl = `${frontendUrl}/reset-password/${token}`;
  
  const mailOptions = {
    from: `"VARONA" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `
  };
  
  return transporter.sendMail(mailOptions);
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  generateVerificationToken
};
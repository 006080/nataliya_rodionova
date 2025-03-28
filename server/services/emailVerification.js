import crypto from 'crypto';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Generate improved verification token that embeds the email
 * This makes it easier to handle already-verified cases
 * @param {string} email - User's email address
 * @returns {Object} token and hashed token
 */
export const generateVerificationToken = (email) => {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  
  // Embed a truncated and encoded version of the email in the token
  // This helps with identifying the user even if the token is no longer in the DB
  let emailPart = '';
  if (email) {
    try {
      // Take first part of email (before @) and encode it
      const emailPrefix = email.split('@')[0];
      const truncated = emailPrefix.substring(0, 8); // Limit length
      emailPart = Buffer.from(truncated).toString('base64url');
    } catch (err) {
      console.warn('Error encoding email for token:', err);
    }
  }
  
  // Combine the random bytes with the email part
  const token = `${randomBytes}-${emailPart}`;
  
  // Hash token for storage
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
    
    
  return { token, hashedToken };
};

/**
 * Send verification email with improved link
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} token - Verification token
 * @returns {Promise} Email sending result
 */
export const sendVerificationEmail = async (email, name, token) => {
  try {
    const frontendUrl = process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL_PROD 
      : process.env.FRONTEND_URL_LOCAL;
      
    // Include the email in the verification URL both as a path parameter and query parameter
    // This provides redundancy if the token is lost from the database
    const verificationUrl = `${frontendUrl}/verify-email/${token}?email=${encodeURIComponent(email)}`;
    
    
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
    
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};


/**
 * Send password reset email with link
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} token - Reset token
 * @returns {Promise} Email sending result
 */
export const sendPasswordResetEmail = async (email, name, token) => {
  try {
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
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
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
    
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

export default {
  generateVerificationToken,
  sendVerificationEmail,
  sendPasswordResetEmail
};
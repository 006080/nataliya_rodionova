import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send account deletion notification email
 * @param {Object} user - User object with name and email
 * @param {Date} deletionDate - Date when account will be permanently deleted
 * @returns {Promise<boolean>} - Success status
 */
export const sendAccountDeletionEmail = async (user, deletionDate) => {
  try {
    if (!user || !user.email) {
      console.error('User email not provided for deletion notification');
      return false;
    }

    const formattedDeletionDate = new Date(deletionDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Generate HTML email content
    const htmlContent = formatAccountDeletionEmail(user, formattedDeletionDate);
    const textContent = formatPlainTextAccountDeletionEmail(user, formattedDeletionDate);

    const mailOptions = {
      from: `VARONA <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your VARONA Account Has Been Scheduled for Deletion',
      text: textContent,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Account deletion email sent: ${result.messageId}`);

    return true;
  } catch (error) {
    console.error('Error sending account deletion email:', error);
    return false;
  }
};

/**
 * Send welcome back email after account restoration
 * @param {Object} user - User object with name and email
 * @returns {Promise<boolean>} - Success status
 */
export const sendAccountRestorationEmail = async (user) => {
  try {
    if (!user || !user.email) {
      console.error('User email not provided for restoration notification');
      return false;
    }

    // Generate HTML email content
    const htmlContent = formatAccountRestorationEmail(user);
    const textContent = formatPlainTextAccountRestorationEmail(user);

    const mailOptions = {
      from: `VARONA <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Welcome Back to VARONA - Your Account Has Been Restored',
      text: textContent,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Account restoration email sent: ${result.messageId}`);

    return true;
  } catch (error) {
    console.error('Error sending account restoration email:', error);
    return false;
  }
};

/**
 * Send final account deletion notification email
 * @param {string} email - User's email
 * @returns {Promise<boolean>} - Success status
 */
export const sendFinalDeletionEmail = async (email) => {
  try {
    if (!email) {
      console.error('User email not provided for final deletion notification');
      return false;
    }

    // Generate HTML email content
    const htmlContent = formatFinalDeletionEmail();
    const textContent = formatPlainTextFinalDeletionEmail();

    const mailOptions = {
      from: `VARONA <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your VARONA Account Has Been Permanently Deleted',
      text: textContent,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Final deletion email sent: ${result.messageId}`);

    return true;
  } catch (error) {
    console.error('Error sending final deletion email:', error);
    return false;
  }
};

/**
 * Format HTML email for account deletion notification
 */
const formatAccountDeletionEmail = (user, formattedDeletionDate) => {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL_PROD
    : process.env.FRONTEND_URL_LOCAL;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Deletion Notification</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.4; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f7f7;">
  <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
    <!-- Header -->
    <div style="background-color: #dc3545; padding: 25px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">ACCOUNT DELETION NOTICE</h1>
    </div>
    
    <!-- Status Message -->
    <div style="padding: 20px; background-color: #fff3cd; text-align: center;">
      <p style="margin: 0; font-size: 16px; color: #856404;">Your account has been scheduled for deletion as per your request.</p>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 25px;">
      <p style="margin: 0 0 15px 0; font-size: 16px;">Dear ${user.name},</p>
      
      <p style="margin: 0 0 15px 0; font-size: 16px;">We've received your request to delete your VARONA account. Your account has been scheduled for permanent deletion on <strong>${formattedDeletionDate}</strong>.</p>
      
      <div style="background-color: #f9f9fa; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">WHAT THIS MEANS:</h3>
        <ul style="margin: 0 0 0 20px; padding: 0;">
          <li style="margin-bottom: 8px;">Your personal information will be removed from our systems</li>
          <li style="margin-bottom: 8px;">Your order history will be anonymized</li>
          <li style="margin-bottom: 8px;">Your saved items and preferences will be deleted</li>
          <li style="margin-bottom: 8px;">Any reviews or feedback you've provided will remain but will be anonymized</li>
        </ul>
      </div>
      
      <div style="margin: 30px 0; padding: 20px; background-color: #e2e3e5; border-radius: 6px; text-align: center;">
        <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: bold;">Changed your mind?</p>
        <p style="margin: 0 0 15px 0; font-size: 16px;">You can still restore your account before ${formattedDeletionDate} by simply logging in with your current credentials.</p>
        <a href="${baseUrl}/login" style="background-color: #0056b3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Log In To Restore Your Account</a>
      </div>
      
      <p style="margin: 0 0 15px 0; font-size: 16px;">If you have any questions or if you did not request this deletion, please contact our support team immediately at ${process.env.EMAIL_USER}.</p>
      
      <p style="margin: 0 0 15px 0; font-size: 16px;">Thank you for being a part of the VARONA community.</p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f3f3f3; padding: 15px; text-align: center; font-size: 14px; color: #777;">
      <p style="margin: 0;">© ${new Date().getFullYear()} VARONA. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};

/**
 * Format plain text email for account deletion notification
 */
const formatPlainTextAccountDeletionEmail = (user, formattedDeletionDate) => {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL_PROD
    : process.env.FRONTEND_URL_LOCAL;

  return `
ACCOUNT DELETION NOTICE - VARONA

Your account has been scheduled for deletion as per your request.

Dear ${user.name},

We've received your request to delete your VARONA account. Your account has been scheduled for permanent deletion on ${formattedDeletionDate}.

WHAT THIS MEANS:
- Your personal information will be removed from our systems
- Your order history will be anonymized
- Your saved items and preferences will be deleted
- Any reviews or feedback you've provided will remain but will be anonymized

Changed your mind?
You can still restore your account before ${formattedDeletionDate} by simply logging in with your current credentials.
Log In To Restore Your Account: ${baseUrl}/login

If you have any questions or if you did not request this deletion, please contact our support team immediately at ${process.env.EMAIL_USER}.

Thank you for being a part of the VARONA community.

© ${new Date().getFullYear()} VARONA. All rights reserved.
`;
};

/**
 * Format HTML email for account restoration notification
 */
const formatAccountRestorationEmail = (user) => {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL_PROD
    : process.env.FRONTEND_URL_LOCAL;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Restored</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.4; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f7f7;">
  <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
    <!-- Header -->
    <div style="background-color: #28a745; padding: 25px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">WELCOME BACK!</h1>
    </div>
    
    <!-- Status Message -->
    <div style="padding: 20px; background-color: #d4edda; text-align: center;">
      <p style="margin: 0; font-size: 16px; color: #155724;">Your VARONA account has been successfully restored.</p>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 25px;">
      <p style="margin: 0 0 15px 0; font-size: 16px;">Dear ${user.name},</p>
      
      <p style="margin: 0 0 15px 0; font-size: 16px;">Great news! Your VARONA account has been successfully restored. We're delighted to welcome you back to our community.</p>
      
      <div style="background-color: #f9f9fa; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">YOUR ACCOUNT INFORMATION:</h3>
        <ul style="margin: 0 0 0 20px; padding: 0;">
          <li style="margin-bottom: 8px;">Your personal profile and account settings have been restored</li>
          <li style="margin-bottom: 8px;">Your order history is once again available in your account</li>
          <li style="margin-bottom: 8px;">Your saved items and preferences have been preserved</li>
        </ul>
      </div>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${baseUrl}/profile" style="background-color: #0056b3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; margin-right: 10px;">Go to My Account</a>
        <a href="${baseUrl}/shop" style="background-color: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Shop Now</a>
      </div>
      
      <p style="margin: 30px 0 15px 0; font-size: 16px;">Thank you for choosing to stay with VARONA. We're committed to providing you with the best shopping experience.</p>
      
      <p style="margin: 0 0 15px 0; font-size: 16px;">If you have any questions or concerns, please don't hesitate to contact our customer support at ${process.env.EMAIL_USER}.</p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f3f3f3; padding: 15px; text-align: center; font-size: 14px; color: #777;">
      <p style="margin: 0;">© ${new Date().getFullYear()} VARONA. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};

/**
 * Format plain text email for account restoration notification
 */
const formatPlainTextAccountRestorationEmail = (user) => {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL_PROD
    : process.env.FRONTEND_URL_LOCAL;

  return `
WELCOME BACK! - VARONA

Your VARONA account has been successfully restored.

Dear ${user.name},

Great news! Your VARONA account has been successfully restored. We're delighted to welcome you back to our community.

YOUR ACCOUNT INFORMATION:
- Your personal profile and account settings have been restored
- Your order history is once again available in your account
- Your saved items and preferences have been preserved

Go to My Account: ${baseUrl}/profile
Shop Now: ${baseUrl}/shop

Thank you for choosing to stay with VARONA. We're committed to providing you with the best shopping experience.

If you have any questions or concerns, please don't hesitate to contact our customer support at ${process.env.EMAIL_USER}.

© ${new Date().getFullYear()} VARONA. All rights reserved.
`;
};

/**
 * Format HTML email for final account deletion notification
 */
const formatFinalDeletionEmail = () => {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL_PROD
    : process.env.FRONTEND_URL_LOCAL;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Permanently Deleted</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.4; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f7f7;">
  <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
    <!-- Header -->
    <div style="background-color: #6c757d; padding: 25px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">ACCOUNT DELETION COMPLETE</h1>
    </div>
    
    <!-- Status Message -->
    <div style="padding: 20px; background-color: #e2e3e5; text-align: center;">
      <p style="margin: 0; font-size: 16px; color: #383d41;">Your VARONA account has been permanently deleted.</p>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 25px;">
      <p style="margin: 0 0 15px 0; font-size: 16px;">Hello,</p>
      
      <p style="margin: 0 0 15px 0; font-size: 16px;">This is a confirmation that your VARONA account has now been permanently deleted from our systems. As requested, we have:</p>
      
      <div style="background-color: #f9f9fa; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
        <ul style="margin: 0 0 0 20px; padding: 0;">
          <li style="margin-bottom: 8px;">Removed your personal profile and account information</li>
          <li style="margin-bottom: 8px;">Anonymized your order history</li>
          <li style="margin-bottom: 8px;">Deleted your saved items and preferences</li>
          <li style="margin-bottom: 8px;">Anonymized any reviews or feedback you've provided</li>
        </ul>
      </div>
      
      <p style="margin: 0 0 15px 0; font-size: 16px;">We're sorry to see you go. If you'd like to shop with VARONA again in the future, you'll need to create a new account.</p>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${baseUrl}/register" style="background-color: #0056b3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Create New Account</a>
      </div>
      
      <p style="margin: 0 0 15px 0; font-size: 16px;">If you have any questions or if you did not request this deletion, please contact our support team immediately at ${process.env.EMAIL_USER}.</p>
      
      <p style="margin: 0 0 15px 0; font-size: 16px;">Thank you for your past patronage.</p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f3f3f3; padding: 15px; text-align: center; font-size: 14px; color: #777;">
      <p style="margin: 0;">© ${new Date().getFullYear()} VARONA. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};

/**
 * Format plain text email for final account deletion notification
 */
const formatPlainTextFinalDeletionEmail = () => {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL_PROD
    : process.env.FRONTEND_URL_LOCAL;

  return `
ACCOUNT DELETION COMPLETE - VARONA

Your VARONA account has been permanently deleted.

Hello,

This is a confirmation that your VARONA account has now been permanently deleted from our systems. As requested, we have:

- Removed your personal profile and account information
- Anonymized your order history
- Deleted your saved items and preferences
- Anonymized any reviews or feedback you've provided

We're sorry to see you go. If you'd like to shop with VARONA again in the future, you'll need to create a new account.

Create New Account: ${baseUrl}/register

If you have any questions or if you did not request this deletion, please contact our support team immediately at ${process.env.EMAIL_USER}.

Thank you for your past patronage.

© ${new Date().getFullYear()} VARONA. All rights reserved.
`;
};

export default { 
  sendAccountDeletionEmail, 
  sendAccountRestorationEmail, 
  sendFinalDeletionEmail 
};
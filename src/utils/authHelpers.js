// src/utils/authHelpers.js - Create this utility file
/**
 * Utility function to force clear any pending verification state
 * This can be called from anywhere to explicitly clear the pending verification
 */
export const clearPendingVerification = () => {
  console.log('Force clearing pendingVerificationEmail from session storage');
  sessionStorage.removeItem('pendingVerificationEmail');
};

/**
 * Check if the currently logged in user is email verified
 * @returns {boolean} true if user is verified, false otherwise
 */
export const isUserVerified = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    
    const user = JSON.parse(userStr);
    return user && user.emailVerified === true;
  } catch (e) {
    console.error('Error checking user verification status:', e);
    return false;
  }
};

/**
 * Update email verification status of user in localStorage
 * @param {boolean} verified - New verification status to set
 */
export const updateUserVerificationStatus = (verified) => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    
    const user = JSON.parse(userStr);
    user.emailVerified = verified;
    localStorage.setItem('user', JSON.stringify(user));
    console.log('Updated user verification status in localStorage:', verified);
    
    // Always clear pending verification if marking as verified
    if (verified) {
      clearPendingVerification();
    }
  } catch (e) {
    console.error('Error updating user verification status:', e);
  }
};
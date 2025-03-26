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
  } catch (e) {
    console.error('Error updating user verification status:', e);
  }
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
 * Store access token in localStorage for persistence across browser sessions
 * Changed from sessionStorage to localStorage for 7-day persistence
 * @param {string} token - The access token to store
 */
export const persistAccessToken = (token) => {
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

/**
 * Retrieve persisted access token from localStorage
 * Changed from sessionStorage to localStorage for 7-day persistence
 * @returns {string|null} The access token or null if not found
 */
export const getPersistedAccessToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Clear email verification data from session storage
 */
export const clearPendingVerification = () => {
  console.log('Force clearing pendingVerificationEmail from session storage');
  sessionStorage.removeItem('pendingVerificationEmail');
};
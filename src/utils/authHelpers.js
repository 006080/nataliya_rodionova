import { jwtDecode } from 'jwt-decode';

/**
 * Update email verification status via token refresh
 * @param {boolean} verified - New verification status to set
 */
export const updateUserVerificationStatus = async (verified) => {
  try {
    // Force a token refresh to update the user data
    if (window.refreshAccessToken) {
      await window.refreshAccessToken();
    }
    // Update in-memory state if needed for immediate UI updates
    const currentUser = window.currentUser || {};
    if (currentUser) {
      window.currentUser = {
        ...currentUser,
        emailVerified: verified
      };
    }
  } catch (e) {
    console.error('Error updating user verification status');
  }
};

/**
 * Check if the currently logged in user is email verified
 * @returns {boolean} true if user is verified, false otherwise
 */
export const isUserVerified = () => {
  try {
    // First check in-memory user object if available
    if (window.currentUser) {
      return window.currentUser.emailVerified === true;
    }
    
    // If not available, decode from current token
    const token = window.accessToken;
    if (token) {
      const decoded = jwtDecode(token);
      return decoded && decoded.emailVerified === true;
    }
    
    // Last resort - check if we have session data
    return false;
  } catch (e) {
    return false;
  }
};

/**
 * Store access token in memory
 * @param {string} token - The access token to store
 */
export const persistAccessToken = (token) => {
  if (!token) {
    window.accessToken = null;
    sessionStorage.removeItem('sessionActive');
    return;
  }
  
  window.accessToken = token;
  sessionStorage.setItem('sessionActive', 'true');
  
  // Decode and store expiration time to help with refresh decisions
  try {
    const decoded = jwtDecode(token);
    if (decoded && decoded.exp) {
      sessionStorage.setItem('tokenExpires', decoded.exp * 1000);
    }
  } catch (e) {
    console.error('Error decoding token for persistence:', e);
  }
};


export const getPersistedAccessToken = () => {
  // First try to get from memory
  if (window.accessToken) {
    return window.accessToken;
  }
  
  // Check if user has explicitly logged out
  if (sessionStorage.getItem('isUserLogout') === 'true' || window.hasLoggedOut) {
    return null;
  }
  
  // If no token and not logged out, try to refresh
  if (!sessionStorage.getItem('refreshPending')) {
    sessionStorage.setItem('refreshPending', 'true');
    
    window.refreshAccessToken?.()
      .then(token => {
        if (token && window.currentUser) {
          window.dispatchEvent(new CustomEvent('auth-state-sync'));
        }
      })
      .catch(console.error)
      .finally(() => {
        sessionStorage.removeItem('refreshPending');
      });
  }
  
  return null;
};

/**
 * Clear email verification data from session storage
 */
export const clearPendingVerification = () => {
  sessionStorage.removeItem('pendingVerificationEmail');
};
import { jwtDecode } from 'jwt-decode';
// import { refreshAccessToken } from "../services/authService";

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
/**
 * Retrieve persisted access token
 * @returns {string|null} The access token or null if not found
 */
// export const getPersistedAccessToken = () => {
//   // Return from memory if available
//   if (window.accessToken) {
//     return window.accessToken;
//   }
  
//   // Check if we should attempt to restore session on page reload
//   const sessionActive = sessionStorage.getItem('sessionActive');
//   if (sessionActive === 'true') {
//     // Trigger a token refresh
//     refreshAccessToken().catch(() => {
//       // Clear session indicators if refresh fails
//       sessionStorage.removeItem('sessionActive');
//     });
//   }
  
//   return null; // Initially return null, refresh will update window.accessToken if successful
// };
export const getPersistedAccessToken = () => {
  // First try to get from memory
  if (window.accessToken) {
    return window.accessToken;
  }
  
  const sessionActive = sessionStorage.getItem('sessionActive');
  
  // If session should be active but we don't have a token, trigger refresh
  if (sessionActive === 'true') {
    // Check if we're already trying to refresh
    if (!sessionStorage.getItem('refreshPending')) {
      // Set a flag to avoid multiple refresh attempts
      sessionStorage.setItem('refreshPending', 'true');
      
      // Immediately attempt refresh
      window.refreshAccessToken?.()
        .then(token => {
          // If token refresh was successful, might need to update UI
          if (token && window.currentUser) {
            window.dispatchEvent(new CustomEvent('auth-state-sync'));
          }
        })
        .catch(err => {
          console.error('Token refresh failed:', err);
          // If refresh fails, clear session marker
          sessionStorage.removeItem('sessionActive');
        })
        .finally(() => {
          sessionStorage.removeItem('refreshPending');
        });
    }
  }
  
  return null; // Initially return null, refresh will update if successful
};

/**
 * Clear email verification data from session storage
 */
export const clearPendingVerification = () => {
  sessionStorage.removeItem('pendingVerificationEmail');
};
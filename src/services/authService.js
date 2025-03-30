import { jwtDecode } from 'jwt-decode';
import { getPersistedAccessToken, persistAccessToken } from '../utils/authHelpers';

const getApiUrl = () => {
  return import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL_PROD
    : import.meta.env.VITE_API_BASE_URL_LOCAL;
};

let lastRefreshTime = 0;
const REFRESH_COOLDOWN = 10000;
let refreshPromise = null;

// Extract user data from token
const extractUserDataFromToken = (token) => {
  try {
    if (!token) return null;
    
    const decoded = jwtDecode(token);
    
    // Store minimal user data
    return {
      id: decoded.sub || null,
      role: decoded.role || 'customer',
      emailVerified: decoded.emailVerified || false,
      expiresAt: decoded.exp ? decoded.exp * 1000 : null
    };
  } catch (error) {
    return null;
  }
};

export const setTokens = (accessToken, refreshToken, userData = {}) => {
  try {
    // Store the access token in memory
    window.accessToken = accessToken;
    persistAccessToken(accessToken);
    
    // Store minimal user info in memory for UI purposes
    if (accessToken) {
      const tokenData = extractUserDataFromToken(accessToken);
      if (tokenData) {
        window.currentUser = {
          ...tokenData,
          name: userData.name || '',
          email: userData.email || ''
        };
      }
    }
    
    // Broadcast auth state to other tabs
    if (window.authChannel) {
      window.authChannel.postMessage({
        type: 'AUTH_STATE_CHANGED',
        accessToken: window.accessToken,
        currentUser: window.currentUser
      });
    }
  } catch (error) {
    console.error('Error storing auth tokens');
  }
};

// Clear auth data on logout
export const clearTokens = async () => {
  try {
    // Clear memory tokens
    window.accessToken = null;
    window.currentUser = null;
    
    // Clear session indicators
    sessionStorage.removeItem('sessionActive');
    
    // Clear refresh token cookie (via API call)
    await fetch(`${getApiUrl()}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Error clearing auth tokens');
  }
};

// Get current access token from memory
export const getAccessToken = () => {
  return window.accessToken || getPersistedAccessToken();
};

// Check if token is expired
export const isTokenExpired = () => {
  try {
    const user = window.currentUser || {};
    return !user.expiresAt || user.expiresAt <= Date.now();
  } catch (error) {
    return true;
  }
};

export const getCurrentUser = () => {
  try {
    // Return the in-memory user object
    if (window.currentUser) {
      return window.currentUser;
    }
    
    // Try to recover by extracting from token
    const token = getAccessToken();
    if (token) {
      const tokenData = extractUserDataFromToken(token);
      if (tokenData && tokenData.id) {
        window.currentUser = tokenData;
        return tokenData;
      }
    }
    
    return {};
  } catch (error) {
    return {};
  }
};

// Check if user is authenticated (has valid token)
export const isAuthenticated = () => {
  return !!getAccessToken() && !isTokenExpired();
};



// Modified refreshAccessToken function in authService.js
export const refreshAccessToken = async () => {
  // Check if another tab is already refreshing
  if (window.isRefreshingToken) {
    // Wait a bit and check if it's completed
    await new Promise(resolve => setTimeout(resolve, 500));
    if (window.accessToken) {
      return window.accessToken;
    }
  }
  
  // Return existing promise if refresh is already in progress in this tab
  if (refreshPromise) {
    return refreshPromise;
  }
  
  // Check if we've refreshed recently in this tab
  const now = Date.now();
  if (now - lastRefreshTime < REFRESH_COOLDOWN) {
    return getAccessToken();
  }
  
  try {
    // Signal to other tabs that we're starting a refresh
    if (window.authChannel) {
      window.authChannel.postMessage({
        type: 'REFRESH_STARTED'
      });
    }
    
    window.isRefreshingToken = true;
    
    refreshPromise = new Promise((resolve, reject) => {
      // Set last refresh time
      lastRefreshTime = now;
      
      // Make the API call
      fetch(`${getApiUrl()}/api/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to refresh token');
        }
        return response.json();
      })
      .then(data => {
        // Store in memory
        window.accessToken = data.accessToken;
        persistAccessToken(data.accessToken);

        if (data.user && data.user.name && data.user.email) {
          window.currentUser = {
            id: data.user.id,
            role: data.user.role,
            emailVerified: data.user.emailVerified,
            name: data.user.name,
            email: data.user.email,
            expiresAt: extractUserDataFromToken(data.accessToken)?.expiresAt
          };
        } else {
          // Fallback to using token data + preserving existing user info
          const existingUserData = window.currentUser || {};
          const tokenData = extractUserDataFromToken(data.accessToken);
          
          if (tokenData && tokenData.id) {
            window.currentUser = {
              ...tokenData,
              name: existingUserData.name || '',
              email: existingUserData.email || ''
            };
          }
        }
        
        sessionStorage.setItem('sessionActive', 'true');
        
        // Broadcast to other tabs
        if (window.authChannel) {
          window.authChannel.postMessage({
            type: 'AUTH_STATE_CHANGED',
            accessToken: window.accessToken,
            currentUser: window.currentUser
          });
        }
        
        resolve(data.accessToken);
      })
      .catch(error => {
        // Clear session on refresh failure
        sessionStorage.removeItem('sessionActive');
        reject(error);
      })
      .finally(() => {
        // Signal that refresh is complete
        if (window.authChannel) {
          window.authChannel.postMessage({
            type: 'REFRESH_COMPLETE'
          });
        }
        window.isRefreshingToken = false;
      });
    });
    
    return await refreshPromise;
  } catch (error) {
    return null;
  } finally {
    refreshPromise = null;
  }
};







// Auth API client with automatic token refresh
export const authFetch = async (url, options = {}) => {
  // Check if token needs refresh
  if (isTokenExpired()) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      throw new Error('Session expired. Please login again.');
    }
  }
  
  // Add authorization header
  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${getAccessToken()}`,
    },
  };
  
  // Make the API call
  const response = await fetch(url, authOptions);
  
  // Handle 401 Unauthorized (token rejected)
  if (response.status === 401) {
    // Try to refresh token and retry request once
    const newToken = await refreshAccessToken();
    if (!newToken) {
      throw new Error('Session expired. Please login again.');
    }
    
    // Retry the request with new token
    const retryOptions = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      },
    };
    
    return fetch(url, retryOptions);
  }
  
  return response;
};

export const clearAllAuthData = async () => {
  try {
    // Clear memory tokens
    window.accessToken = null;
    window.currentUser = null;
    
    // WHITELIST APPROACH: Save only specific items we want to keep
    const whitelistedKeys = [
      'cartItems',
      'measurements',
      'deliveryDetails',
      'rememberedEmail'
    ];
    
    // Save values for whitelisted keys
    const preservedData = {};
    whitelistedKeys.forEach(key => {
      preservedData[key] = localStorage.getItem(key);
    });
    
    localStorage.clear();
    
    // Restore only the whitelisted items
    Object.keys(preservedData).forEach(key => {
      if (preservedData[key]) {
        localStorage.setItem(key, preservedData[key]);
      }
    });
    
    // Clear sessionStorage except for whitelisted items
    const whitelistedSessionKeys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!whitelistedSessionKeys.includes(key)) {
        sessionStorage.removeItem(key);
      }
    }

    // Clear cart from database if authenticated
    try {
      const apiUrl = getApiUrl();
      await fetch(`${apiUrl}/api/cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`
        },
        credentials: 'include'
      });
    } catch (cartError) {
      // Continue despite cart error
    }
    
    // Clear refresh token cookie (via API call)
    await fetch(`${getApiUrl()}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    // Clear cookies
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Login user and reload page after success
 */
export const loginUser = async (email, password) => {
  try {
    const apiUrl = getApiUrl();
    
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    
    const data = await response.json();

    // Handle email verification error
    if (response.status === 403 && data.needsVerification) {
      return {
        success: false,
        needsVerification: true,
        verificationDetails: data.verificationDetails || { email }
      };
    }
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Login failed'
      };
    }
    
    // Store tokens securely
    setTokens(data.accessToken, data.refreshToken, data.user);
    
    // Get local cart items
    const localCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    
    // Only attempt merge if there are items
    if (localCartItems.length > 0) {
      try {
        // Save cart items to server before reload
        await fetch(`${apiUrl}/api/cart/merge`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.accessToken}`
          },
          body: JSON.stringify({ items: localCartItems }),
          credentials: 'include',
        });
      } catch (error) {
        // Continue despite cart error
      }
    }
    
    // Dispatch auth state changed event
    const authStateChangedEvent = new CustomEvent('auth-state-changed');
    window.dispatchEvent(authStateChangedEvent);
    
    // Force page reload
    setTimeout(() => {
      // window.location.href = window.location.href;
      window.location.reload();
    }, 100);
    
    return { 
      success: true,
      user: data.user,
      reloading: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
};

// Make refreshAccessToken available globally
window.refreshAccessToken = refreshAccessToken;
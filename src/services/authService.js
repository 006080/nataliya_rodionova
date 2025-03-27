import { jwtDecode } from 'jwt-decode';
import { getPersistedAccessToken, persistAccessToken } from '../utils/authHelpers';

const getApiUrl = () => {
  return import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL_PROD
    : import.meta.env.VITE_API_BASE_URL_LOCAL;
};

let lastRefreshTime = 0;
// Set minimum time between refreshes (10 seconds)
const REFRESH_COOLDOWN = 10000;

// Track if a refresh is in progress to prevent duplicate requests
let refreshInProgress = false;

// Extract complete user data from token
const extractUserDataFromToken = (token) => {
  try {
    if (!token) return null;
    
    const decoded = jwtDecode(token);
    
    // Make sure we store ALL user fields from the token
    return {
      id: decoded.sub || null,
      name: decoded.name || '', 
      email: decoded.email || '', 
      role: decoded.role || 'customer',
      emailVerified: decoded.emailVerified || false,
      expiresAt: decoded.exp ? decoded.exp * 1000 : null
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const setTokens = (accessToken, refreshToken) => {
  try {
    // Store the access token in memory and localStorage for persistence
    window.accessToken = accessToken;
    persistAccessToken(accessToken);
    
    // Only attempt to store refresh token if it exists
    if (refreshToken) {
      // Store refresh token in httpOnly cookie (via API call)
      fetch(`${getApiUrl()}/api/auth/store-refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include', // Important for cookies
      })
      .then(response => {
        if (!response.ok) {
          console.error('Failed to store refresh token:', response.status);
        }
      })
      .catch(error => {
        console.error('Error storing refresh token:', error);
      });
    } else {
      console.warn('No refresh token provided to setTokens function. Authentication may be incomplete.');
    }
    
    // Store non-sensitive user info in localStorage for UI purposes
    if (accessToken) {
      const userData = extractUserDataFromToken(accessToken);
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        console.error('Failed to extract user data from token');
      }
    }
  } catch (error) {
    console.error('Error storing auth tokens:', error);
  }
};

// Clear auth data on logout
export const clearTokens = async () => {
  try {
    // Clear memory token
    window.accessToken = null;
    // Clear localStorage token
    persistAccessToken(null);
    
    // Clear refresh token cookie (via API call)
    await fetch(`${getApiUrl()}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    // Clear user data
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
};

// Get current access token from memory or localStorage
export const getAccessToken = () => {
  return window.accessToken || getPersistedAccessToken();
};

// Check if token is expired
export const isTokenExpired = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return !user.expiresAt || user.expiresAt <= Date.now();
  } catch (error) {
    return true;
  }
};

export const getCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return {};
    
    const user = JSON.parse(storedUser);
    
    // Debug: Check what fields are missing
    if (!user.name || !user.email) {
      console.warn('User data is missing critical fields:', user);
      
      // Try to recover by re-extracting from token
      const token = getAccessToken();
      if (token) {
        const tokenData = extractUserDataFromToken(token);
        if (tokenData && tokenData.id) {
          localStorage.setItem('user', JSON.stringify(tokenData));
          return tokenData;
        }
      }
    }
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return {};
  }
};

// Check if user is authenticated (has valid token)
export const isAuthenticated = () => {
  return !!getAccessToken() && !isTokenExpired();
};

// Refresh the access token using refresh token, with rate limiting
export const refreshAccessToken = async () => {
  // Check if refresh is already in progress
  if (refreshInProgress) {
    return null;
  }
  
  // Check if we've refreshed recently
  const now = Date.now();
  if (now - lastRefreshTime < REFRESH_COOLDOWN) {
    return getAccessToken();
  }
  
  try {
    refreshInProgress = true;
    lastRefreshTime = now;
    
    const response = await fetch(`${getApiUrl()}/api/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include', // Important for sending cookies
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    const data = await response.json();
    
    // Store in both memory and localStorage
    window.accessToken = data.accessToken;
    persistAccessToken(data.accessToken);
    
    // Update user data with new token info
    if (data.accessToken) {
      const userData = extractUserDataFromToken(data.accessToken);
      if (userData && userData.name && userData.email) {
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        console.error('Refreshed token is missing required user data');
      }
    }
    
    return data.accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  } finally {
    refreshInProgress = false;
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
    // Clear memory token
    window.accessToken = null;

    
    // WHITELIST APPROACH: Save only specific items we want to keep
    // These would be non-auth related items your app needs to preserve
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
    
    // Clear sessionStorage
    sessionStorage.clear();


   // Clear cart from database if we're authenticated
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
    console.error('Error clearing cart from database:', cartError);
  }

    
    // Clear refresh token cookie (via API call)
    await fetch(`${getApiUrl()}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

     document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};


/**
 * Login user and reload page after success
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Login result
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
    
    // Store tokens securely - this will also store user data in localStorage
    setTokens(data.accessToken, data.refreshToken);
    
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
        console.error('Error sending cart data:', error);
      }
    }
    
    // Dispatch auth state changed event
    const authStateChangedEvent = new CustomEvent('auth-state-changed');
    window.dispatchEvent(authStateChangedEvent);
    
    // CRITICAL: Force page reload with a slight delay to ensure events are processed
    setTimeout(() => {
      window.location.href = window.location.href;
    }, 100);
    
    // Return success but let the page reload happen
    return { 
      success: true,
      user: data.user,
      reloading: true
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
};
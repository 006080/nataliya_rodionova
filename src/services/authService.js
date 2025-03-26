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
    console.log('Decoded token payload:', decoded);
    
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
        console.log('Storing complete user data in localStorage:', userData);
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
          console.log('Recovered user data from token:', tokenData);
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
    console.log('Token refresh already in progress, skipping duplicate request');
    return null;
  }
  
  // Check if we've refreshed recently
  const now = Date.now();
  if (now - lastRefreshTime < REFRESH_COOLDOWN) {
    console.log('Token refresh on cooldown, skipping request');
    return getAccessToken();
  }
  
  try {
    refreshInProgress = true;
    lastRefreshTime = now;
    
    console.log('Attempting to refresh token...');
    const response = await fetch(`${getApiUrl()}/api/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include', // Important for sending cookies
    });
    
    if (!response.ok) {
      console.log('Token refresh failed with status:', response.status);
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
        console.log('Token refreshed successfully, updated user data:', userData);
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
    
    // Log all localStorage keys to see what's there
    console.log('All localStorage keys before clearing:', Object.keys(localStorage));
    
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
    
    // Clear ALL localStorage
    localStorage.clear();
    
    // Log to confirm localStorage was cleared
    console.log('localStorage after clearing:', Object.keys(localStorage));
    
    // Restore only the whitelisted items
    Object.keys(preservedData).forEach(key => {
      if (preservedData[key]) {
        localStorage.setItem(key, preservedData[key]);
      }
    });
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear refresh token cookie (via API call)
    await fetch(`${getApiUrl()}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    //  // Optionally, clear PayPal session cookies
    //  await fetch('https://www.paypal.com/auth/logout', {
    //   method: 'GET',
    //   credentials: 'include'
    // });

     // Optional: Clear all cookies (if needed)
     document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Clear other cookies that might contain auth data
    // document.cookie.split(";").forEach(function(c) {
    //   document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    // });
    
    console.log('Final localStorage keys after clearing:', Object.keys(localStorage));
    console.log('All auth data cleared');
    
    // Return true to indicate success
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};


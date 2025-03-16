// src/services/authService.js
import { jwtDecode } from 'jwt-decode';

const getApiUrl = () => {
  return import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL_PROD
    : import.meta.env.VITE_API_BASE_URL_LOCAL;
};


export const setTokens = (accessToken, refreshToken) => {
  try {
    // Store the access token in memory only (not persisted)
    window.accessToken = accessToken;
    
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
      const decodedToken = jwtDecode(accessToken);
      localStorage.setItem('user', JSON.stringify({
        id: decodedToken.sub,
        email: decodedToken.email,
        name: decodedToken.name,
        expiresAt: decodedToken.exp * 1000, // Convert to milliseconds
      }));
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

// Get current access token from memory
export const getAccessToken = () => {
  return window.accessToken;
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

// Get current user from localStorage
export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch (error) {
    return {};
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAccessToken() && !isTokenExpired();
};

// Refresh the access token using refresh token
export const refreshAccessToken = async () => {
  try {
    const response = await fetch(`${getApiUrl()}/api/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include', // Important for sending cookies
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    const data = await response.json();
    window.accessToken = data.accessToken;
    
    // Update user data with new token info
    if (data.accessToken) {
      const decodedToken = jwtDecode(data.accessToken);
      localStorage.setItem('user', JSON.stringify({
        id: decodedToken.sub,
        email: decodedToken.email,
        name: decodedToken.name,
        expiresAt: decodedToken.exp * 1000,
      }));
    }
    
    return data.accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    clearTokens();
    return null;
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
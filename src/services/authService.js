// // src/services/authService.js
// import { jwtDecode } from 'jwt-decode';
// import { getPersistedAccessToken, persistAccessToken } from '../utils/authHelpers';

// const getApiUrl = () => {
//   return import.meta.env.VITE_NODE_ENV === "production"
//     ? import.meta.env.VITE_API_BASE_URL_PROD
//     : import.meta.env.VITE_API_BASE_URL_LOCAL;
// };


// // export const setTokens = (accessToken, refreshToken) => {
// //   try {
// //     // Store the access token in memory only (not persisted)
// //     window.accessToken = accessToken;
    
// //     // Only attempt to store refresh token if it exists
// //     if (refreshToken) {
// //       // Store refresh token in httpOnly cookie (via API call)
// //       fetch(`${getApiUrl()}/api/auth/store-refresh-token`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ refreshToken }),
// //         credentials: 'include', // Important for cookies
// //       })
// //       .then(response => {
// //         if (!response.ok) {
// //           console.error('Failed to store refresh token:', response.status);
// //         }
// //       })
// //       .catch(error => {
// //         console.error('Error storing refresh token:', error);
// //       });
// //     } else {
// //       console.warn('No refresh token provided to setTokens function. Authentication may be incomplete.');
// //     }
    
// //     // Store non-sensitive user info in localStorage for UI purposes
// //     if (accessToken) {
// //       const decodedToken = jwtDecode(accessToken);
// //       localStorage.setItem('user', JSON.stringify({
// //         id: decodedToken.sub,
// //         email: decodedToken.email,
// //         name: decodedToken.name,
// //         emailVerified: decodedToken.emailVerified || false, 
// //         expiresAt: decodedToken.exp * 1000, // Convert to milliseconds
// //       }));
// //     }
// //   } catch (error) {
// //     console.error('Error storing auth tokens:', error);
// //   }
// // };
// export const setTokens = (accessToken, refreshToken) => {
//   try {
//     // Store the access token in memory and sessionStorage for persistence
//     window.accessToken = accessToken;
//     persistAccessToken(accessToken);
    
//     // Only attempt to store refresh token if it exists
//     if (refreshToken) {
//       // Store refresh token in httpOnly cookie (via API call)
//       fetch(`${getApiUrl()}/api/auth/store-refresh-token`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ refreshToken }),
//         credentials: 'include', // Important for cookies
//       })
//       .then(response => {
//         if (!response.ok) {
//           console.error('Failed to store refresh token:', response.status);
//         }
//       })
//       .catch(error => {
//         console.error('Error storing refresh token:', error);
//       });
//     } else {
//       console.warn('No refresh token provided to setTokens function. Authentication may be incomplete.');
//     }
    
//     // Store non-sensitive user info in localStorage for UI purposes
//     if (accessToken) {
//       const decodedToken = jwtDecode(accessToken);
//       localStorage.setItem('user', JSON.stringify({
//         id: decodedToken.sub,
//         email: decodedToken.email,
//         name: decodedToken.name,
//         emailVerified: decodedToken.emailVerified || false, // Include emailVerified flag
//         expiresAt: decodedToken.exp * 1000, // Convert to milliseconds
//       }));
//     }
//   } catch (error) {
//     console.error('Error storing auth tokens:', error);
//   }
// };

// // Clear auth data on logout
// // export const clearTokens = async () => {
// //   try {
// //     // Clear memory token
// //     window.accessToken = null;
    
// //     // Clear refresh token cookie (via API call)
// //     await fetch(`${getApiUrl()}/api/auth/logout`, {
// //       method: 'POST',
// //       credentials: 'include',
// //     });
    
// //     // Clear user data
// //     localStorage.removeItem('user');
// //   } catch (error) {
// //     console.error('Error clearing auth tokens:', error);
// //   }
// // };
// // Replace the clearTokens function:
// export const clearTokens = async () => {
//   try {
//     // Clear memory token
//     window.accessToken = null;
//     // Clear sessionStorage token
//     persistAccessToken(null);
    
//     // Clear refresh token cookie (via API call)
//     await fetch(`${getApiUrl()}/api/auth/logout`, {
//       method: 'POST',
//       credentials: 'include',
//     });
    
//     // Clear user data
//     localStorage.removeItem('user');
//   } catch (error) {
//     console.error('Error clearing auth tokens:', error);
//   }
// };

// // Get current access token from memory
// export const getAccessToken = () => {
//   return window.accessToken || getPersistedAccessToken();
// };

// // Check if token is expired
// export const isTokenExpired = () => {
//   try {
//     const user = JSON.parse(localStorage.getItem('user') || '{}');
//     return !user.expiresAt || user.expiresAt <= Date.now();
//   } catch (error) {
//     return true;
//   }
// };

// // Get current user from localStorage
// export const getCurrentUser = () => {
//   try {
//     return JSON.parse(localStorage.getItem('user') || '{}');
//   } catch (error) {
//     return {};
//   }
// };

// // Check if user is authenticated
// export const isAuthenticated = () => {
//   return !!getAccessToken() && !isTokenExpired();
// };

// // Refresh the access token using refresh token
// export const refreshAccessToken = async () => {
//   try {
//     const response = await fetch(`${getApiUrl()}/api/auth/refresh-token`, {
//       method: 'POST',
//       credentials: 'include', // Important for sending cookies
//     });
    
//     if (!response.ok) {
//       throw new Error('Failed to refresh token');
//     }
    
//     const data = await response.json();
//     window.accessToken = data.accessToken;
    
//     // Update user data with new token info
//     if (data.accessToken) {
//       const decodedToken = jwtDecode(data.accessToken);
//       localStorage.setItem('user', JSON.stringify({
//         id: decodedToken.sub,
//         email: decodedToken.email,
//         name: decodedToken.name,
//         expiresAt: decodedToken.exp * 1000,
//       }));
//     }
    
//     return data.accessToken;
//   } catch (error) {
//     console.error('Error refreshing token:', error);
//     clearTokens();
//     return null;
//   }
// };
// // Also update refreshAccessToken function:
// // export const refreshAccessToken = async () => {
// //   try {
// //     const response = await fetch(`${getApiUrl()}/api/auth/refresh-token`, {
// //       method: 'POST',
// //       credentials: 'include', // Important for sending cookies
// //     });
    
// //     if (!response.ok) {
// //       throw new Error('Failed to refresh token');
// //     }
    
// //     const data = await response.json();
    
// //     // Store in both memory and sessionStorage
// //     window.accessToken = data.accessToken;
// //     persistAccessToken(data.accessToken);
    
// //     // Update user data with new token info
// //     if (data.accessToken) {
// //       const decodedToken = jwtDecode(data.accessToken);
// //       localStorage.setItem('user', JSON.stringify({
// //         id: decodedToken.sub,
// //         email: decodedToken.email,
// //         name: decodedToken.name,
// //         emailVerified: decodedToken.emailVerified || false, // Include emailVerified flag
// //         expiresAt: decodedToken.exp * 1000,
// //       }));
// //     }
    
// //     return data.accessToken;
// //   } catch (error) {
// //     console.error('Error refreshing token:', error);
// //     clearTokens();
// //     return null;
// //   }
// // };

// // Auth API client with automatic token refresh
// export const authFetch = async (url, options = {}) => {
//   // Check if token needs refresh
//   if (isTokenExpired()) {
//     const newToken = await refreshAccessToken();
//     if (!newToken) {
//       throw new Error('Session expired. Please login again.');
//     }
//   }
  
//   // Add authorization header
//   const authOptions = {
//     ...options,
//     headers: {
//       ...options.headers,
//       Authorization: `Bearer ${getAccessToken()}`,
//     },
//   };
  
//   // Make the API call
//   const response = await fetch(url, authOptions);
  
//   // Handle 401 Unauthorized (token rejected)
//   if (response.status === 401) {
//     // Try to refresh token and retry request once
//     const newToken = await refreshAccessToken();
//     if (!newToken) {
//       throw new Error('Session expired. Please login again.');
//     }
    
//     // Retry the request with new token
//     const retryOptions = {
//       ...options,
//       headers: {
//         ...options.headers,
//         Authorization: `Bearer ${newToken}`,
//       },
//     };
    
//     return fetch(url, retryOptions);
//   }
  
//   return response;
// };






// src/services/authService.js
import { jwtDecode } from 'jwt-decode';
import { getPersistedAccessToken, persistAccessToken } from '../utils/authHelpers';

const getApiUrl = () => {
  return import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL_PROD
    : import.meta.env.VITE_API_BASE_URL_LOCAL;
};

// Keep track of the last refresh time to prevent too many requests
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
      name: decoded.name || '',  // Important! This was missing
      email: decoded.email || '', // Important! This was missing
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

// Get current user from localStorage
// export const getCurrentUser = () => {
//   try {
//     return JSON.parse(localStorage.getItem('user') || '{}');
//   } catch (error) {
//     return {};
//   }
// };
// Get current user from localStorage with field validation
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



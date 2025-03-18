// import { createContext, useContext, useState, useEffect } from 'react';
// import { 
//   setTokens, 
//   clearTokens, 
//   isAuthenticated, 
//   getCurrentUser,
//   refreshAccessToken,
//   authFetch
// } from '../services/authService';

// const getApiUrl = () => {
//   return import.meta.env.VITE_NODE_ENV === "production"
//     ? import.meta.env.VITE_API_BASE_URL_PROD
//     : import.meta.env.VITE_API_BASE_URL_LOCAL;
// };

// // Create context
// const AuthContext = createContext(null);

// // Separate function for the Provider Component
// function AuthProviderComponent({ children }) {
//   const [user, setUser] = useState(getCurrentUser);
//   const [loading, setLoading] = useState(true);
//   const [authError, setAuthError] = useState('');
  

//   useEffect(() => {
//     const initAuth = async () => {
//       const storedUser = localStorage.getItem('user');
//       const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      
//       // If we have a user in localStorage
//       if (parsedUser?.id) {
//         setUser(parsedUser);
        
//         // If token is expired, try to refresh
//         if (!isAuthenticated()) {
//           try {
//             await refreshAccessToken();
//             // Update user state with refreshed info
//             setUser(getCurrentUser());
//           } catch (error) {
//             // Clear everything if refresh fails
//             await clearTokens();
//             setUser(null);
//           }
//         }
//       }
      
//       setLoading(false);
//     };
    
//     initAuth();
//   }, []);
//   // useEffect(() => {
//   //   const initAuth = async () => {
//   //     try {
//   //       // Check for persisted user data
//   //       const userStr = localStorage.getItem('user');
//   //       const persistedUser = userStr ? JSON.parse(userStr) : null;
        
//   //       // If we have persisted user data
//   //       if (persistedUser?.id) {
//   //         // Set the current user from localStorage
//   //         setUser(persistedUser);
          
//   //         // If token is expired or missing, try to refresh
//   //         if (!isAuthenticated()) {
//   //           console.log('Token expired or missing, attempting refresh...');
            
//   //           // Try to refresh the token
//   //           const newToken = await refreshAccessToken();
            
//   //           if (newToken) {
//   //             // Update user with potentially new info from the token
//   //             setUser(getCurrentUser());
//   //             console.log('Token refreshed successfully');
//   //           } else {
//   //             // If refresh fails, clear everything
//   //             console.log('Token refresh failed, clearing auth state');
//   //             await clearTokens();
//   //             setUser(null);
//   //           }
//   //         } else {
//   //           console.log('Valid auth token found');
//   //         }
//   //       } else {
//   //         console.log('No persisted user found');
//   //         setUser(null);
//   //       }
//   //     } catch (error) {
//   //       console.error('Auth initialization error:', error);
//   //       setUser(null);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };
    
//   //   initAuth();
//   // }, []);
  

// // Login function with improved error handling for email verification
// const login = async (email, password) => {
//   try {
//     // Clear previous errors
//     setAuthError('');
    
//     console.log('Login attempt for:', email);
    
//     const response = await fetch(`${getApiUrl()}/api/auth/login`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, password }),
//       credentials: 'include',
//     });
    
//     const data = await response.json();
    
//     console.log('Login response:', {
//       status: response.status,
//       data
//     });
    
//     // Handle email verification error
//     if (response.status === 403 && data.needsVerification) {
//       console.log('Email not verified - response status 403 with needsVerification flag');
//       setAuthError('Please verify your email address before logging in.');
      
//       // Return detailed verification info from server
//       return {
//         success: false,
//         needsVerification: true,
//         verificationDetails: data.verificationDetails || { email }
//       };
//     }
    
//     // Handle other errors
//     if (!response.ok) {
//       setAuthError(data.error || 'Login failed');
//       return {
//         success: false,
//         error: data.error || 'Login failed'
//       };
//     }
    
//     console.log('Login successful, user data:', data.user);
    
//     // Store tokens securely
//     setTokens(data.accessToken, data.refreshToken);
    
//     // Update user state
//     setUser(data.user);
    
//     return { success: true };
//   } catch (error) {
//     console.error('Login error:', error);
//     setAuthError(error.message || 'An unexpected error occurred');
//     return {
//       success: false,
//       error: error.message || 'An unexpected error occurred'
//     };
//   }
// };

  
// // Register function - updated to handle email verification
// const register = async (name, email, password) => {
//   try {
//     setAuthError('');
    
//     const response = await fetch(`${getApiUrl()}/api/auth/register`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ name, email, password }),
//       credentials: 'include',
//     });
    
//     const data = await response.json();
    
//     if (!response.ok) {
//       throw new Error(data.error || 'Registration failed');
//     }
    
//     console.log('Registration response data:', {
//       accessToken: data.accessToken ? 'present' : 'missing',
//       refreshToken: data.refreshToken ? 'present' : 'missing',
//       user: data.user ? 'present' : 'missing'
//     });
    
//     // Store tokens securely
//     setTokens(data.accessToken, data.refreshToken);
    
//     // Update user state
//     setUser(data.user);
    
//     return true;
//   } catch (error) {
//     console.error('Registration error:', error);
//     setAuthError(error.message);
//     return false;
//   }
// };

// // Resend verification email
// const resendVerificationEmail = async (email) => {
//   try {
//     setAuthError('');
    
//     const response = await fetch(`${getApiUrl()}/api/auth/resend-verification`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email }),
//     });
    
//     const data = await response.json();
    
//     if (!response.ok) {
//       throw new Error(data.error || 'Failed to resend verification email');
//     }
    
//     return true;
//   } catch (error) {
//     console.error('Resend verification error:', error);
//     setAuthError(error.message);
//     return false;
//   }
// };

// // Logout handler
// const logout = async () => {
//   try {
//     setLoading(true);
//     await clearTokens();
//     setUser(null);
//     return true;
//   } catch (error) {
//     console.error('Logout error:', error);
//     return false;
//   } finally {
//     setLoading(false);
//   }
// };

//   // Context value
//   const contextValue = {
//     user,
//     isAuthenticated: !!user?.id && isAuthenticated(),
//     loading,
//     authError,
//     login,
//     register,
//     logout,
//     resendVerificationEmail,
//     clearAuthError: () => setAuthError(''),
//     authFetch, // Export authFetch for protected API calls
//     setUser, // Expose setUser for updates after profile changes
//   };

//   return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
// }

// // Named exports compatible with Fast Refresh
// export function AuthProvider(props) {
//   return <AuthProviderComponent {...props} />;
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }



// import { createContext, useContext, useState, useEffect } from 'react';
// import { 
//   setTokens, 
//   clearTokens, 
//   isAuthenticated, 
//   getCurrentUser,
//   refreshAccessToken,
//   authFetch
// } from '../services/authService';

// const getApiUrl = () => {
//   return import.meta.env.VITE_NODE_ENV === "production"
//     ? import.meta.env.VITE_API_BASE_URL_PROD
//     : import.meta.env.VITE_API_BASE_URL_LOCAL;
// };

// // Create context
// const AuthContext = createContext(null);

// // Separate function for the Provider Component
// function AuthProviderComponent({ children }) {
//   const [user, setUser] = useState(getCurrentUser);
//   const [loading, setLoading] = useState(true);
//   const [authError, setAuthError] = useState('');
  
//   useEffect(() => {
//     const initAuth = async () => {
//       try {
//         console.log('Initializing auth state...');
        
//         // First check if we have a stored user
//         const storedUser = localStorage.getItem('user');
//         const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        
//         // If we have a stored user, set it temporarily
//         if (parsedUser?.id) {
//           setUser(parsedUser);
//           console.log('Found stored user data:', parsedUser.email);
//         }
        
//         // Try to refresh the token regardless
//         // This is critical for 7-day persistence
//         const newToken = await refreshAccessToken();
        
//         if (newToken) {
//           // Token refresh succeeded, update user with fresh data
//           const refreshedUser = getCurrentUser();
//           setUser(refreshedUser);
//           console.log('Session restored successfully for:', refreshedUser.email);
//         } else if (parsedUser?.id) {
//           // If we had a user but couldn't refresh, try once more
//           console.log('Initial token refresh failed, checking if token is still valid...');
          
//           // If the token is still valid (not expired), keep the user logged in
//           if (isAuthenticated()) {
//             console.log('Existing token is still valid, maintaining session');
//           } else {
//             // Otherwise clear auth state
//             console.log('No valid token available, clearing auth state');
//             await clearTokens();
//             setUser(null);
//           }
//         } else {
//           // No stored user and no successful refresh
//           console.log('No stored user found and refresh failed');
//           setUser(null);
//         }
//       } catch (error) {
//         console.error('Auth initialization error:', error);
//         await clearTokens();
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     initAuth();
//   }, []);

//   // Login function with improved error handling for email verification
//   const login = async (email, password) => {
//     try {
//       // Clear previous errors
//       setAuthError('');
      
//       console.log('Login attempt for:', email);
      
//       const response = await fetch(`${getApiUrl()}/api/auth/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//         credentials: 'include',
//       });
      
//       const data = await response.json();
      
//       console.log('Login response status:', response.status);
      
//       // Handle email verification error
//       if (response.status === 403 && data.needsVerification) {
//         console.log('Email not verified - response status 403 with needsVerification flag');
//         setAuthError('Please verify your email address before logging in.');
        
//         // Return detailed verification info from server
//         return {
//           success: false,
//           needsVerification: true,
//           verificationDetails: data.verificationDetails || { email }
//         };
//       }
      
//       // Handle other errors
//       if (!response.ok) {
//         setAuthError(data.error || 'Login failed');
//         return {
//           success: false,
//           error: data.error || 'Login failed'
//         };
//       }
      
//       console.log('Login successful, user data:', data.user);
      
//       // Store tokens securely - this will also store user data in localStorage
//       setTokens(data.accessToken, data.refreshToken);
      
//       // Update user state
//       setUser(data.user);
      
//       return { success: true };
//     } catch (error) {
//       console.error('Login error:', error);
//       setAuthError(error.message || 'An unexpected error occurred');
//       return {
//         success: false,
//         error: error.message || 'An unexpected error occurred'
//       };
//     }
//   };
  
//   // Register function - updated to handle email verification
//   const register = async (name, email, password) => {
//     try {
//       setAuthError('');
      
//       const response = await fetch(`${getApiUrl()}/api/auth/register`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ name, email, password }),
//         credentials: 'include',
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Registration failed');
//       }
      
//       console.log('Registration response data:', {
//         accessToken: data.accessToken ? 'present' : 'missing',
//         refreshToken: data.refreshToken ? 'present' : 'missing',
//         user: data.user ? 'present' : 'missing'
//       });
      
//       // Store tokens securely
//       setTokens(data.accessToken, data.refreshToken);
      
//       // Update user state
//       setUser(data.user);
      
//       return true;
//     } catch (error) {
//       console.error('Registration error:', error);
//       setAuthError(error.message);
//       return false;
//     }
//   };

//   // Resend verification email
//   const resendVerificationEmail = async (email) => {
//     try {
//       setAuthError('');
      
//       const response = await fetch(`${getApiUrl()}/api/auth/resend-verification`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email }),
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to resend verification email');
//       }
      
//       return true;
//     } catch (error) {
//       console.error('Resend verification error:', error);
//       setAuthError(error.message);
//       return false;
//     }
//   };

//   // Logout handler
//   const logout = async () => {
//     try {
//       setLoading(true);
//       await clearTokens();
//       setUser(null);
//       return true;
//     } catch (error) {
//       console.error('Logout error:', error);
//       return false;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Context value
//   const contextValue = {
//     user,
//     isAuthenticated: !!user?.id && isAuthenticated(),
//     loading,
//     authError,
//     login,
//     register,
//     logout,
//     resendVerificationEmail,
//     clearAuthError: () => setAuthError(''),
//     authFetch, // Export authFetch for protected API calls
//     setUser, // Expose setUser for updates after profile changes
//   };

//   return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
// }

// // Named exports compatible with Fast Refresh
// export function AuthProvider(props) {
//   return <AuthProviderComponent {...props} />;
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }


import { createContext, useContext, useState, useEffect } from 'react';
import { 
  setTokens, 
  clearTokens, 
  isAuthenticated, 
  getCurrentUser,
  refreshAccessToken,
  authFetch
} from '../services/authService';

const getApiUrl = () => {
  return import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL_PROD
    : import.meta.env.VITE_API_BASE_URL_LOCAL;
};

// Create context
const AuthContext = createContext(null);

// Separate function for the Provider Component
function AuthProviderComponent({ children }) {
  // Initialize with data from localStorage to avoid flicker on reload
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error('Error parsing stored user data:', e);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  
  // This variable helps prevent multiple refresh attempts in quick succession
  let refreshInProgress = false;
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('Initializing auth state...');
        
        // Skip refresh if we don't have a stored user at all
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          console.log('No stored user found, skipping refresh');
          setUser(null);
          setLoading(false);
          return;
        }
        
        // We already set the user from localStorage in the initial state,
        // so no need to set it again here
        
        // Only try to refresh if we're not already doing so and if we have a token
        if (!refreshInProgress && isAuthenticated()) {
          // If token is valid, no need to refresh
          console.log('Token is still valid, no need to refresh');
          setLoading(false);
          return;
        }
        
        if (!refreshInProgress) {
          refreshInProgress = true;
          // Try to refresh the token if needed
          console.log('Attempting to refresh token...');
          try {
            const newToken = await refreshAccessToken();
            
            if (newToken) {
              // Token refresh succeeded, update user
              const freshUser = getCurrentUser();
              console.log('Token refreshed successfully, user:', freshUser.email);
              setUser(freshUser);
            } else {
              // If refresh failed but we still have a valid token, keep the user
              if (isAuthenticated()) {
                console.log('Token refresh failed but existing token is valid');
              } else {
                // No valid token, clear auth state
                console.log('No valid token available, clearing auth state');
                await clearTokens();
                setUser(null);
              }
            }
          } catch (refreshError) {
            console.error('Error during token refresh:', refreshError);
            // Don't clear tokens here - only do that if isAuthenticated() is false
            if (!isAuthenticated()) {
              await clearTokens();
              setUser(null);
            }
          } finally {
            refreshInProgress = false;
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // Login function with improved error handling for email verification
  const login = async (email, password) => {
    try {
      // Clear previous errors
      setAuthError('');
      
      console.log('Login attempt for:', email);
      
      const response = await fetch(`${getApiUrl()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      console.log('Login response status:', response.status);
      
      // Handle email verification error
      if (response.status === 403 && data.needsVerification) {
        console.log('Email not verified - response status 403 with needsVerification flag');
        setAuthError('Please verify your email address before logging in.');
        
        // Return detailed verification info from server
        return {
          success: false,
          needsVerification: true,
          verificationDetails: data.verificationDetails || { email }
        };
      }
      
      // Handle other errors
      if (!response.ok) {
        setAuthError(data.error || 'Login failed');
        return {
          success: false,
          error: data.error || 'Login failed'
        };
      }
      
      console.log('Login successful, user data:', data.user);
      
      // Store tokens securely - this will also store user data in localStorage
      setTokens(data.accessToken, data.refreshToken);
      
      // Update user state
      setUser(data.user);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.message || 'An unexpected error occurred');
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  };
  
  // Register function - updated to handle email verification
  const register = async (name, email, password) => {
    try {
      setAuthError('');
      
      const response = await fetch(`${getApiUrl()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      console.log('Registration response data:', {
        accessToken: data.accessToken ? 'present' : 'missing',
        refreshToken: data.refreshToken ? 'present' : 'missing',
        user: data.user ? 'present' : 'missing'
      });
      
      // Store tokens securely
      setTokens(data.accessToken, data.refreshToken);
      
      // Update user state
      setUser(data.user);
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setAuthError(error.message);
      return false;
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (email) => {
    try {
      setAuthError('');
      
      const response = await fetch(`${getApiUrl()}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email');
      }
      
      return true;
    } catch (error) {
      console.error('Resend verification error:', error);
      setAuthError(error.message);
      return false;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      setLoading(true);
      await clearTokens();
      setUser(null);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const contextValue = {
    user,
    isAuthenticated: !!user?.id && isAuthenticated(),
    loading,
    authError,
    login,
    register,
    logout,
    resendVerificationEmail,
    clearAuthError: () => setAuthError(''),
    authFetch, // Export authFetch for protected API calls
    setUser, // Expose setUser for updates after profile changes
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// Named exports compatible with Fast Refresh
export function AuthProvider(props) {
  return <AuthProviderComponent {...props} />;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
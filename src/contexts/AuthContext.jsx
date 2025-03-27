import { createContext, useContext, useState, useEffect } from 'react';
import { 
  setTokens, 
  clearTokens, 
  isAuthenticated, 
  clearAllAuthData, 
  getCurrentUser,
  refreshAccessToken,
  authFetch
} from '../services/authService';

const getApiUrl = () => {
  return import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL_PROD
    : import.meta.env.VITE_API_BASE_URL_LOCAL;
};

const AuthContext = createContext(null);

function AuthProviderComponent({ children }) {
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

  let refreshInProgress = false;
  
  useEffect(() => {
    const initAuth = async () => {
      try {      
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        
        if (!refreshInProgress && isAuthenticated()) {
          setLoading(false);
          return;
        }
        
        if (!refreshInProgress) {
          refreshInProgress = true;
          try {
            const newToken = await refreshAccessToken();
            
            if (newToken) {
              // Token refresh succeeded, update user
              const freshUser = getCurrentUser();
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
      
      
      const response = await fetch(`${getApiUrl()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      // Handle email verification error
      if (response.status === 403 && data.needsVerification) {
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

  // Register function - updated to prevent auto-authentication
  const register = async (name, email, password) => {
    try {
      setAuthError('');
      
      await clearTokens(); 
      localStorage.clear(); 
      sessionStorage.clear(); 
      
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
      
      return {
        success: true,
        email: email,
        message: data.message || 'Registration successful. Please verify your email address.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      setAuthError(error.message);
      return {
        success: false,
        error: error.message
      };
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

  // Logout handler with credential management
  const logout = async () => {
    try {
      setLoading(true);
      
      // Clear authentication data from cookies and storage
      const success = await clearAllAuthData();
      
      if (success) {
        // Dispatch logout event for other components to respond to
        const logoutEvent = new CustomEvent('user-logout');
        window.dispatchEvent(logoutEvent);
        
        // Clear user state
        setUser(null);
        
        // If Credential Management API is supported, clear stored credentials
        if (navigator.credentials && navigator.credentials.preventSilentAccess) {
          try {
            // This prevents the browser from automatically signing in the user next time
            await navigator.credentials.preventSilentAccess();
          } catch (credError) {
            console.error('Error clearing credential auto-sign-in:', credError);
          }
        }
      }
      
      // Reload page and redirect to login
      window.location.reload(true);
      window.location.href = '/login';
      
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
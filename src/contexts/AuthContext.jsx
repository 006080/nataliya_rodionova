import { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
      // Initialize from memory first
      if (window.currentUser) {
        return window.currentUser;
      }
      
      // Check for active session indicator
      const sessionActive = sessionStorage.getItem('sessionActive');
      return sessionActive === 'true' ? {} : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');


  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Check if we already have valid data in memory
        if (window.currentUser && window.accessToken) {
          setUser(window.currentUser);
          setLoading(false);
          return;
        }
        
        // Check if we have an active session
        const sessionActive = sessionStorage.getItem('sessionActive');
        if (sessionActive !== 'true') {
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Try to refresh token - with better error handling
        try {
          const newToken = await refreshAccessToken();
          
          if (newToken) {
            // Token refresh succeeded, update user state
            const freshUser = getCurrentUser();
            setUser(freshUser);
          } else {
            // Clear auth state if refresh failed
            await clearTokens();
            setUser(null);
            sessionStorage.removeItem('sessionActive');
          }
        } catch (refreshError) {
          console.error('Error refreshing token during initialization:', refreshError);
          
          // Only clear if no valid token exists
          if (!isAuthenticated()) {
            await clearTokens();
            setUser(null);
            sessionStorage.removeItem('sessionActive');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
    
    // Listen for visibility changes to sync auth state between tabs
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When tab becomes visible, check if we need to refresh auth
        const shouldRefresh = sessionStorage.getItem('sessionActive') === 'true' && !window.currentUser;
        if (shouldRefresh) {
          initAuth();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);


  useEffect(() => {
    // Listen for auth sync events from other tabs
    const handleAuthSync = () => {
      if (window.currentUser) {
        setUser(window.currentUser);
      }
    };
    
    window.addEventListener('auth-state-sync', handleAuthSync);
    
    return () => {
      window.removeEventListener('auth-state-sync', handleAuthSync);
    };
  }, []);


  // Login function
  const login = async (email, password) => {
    try {
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
      
      // Store tokens securely
      setTokens(data.accessToken, data.refreshToken, data.user);
      
      // Set session active marker
      sessionStorage.setItem('sessionActive', 'true');
      
      const completeUser = {
        id: data.user.id,
        role: data.user.role,
        emailVerified: data.user.emailVerified,
        name: data.user.name,
        email: data.user.email
      };
      
      // Update both in-memory storage and React state
      window.currentUser = completeUser;
      setUser(completeUser);
      // const userData = getCurrentUser();
      // setUser(userData);
      
      return { success: true };
    } catch (error) {
      setAuthError(error.message || 'An unexpected error occurred');
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      setAuthError('');
      
      await clearTokens(); 
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
      setAuthError(error.message);
      return false;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      setLoading(true);
      
      // Clear authentication data
      const success = await clearAllAuthData();
      
      if (success) {
        // Dispatch logout event
        const logoutEvent = new CustomEvent('user-logout');
        window.dispatchEvent(logoutEvent);
        
        // Clear user state
        setUser(null);
        
        // Clear session marker
        sessionStorage.removeItem('sessionActive');
        
        // Clear memory
        window.accessToken = null;
        window.currentUser = null;
        
        // Clear auto-sign-in
        if (navigator.credentials && navigator.credentials.preventSilentAccess) {
          try {
            await navigator.credentials.preventSilentAccess();
          } catch (credError) {
            // Continue despite credential error
          }
        }
      }
      
      // Reload page and redirect to login
      window.location.reload(true);
      window.location.href = '/login';
      
      return true;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user?.id && isAuthenticated(),
    loading,
    authError,
    login,
    register,
    logout,
    resendVerificationEmail,
    clearAuthError: () => setAuthError(''),
    authFetch,
    setUser: (newUserData) => {
      window.currentUser = newUserData;
      setUser(newUserData);
    },
  }), [user, loading, authError]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// Named exports
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
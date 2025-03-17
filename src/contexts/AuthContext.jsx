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
  const [user, setUser] = useState(getCurrentUser);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  
  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      // If we have a user but token is expired, try to refresh
      if (user?.id && !isAuthenticated()) {
        try {
          await refreshAccessToken();
          // Update user state with refreshed info
          setUser(getCurrentUser());
        } catch (error) {
          // Clear everything if refresh fails
          await clearTokens();
          setUser({});
        }
      }
      
      setLoading(false);
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
    
    console.log('Login response:', {
      status: response.status,
      data
    });
    
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
    
    // Store tokens securely
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
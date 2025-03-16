// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  setTokens, 
  clearTokens, 
  isAuthenticated, 
  getCurrentUser,
  refreshAccessToken
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
      
      const data = await response.json();
      console.log('Login response data:', {
        accessToken: data.accessToken ? 'present' : 'missing',
        refreshToken: data.refreshToken ? 'present' : 'missing',
        user: data.user ? 'present' : 'missing'
      });
      
      // Store tokens securely - checking if refreshToken exists
      if (!data.refreshToken) {
        console.warn('Server did not return a refresh token during login');
      }
      
      setTokens(data.accessToken, data.refreshToken);
      
      // Update user state
      setUser(data.user);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.message);
      return false;
    }
  };
  
  // Register function
  const register = async (name, email, password) => {
    try {
      setAuthError('');
      
      const response = await fetch(`${getApiUrl()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      
      const data = await response.json();
      console.log('Registration response data:', {
        accessToken: data.accessToken ? 'present' : 'missing',
        refreshToken: data.refreshToken ? 'present' : 'missing',
        user: data.user ? 'present' : 'missing'
      });
      
      // Store tokens securely (note that server might not return refreshToken directly in registration)
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
    clearAuthError: () => setAuthError(''),
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
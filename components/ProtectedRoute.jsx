import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { refreshAccessToken } from '../src/services/authService';

const ProtectedRoute = ({ children, roles = [], redirectPath = '/login' }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Try to refresh token if needed
    const checkAuth = async () => {
      // Don't attempt refresh if user has deliberately logged out - use correct flag name
      if (window.hasLoggedOut || sessionStorage.getItem('isUserLogout') === 'true') {
        setInitializing(false);
        return;
      }
      
      if (!isAuthenticated && !loading) {
        // Check if session should be active
        const sessionActive = sessionStorage.getItem('sessionActive');
        if (sessionActive === 'true') {
          try {
            const token = await refreshAccessToken();
            if (!token) {
              // If token refresh failed, consider the user logged out
              sessionStorage.removeItem('sessionActive');
            }
            // Wait briefly for auth context to update
            setTimeout(() => setInitializing(false), 500);
          } catch (error) {
            console.error("Token refresh failed in protected route", error);
            // If token refresh errors, remove session marker
            sessionStorage.removeItem('sessionActive');
            setInitializing(false);
          }
        } else {
          setInitializing(false);
        }
      } else {
        setInitializing(false);
      }
    };
    
    checkAuth();
  }, [isAuthenticated, loading]);

  // Show loading indicator while checking authentication
  if (loading || initializing) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // If roles are specified, check if user has required role
  if (roles.length > 0 && user) {
    const userRole = user.role;
    const hasRequiredRole = roles.includes(userRole);

    if (!hasRequiredRole) {
      // Redirect to unauthorized page
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If authenticated and has required role, render the children
  return children;
};

export default ProtectedRoute;
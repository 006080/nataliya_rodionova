// src/components/ProtectedRoute.js
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  roles = [], 
  redirectPath = '/login'
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading indicator while checking authentication
  if (loading) {
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
  if (roles.length > 0) {
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
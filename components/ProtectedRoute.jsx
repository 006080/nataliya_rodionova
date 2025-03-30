// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../src/contexts/AuthContext';

// const ProtectedRoute = ({ 
//   children, 
//   roles = [], 
//   redirectPath = '/login'
// }) => {
//   const { user, isAuthenticated, loading } = useAuth();
//   const location = useLocation();

//   // Show loading indicator while checking authentication
//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner"></div>
//         <p>Loading...</p>
//       </div>
//     );
//   }

//   // If not authenticated, redirect to login
//   if (!isAuthenticated) {
//     return (
//       <Navigate 
//         to={redirectPath} 
//         state={{ from: location.pathname }} 
//         replace 
//       />
//     );
//   }

//   // If roles are specified, check if user has required role
//   if (roles.length > 0) {
//     const userRole = user.role;
//     const hasRequiredRole = roles.includes(userRole);

//     if (!hasRequiredRole) {
//       // Redirect to unauthorized page
//       return <Navigate to="/unauthorized" replace />;
//     }
//   }

//   // If authenticated and has required role, render the children
//   return children;
// };

// export default ProtectedRoute;



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
      if (!isAuthenticated && !loading) {
        // Check if session should be active
        const sessionActive = sessionStorage.getItem('sessionActive');
        if (sessionActive === 'true') {
          try {
            const token = await refreshAccessToken();
            // Wait briefly for auth context to update
            setTimeout(() => setInitializing(false), 500);
          } catch (error) {
            console.error("Token refresh failed in protected route", error);
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
  if (roles.length > 0) {
    const userRole = user?.role;
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
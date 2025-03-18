// import { useState, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import styles from './VerifyEmail.module.css';
// import { clearPendingVerification, updateUserVerificationStatus } from '../src/utils/authHelpers';

// const VerifyEmail = () => {
//   const [status, setStatus] = useState('verifying');
//   const [message, setMessage] = useState('Verifying your email...');
//   const [errorDetails, setErrorDetails] = useState(null);
//   const { token } = useParams();
//   const navigate = useNavigate();
//   const verificationAttempted = useRef(false);
  
//   const getApiUrl = () => {
//     return import.meta.env.VITE_NODE_ENV === "production"
//       ? import.meta.env.VITE_API_BASE_URL_PROD
//       : import.meta.env.VITE_API_BASE_URL_LOCAL;
//   };
  
//   useEffect(() => {
//     const verifyEmail = async () => {
//       // Prevent double verification attempts
//       if (verificationAttempted.current) {
//         console.log('Verification already attempted, skipping duplicate request');
//         return;
//       }
      
//       if (!token) {
//         setStatus('error');
//         setMessage('Invalid verification link. No token provided.');
//         return;
//       }
      
//       try {
//         console.log('Verifying token:', token);
        
//         // Mark that we've attempted verification
//         verificationAttempted.current = true;
        
//         // Force clear any stale verification status from session storage
//         clearPendingVerification();
        
//         const response = await fetch(`${getApiUrl()}/api/auth/verify-email/${token}`);
//         const data = await response.json();
        
//         console.log('Verification response:', {
//           status: response.status,
//           data
//         });
        
//         // Store error details for debugging
//         if (!response.ok && !data.verified) {
//           setErrorDetails(data);
//         }
        
//         // Check if verification was successful or already done
//         if (response.ok || data.verified === true) {
//           setStatus('success');
//           setMessage(data.message || 'Email verified successfully! You can now login to your account.');
          
//           // Update the user object in localStorage to show verified
//           updateUserVerificationStatus(true);
          
//           // Clear any pending verification
//           clearPendingVerification();
//         } else {
//           setStatus('error');
//           setMessage(data.error || 'Failed to verify email. Please try again.');
//         }
//       } catch (error) {
//         console.error('Verification error:', error);
//         setStatus('error');
//         setMessage('An error occurred during verification. Please try again.');
//         setErrorDetails({
//           error: error.message
//         });
//       }
//     };
    
//     verifyEmail();
//   }, [token]);
  
//   // const handleReturn = () => {
//   //   // Force clear again before navigating to login
//   //   clearPendingVerification();
//   //   navigate('/login');
//   // };
//   // In VerifyEmail.js
// const handleReturn = () => {
//   // Don't navigate to login if already logged in
//   const user = JSON.parse(localStorage.getItem('user') || '{}');
  
//   if (user.id && window.accessToken) {
//     // User is already logged in, just update verification status
//     updateUserVerificationStatus(true);
//     navigate('/'); // Go to home page instead
//   } else {
//     // User needs to login
//     clearPendingVerification();
//     navigate('/login');
//   }
// };
  
//   const handleResend = async () => {
//     try {
//       setStatus('loading');
//       setMessage('Requesting new verification email...');
      
//       // Get email from session storage or ask user to provide it
//       let email = sessionStorage.getItem('pendingVerificationEmail');
      
//       if (!email) {
//         email = prompt('Please enter your email to receive a new verification link:');
//       }
      
//       if (!email) {
//         setStatus('error');
//         setMessage('Email is required to resend verification link.');
//         return;
//       }
      
//       const response = await fetch(`${getApiUrl()}/api/auth/resend-verification`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email })
//       });
      
//       const data = await response.json();
      
//       if (response.ok) {
//         setStatus('info');
//         setMessage('A new verification link has been sent to your email if it exists in our system.');
//         // Store email in session storage for convenience
//         sessionStorage.setItem('pendingVerificationEmail', email);
//       } else {
//         setStatus('error');
//         setMessage(data.error || 'Failed to resend verification email. Please try again.');
//       }
//     } catch (error) {
//       console.error('Resend verification error:', error);
//       setStatus('error');
//       setMessage('An error occurred. Please try again.');
//     }
//   };
  
  
//   return (
//     <div className={styles.container}>
//       <div className={`${styles.card} ${styles[status]}`}>
//         <h2>Email Verification</h2>
        
//         {status === 'verifying' && (
//           <div className={styles.spinner}></div>
//         )}
        
//         <p className={styles.message}>{message}</p>
        
//         <div className={styles.buttons}>
//           {status === 'success' && (
//             <button className={styles.primaryButton} onClick={handleReturn}>
//               Proceed to Login
//             </button>
//           )}
          
//           {status === 'error' && (
//             <>
//               <button className={styles.secondaryButton} onClick={handleResend}>
//                 Resend Verification
//               </button>
//               <button className={styles.primaryButton} onClick={handleReturn}>
//                 Return to Login
//               </button>
//             </>
//           )}
          
//           {status === 'info' && (
//             <button className={styles.primaryButton} onClick={handleReturn}>
//               Return to Login
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VerifyEmail;



import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './VerifyEmail.module.css';
import { clearPendingVerification, updateUserVerificationStatus } from '../src/utils/authHelpers';
import { getCurrentUser, isAuthenticated, refreshAccessToken } from '../src/services/authService';

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const [errorDetails, setErrorDetails] = useState(null);
  const { token } = useParams();
  const navigate = useNavigate();
  const verificationAttempted = useRef(false);
  
  const getApiUrl = () => {
    return import.meta.env.VITE_NODE_ENV === "production"
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL;
  };
  
  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent double verification attempts
      if (verificationAttempted.current) {
        console.log('Verification already attempted, skipping duplicate request');
        return;
      }
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }
      
      try {
        console.log('Verifying token:', token);
        
        // Mark that we've attempted verification
        verificationAttempted.current = true;
        
        // Force clear any stale verification status from session storage
        clearPendingVerification();
        
        const response = await fetch(`${getApiUrl()}/api/auth/verify-email/${token}`);
        const data = await response.json();
        
        console.log('Verification response:', {
          status: response.status,
          data
        });
        
        // Store error details for debugging
        if (!response.ok && !data.verified) {
          setErrorDetails(data);
        }
        
        // Check if verification was successful or already done
        if (response.ok || data.verified === true) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully! You can now login to your account.');
          
          // Update the user object in localStorage to show verified
          updateUserVerificationStatus(true);

          // If user is already logged in, update their session immediately
        const user = getCurrentUser();
        if (user && user.id) {
          // Trigger a token refresh to get updated user info with verified status
          try {
            await refreshAccessToken();
          } catch (error) {
            console.error('Failed to refresh token after verification:', error);
          }
        }
          // Clear any pending verification
          clearPendingVerification();
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email. Please try again.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
        setErrorDetails({
          error: error.message
        });
      }
    };
    
    verifyEmail();
  }, [token]);
  
  // const handleReturn = () => {
  //   // Force clear again before navigating to login
  //   clearPendingVerification();
  //   navigate('/login');
  // };
  // In VerifyEmail.js
// const handleReturn = () => {
//   // Don't navigate to login if already logged in
//   const user = JSON.parse(localStorage.getItem('user') || '{}');
  
//   if (user.id && window.accessToken) {
//     // User is already logged in, just update verification status
//     updateUserVerificationStatus(true);
//     navigate('/'); // Go to home page instead
//   } else {
//     // User needs to login
//     clearPendingVerification();
//     navigate('/login');
//   }
// };
// Replace the handleReturn function:
const handleReturn = () => {
  // Check if the user is already authenticated
  if (isAuthenticated()) {
    // User is already logged in, update verification status and go to home
    updateUserVerificationStatus(true);
    navigate('/');
  } else {
    // User needs to log in
    navigate('/login');
  }
};
  
  const handleResend = async () => {
    try {
      setStatus('loading');
      setMessage('Requesting new verification email...');
      
      // Get email from session storage or ask user to provide it
      let email = sessionStorage.getItem('pendingVerificationEmail');
      
      if (!email) {
        email = prompt('Please enter your email to receive a new verification link:');
      }
      
      if (!email) {
        setStatus('error');
        setMessage('Email is required to resend verification link.');
        return;
      }
      
      const response = await fetch(`${getApiUrl()}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('info');
        setMessage('A new verification link has been sent to your email if it exists in our system.');
        // Store email in session storage for convenience
        sessionStorage.setItem('pendingVerificationEmail', email);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to resend verification email. Please try again.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };
  
  
  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${styles[status]}`}>
        <h2>Email Verification</h2>
        
        {status === 'verifying' && (
          <div className={styles.spinner}></div>
        )}
        
        <p className={styles.message}>{message}</p>
        
        <div className={styles.buttons}>
          {status === 'success' && (
            <button className={styles.primaryButton} onClick={handleReturn}>
              Proceed to Login
            </button>
          )}
          
          {status === 'error' && (
            <>
              <button className={styles.secondaryButton} onClick={handleResend}>
                Resend Verification
              </button>
              <button className={styles.primaryButton} onClick={handleReturn}>
                Return to Login
              </button>
            </>
          )}
          
          {status === 'info' && (
            <button className={styles.primaryButton} onClick={handleReturn}>
              Return to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;



// import { useState, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import styles from './VerifyEmail.module.css';
// import { clearPendingVerification, updateUserVerificationStatus } from '../src/utils/authHelpers';
// import { getCurrentUser, isAuthenticated, refreshAccessToken } from '../src/services/authService';
// import { useAuth } from '../src/contexts/AuthContext';

// const VerifyEmail = () => {
//   const [status, setStatus] = useState('verifying');
//   const [message, setMessage] = useState('Verifying your email...');
//   const [errorDetails, setErrorDetails] = useState(null);
//   const { token } = useParams();
//   const navigate = useNavigate();
//   const verificationAttempted = useRef(false);
//   const { setUser } = useAuth(); // Get setUser from AuthContext
  
//   const getApiUrl = () => {
//     return import.meta.env.VITE_NODE_ENV === "production"
//       ? import.meta.env.VITE_API_BASE_URL_PROD
//       : import.meta.env.VITE_API_BASE_URL_LOCAL;
//   };
  
//   useEffect(() => {
//     const verifyEmail = async () => {
//       // Prevent double verification attempts
//       if (verificationAttempted.current) {
//         console.log('Verification already attempted, skipping duplicate request');
//         return;
//       }
      
//       if (!token) {
//         setStatus('error');
//         setMessage('Invalid verification link. No token provided.');
//         return;
//       }
      
//       try {
//         console.log('Verifying token:', token);
        
//         // Mark that we've attempted verification
//         verificationAttempted.current = true;
        
//         // Force clear any stale verification status from session storage
//         clearPendingVerification();
        
//         const response = await fetch(`${getApiUrl()}/api/auth/verify-email/${token}`);
//         const data = await response.json();
        
//         console.log('Verification response:', {
//           status: response.status,
//           data
//         });
        
//         // Store error details for debugging
//         if (!response.ok && !data.verified) {
//           setErrorDetails(data);
//         }
        
//         // Check if verification was successful or already done
//         if (response.ok || data.verified === true) {
//           setStatus('success');
//           setMessage(data.message || 'Email verified successfully! You can now login to your account.');
          
//           // Update the user object in localStorage to show verified
//           updateUserVerificationStatus(true);

//           // If user is already logged in, update their session immediately
//           const user = getCurrentUser();
//           if (user && user.id) {
//             // Trigger a token refresh to get updated user info with verified status
//             try {
//               await refreshAccessToken();
              
//               // Important: Update the React state in AuthContext with the refreshed user data
//               const updatedUser = getCurrentUser();
//               setUser(updatedUser);
//               console.log('Updated user state after verification:', updatedUser);
//             } catch (error) {
//               console.error('Failed to refresh token after verification:', error);
//             }
//           }
//           // Clear any pending verification
//           clearPendingVerification();
//         } else {
//           setStatus('error');
//           setMessage(data.error || 'Failed to verify email. Please try again.');
//         }
//       } catch (error) {
//         console.error('Verification error:', error);
//         setStatus('error');
//         setMessage('An error occurred during verification. Please try again.');
//         setErrorDetails({
//           error: error.message
//         });
//       }
//     };
    
//     verifyEmail();
//   }, [token, setUser]);
  
//   const handleReturn = () => {
//     // Check if the user is already authenticated
//     if (isAuthenticated()) {
//       // User is already logged in, update verification status and go to home
//       updateUserVerificationStatus(true);
//       navigate('/');
//     } else {
//       // User needs to log in
//       navigate('/login');
//     }
//   };
  
//   const handleResend = async () => {
//     try {
//       setStatus('loading');
//       setMessage('Requesting new verification email...');
      
//       // Get email from session storage or ask user to provide it
//       let email = sessionStorage.getItem('pendingVerificationEmail');
      
//       if (!email) {
//         email = prompt('Please enter your email to receive a new verification link:');
//       }
      
//       if (!email) {
//         setStatus('error');
//         setMessage('Email is required to resend verification link.');
//         return;
//       }
      
//       const response = await fetch(`${getApiUrl()}/api/auth/resend-verification`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email })
//       });
      
//       const data = await response.json();
      
//       if (response.ok) {
//         setStatus('info');
//         setMessage('A new verification link has been sent to your email if it exists in our system.');
//         // Store email in session storage for convenience
//         sessionStorage.setItem('pendingVerificationEmail', email);
//       } else {
//         setStatus('error');
//         setMessage(data.error || 'Failed to resend verification email. Please try again.');
//       }
//     } catch (error) {
//       console.error('Resend verification error:', error);
//       setStatus('error');
//       setMessage('An error occurred. Please try again.');
//     }
//   };
  
  
//   return (
//     <div className={styles.container}>
//       <div className={`${styles.card} ${styles[status]}`}>
//         <h2>Email Verification</h2>
        
//         {status === 'verifying' && (
//           <div className={styles.spinner}></div>
//         )}
        
//         <p className={styles.message}>{message}</p>
        
//         <div className={styles.buttons}>
//           {status === 'success' && (
//             <button className={styles.primaryButton} onClick={handleReturn}>
//               Proceed to Login
//             </button>
//           )}
          
//           {status === 'error' && (
//             <>
//               <button className={styles.secondaryButton} onClick={handleResend}>
//                 Resend Verification
//               </button>
//               <button className={styles.primaryButton} onClick={handleReturn}>
//                 Return to Login
//               </button>
//             </>
//           )}
          
//           {status === 'info' && (
//             <button className={styles.primaryButton} onClick={handleReturn}>
//               Return to Login
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VerifyEmail;
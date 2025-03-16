import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './VerifyEmail.module.css';
import { clearPendingVerification, updateUserVerificationStatus } from '../src/utils/authHelpers';

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const [responseData, setResponseData] = useState(null);
  const { token } = useParams();
  const navigate = useNavigate();
  
  const getApiUrl = () => {
    return import.meta.env.VITE_NODE_ENV === "production"
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL;
  };
  
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }
      
      try {
        console.log('Verifying token:', token);
        
        // Force clear any stale verification status from session storage
        clearPendingVerification();
        
        const response = await fetch(`${getApiUrl()}/api/auth/verify-email/${token}`);
        const data = await response.json();
        
        // Store the full response data for debugging
        setResponseData(data);
        
        console.log('Verification response:', {
          status: response.status,
          data
        });
        
        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully! You can now login to your account.');
          
          // Update the user object in localStorage if it exists to show verified
          updateUserVerificationStatus(true);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email. Please try again.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };
    
    verifyEmail();
  }, [token]);
  
  const handleReturn = () => {
    // Force clear again before navigating to login
    clearPendingVerification();
    navigate('/login');
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
        
        {/* Show raw response data in development for debugging */}
        {process.env.NODE_ENV !== 'production' && responseData && (
          <div className={styles.debug}>
            <pre>{JSON.stringify(responseData, null, 2)}</pre>
          </div>
        )}
        
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
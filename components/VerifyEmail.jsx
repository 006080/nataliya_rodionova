import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './VerifyEmail.module.css';
import { clearPendingVerification, updateUserVerificationStatus } from '../src/utils/authHelpers';
import { isAuthenticated } from '../src/services/authService';

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const [errorDetails, setErrorDetails] = useState(null);
  const { token } = useParams();
  const navigate = useNavigate();
  const verificationAttempted = useRef(false);
  
  // States for the custom email form
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const getApiUrl = () => {
    return import.meta.env.VITE_NODE_ENV === "production"
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL;
  };
  
  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent double verification attempts
      if (verificationAttempted.current) {
        return;
      }
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }
      
      try {
        
        verificationAttempted.current = true;
        
        // Force clear any stale verification status from session storage
        clearPendingVerification();
        
        const response = await fetch(`${getApiUrl()}/api/auth/verify-email/${token}`);
        const data = await response.json();
        
        
        if (!response.ok && !data.verified) {
          setErrorDetails(data);
        }
        
        if (response.ok || data.verified === true) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully! You can now login to your account.');
          
          clearPendingVerification();
          
          navigate('/login', { 
            state: { 
              verified: true,
              message: 'Your email has been verified! You can now log in to your account.'
            } 
          });
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
  }, [token, navigate]);

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
    // Get email from session storage
    let storedEmail = sessionStorage.getItem('pendingVerificationEmail');
    
    if (storedEmail) {
      // If we have the email in session storage, use it directly
      await sendVerificationEmail(storedEmail);
    } else {
      // Show the email form to collect the email
      setShowEmailForm(true);
    }
  };
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    // Hide the form and send the verification email
    setShowEmailForm(false);
    await sendVerificationEmail(email);
  };
  
  const sendVerificationEmail = async (emailAddress) => {
    try {
      setStatus('loading');
      setMessage('Requesting new verification email...');
      
      const response = await fetch(`${getApiUrl()}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAddress })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('info');
        setMessage('A new verification link has been sent to your email if it exists in our system.');
        // Store email in session storage for convenience
        sessionStorage.setItem('pendingVerificationEmail', emailAddress);
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
  
  // Render the custom email form
  const renderEmailForm = () => {
    return (
      <div className={styles.emailFormOverlay}>
        <div className={styles.emailFormContainer}>
          <h3>Resend Verification Email</h3>
          <p>Please enter your email address to receive a new verification link.</p>
          
          <form onSubmit={handleEmailSubmit} className={styles.emailForm}>
            {emailError && (
              <div className={styles.emailError}>{emailError}</div>
            )}
            
            <div className={styles.emailInputGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(''); // Clear error when typing
                }}
                placeholder="your@email.com"
                autoFocus
              />
            </div>
            
            <div className={styles.emailFormButtons}>
              <button 
                type="button" 
                className={styles.secondaryButton}
                onClick={() => setShowEmailForm(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={styles.primaryButton}
              >
                Send Verification Link
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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
      
      {/* Render the email form overlay when needed */}
      {showEmailForm && renderEmailForm()}
    </div>
  );
};

export default VerifyEmail;
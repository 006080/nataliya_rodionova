import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import styles from './LoginForm.module.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  
  const { login, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Default to home page if no 'from' is provided
  const from = location.state?.from || '/';
  
  useEffect(() => {
    console.log('LoginForm mounted');
    
    // Load remembered email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRemember(true);
    }
  }, []);
  
  useEffect(() => {
    if (location.state) {
      if (location.state.verificationNeeded) {
        setInfoMessage(location.state.message || 'Please verify your email before logging in.');
        setEmail(location.state.email || email); 
      }
      
      if (location.state.verified) {
        setInfoMessage(location.state.message || 'Your email has been verified! You can now log in.');
      }

      // Clear the location state to avoid persisting messages
      window.history.replaceState({}, document.title);
    }
  }, [location, email]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('LoginForm: Form submission started');

    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    
    if (!password) {
      setFormError('Password is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError('');
      setNeedsVerification(false);
      
      console.log('LoginForm: Attempting login with email:', email);  
      const result = await login(email, password);
      console.log('LoginForm: Login result:', result);
      
      if (result.success) {
        // Handle "remember me" option
        if (remember) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        // CRITICAL FIX: Handle account restoration redirection
        if (result.accountRestored) {
          console.log('LoginForm: Account restoration detected - redirecting to welcome-back page');
          
          // Set a reliable flag for the welcome back page
          window.accountWasJustRestored = true;
          
          // Redirect to welcome back page
          navigate('/welcome-back', { 
            replace: true, 
            state: { 
              from,
              isAccountRestoration: true // Flag to ensure we know this is a restoration flow
            } 
          });
          return;
        }
        
        // Normal login flow - if result has preventReload, navigate programmatically
        if (result.preventReload) {
          console.log(`LoginForm: Navigating to: ${result.redirectingTo || '/'}`);
          navigate(result.redirectingTo || '/', { replace: true });
        } else {
          console.log('LoginForm: Normal login - page will reload/redirect via loginUser');
        }
      } 
      else if (result.needsVerification) {
        console.log('LoginForm: Email verification required');
        setNeedsVerification(true);
        setInfoMessage('');
      }
      else {
        console.log('LoginForm: Login failed:', result.error);
        setFormError(result.error || 'Login failed');
        setInfoMessage('');
      }
    } catch (error) {
      console.error('LoginForm: Submission error:', error);
      setFormError('An unexpected error occurred.');
      setInfoMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResendVerification = async () => {
    if (!email.trim()) {
      setFormError('Email is required to resend verification');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError('');
      
      const success = await resendVerificationEmail(email);
      
      if (success) {
        setInfoMessage('Verification email has been sent. Please check your inbox.');
        setNeedsVerification(false);
      }
    } catch (error) {
      console.error('Failed to resend verification:', error);
      setFormError('Failed to resend verification email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2>Login to Your Account</h2>
      
      {infoMessage && (
        <div className={styles.infoMessage}>
          {infoMessage}
        </div>
      )}
      
      {formError && (
        <div className={styles.errorMessage}>
          {formError}
        </div>
      )}
      
      {needsVerification && (
        <div className={styles.verificationMessage}>
          <p>Please verify your email address before logging in.</p>
          <button 
            onClick={handleResendVerification}
            disabled={isSubmitting}
            className={styles.resendButton}
          >
            Resend Verification Email
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            placeholder="your@email.com"
            autoComplete="email"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            autoComplete="current-password"
          />
        </div>
        
        <div className={styles.formOptions}>
          <div className={styles.rememberMe}>
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={isSubmitting}
            />
            <label htmlFor="remember">Remember me</label>
          </div>
          
          <a href="/forgot-password" className={styles.forgotPassword}>
            Forgot Password?
          </a>
        </div>
        
        <button
          type="submit"
          className={styles.loginButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className={styles.registerLink}>
        Don't have an account? <a href="/register">Register here</a>
      </div>
    </div>
  );
};

export default LoginForm;
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import verificationStyles from './LoginForm.module.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationDetails, setVerificationDetails] = useState(null);
  
  const { login, authError, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state, or default to homepage
  const from = location.state?.from || '/';
  
  // Load remembered email if available
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRemember(true);
    }
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
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
      // Reset verification flag before login attempt
      setNeedsVerification(false);
      setVerificationDetails(null);
      
      // Attempt login
      const result = await login(email, password);
      
      console.log('Login result:', result);
      
      // Handle successful login
      if (result.success) {
        // If remember me is checked, store email in localStorage
        if (remember) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        // Redirect to the page user was trying to access, or home
        navigate(from, { replace: true });
      } 
      // Handle verification needed
      else if (result.needsVerification) {
        console.log('Email verification needed:', result.verificationDetails);
        setNeedsVerification(true);
        setVerificationDetails(result.verificationDetails);
      }
      // Handle other errors 
      else {
        setFormError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login submission error:', error);
      setFormError('An unexpected error occurred.');
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
        alert('Verification email has been sent. Please check your inbox.');
      }
    } catch (error) {
      console.error('Failed to resend verification:', error);
      setFormError('Failed to resend verification email.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Debug information in development mode
  const DebugInfo = () => {
    if (process.env.NODE_ENV !== 'production' && verificationDetails) {
      return (
        <div style={{background: '#f5f5f5', padding: '5px', margin: '5px 0', fontSize: '12px'}}>
          <h4>Verification Details</h4>
          <pre>{JSON.stringify(verificationDetails, null, 2)}</pre>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="login-container">
      <h2>Login to Your Account</h2>
      
      <DebugInfo />
      
      {formError && (
        <div className="error-message">
          {formError}
        </div>
      )}
      
      {needsVerification && (
        <div className={verificationStyles.verificationMessage}>
          <p>Please verify your email address before logging in.</p>
          <button 
            onClick={handleResendVerification}
            disabled={isSubmitting}
            className={verificationStyles.resendButton}
          >
            Resend Verification Email
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
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
        
        <div className="form-group">
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
        
        <div className="form-options">
          <div className="remember-me">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={isSubmitting}
            />
            <label htmlFor="remember">Remember me</label>
          </div>
          
          <a href="/forgot-password" className="forgot-password">
            Forgot Password?
          </a>
        </div>
        
        <button
          type="submit"
          className="login-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="register-link">
        Don't have an account? <a href="/register">Register here</a>
      </div>
    </div>
  );
};

export default LoginForm;
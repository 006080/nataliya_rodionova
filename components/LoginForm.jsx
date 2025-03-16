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
  
  const { login, authError, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Debug logging for verification status
  console.log('=== LOGIN FORM DEBUG ===');
  console.log('Initial Need Verification State:', needsVerification);
  console.log('Auth Error:', authError);
  console.log('Pending Verification Email:', sessionStorage.getItem('pendingVerificationEmail'));
  
  // Get redirect path from location state, or default to homepage
  const from = location.state?.from || '/';
  
  // IMPORTANT FIX: Clear pending verification on mount if user is verified
  useEffect(() => {
    // Check if user is verified from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('User from localStorage:', user);
        
        // If user is verified, clear any pending verification
        if (user && user.emailVerified) {
          console.log('User is verified, clearing pendingVerificationEmail');
          sessionStorage.removeItem('pendingVerificationEmail');
          setNeedsVerification(false);
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    
    // Load remembered email
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRemember(true);
    }
    
    // Only set pending verification if there's no verified user in localStorage
    const pendingEmail = sessionStorage.getItem('pendingVerificationEmail');
    const shouldShowVerification = pendingEmail && 
      (!userStr || !JSON.parse(userStr)?.emailVerified);
    
    console.log('Should show verification?', shouldShowVerification);
    
    if (pendingEmail) {
      setEmail(pendingEmail);
      if (shouldShowVerification) {
        setNeedsVerification(true);
      } else {
        // Clear it if we shouldn't show verification
        sessionStorage.removeItem('pendingVerificationEmail');
      }
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
      // IMPORTANT: Reset verification flag before login attempt
      setNeedsVerification(false);
      
      // Attempt login
      const success = await login(email, password);
      
      console.log('Login success:', success);
      console.log('Auth error after login:', authError);
      
      if (success) {
        // If remember me is checked, store email in localStorage
        if (remember) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        // IMPORTANT FIX: Always clear pending verification on successful login
        sessionStorage.removeItem('pendingVerificationEmail');
        
        // Redirect to the page user was trying to access, or home
        navigate(from, { replace: true });
      } else if (authError && authError.includes('verify your email')) {
        // Show verification needed message
        console.log('Setting needs verification to true due to auth error');
        setNeedsVerification(true);
        // Store email for easy resending
        sessionStorage.setItem('pendingVerificationEmail', email);
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
      const success = await resendVerificationEmail(email);
      
      if (success) {
        setFormError('');
        alert('Verification email has been sent. Please check your inbox.');
      }
    } catch (error) {
      console.error('Failed to resend verification:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Additional debug logging
  console.log('Final needsVerification state:', needsVerification);
  
  return (
    <div className="login-container">
      <h2>Login to Your Account</h2>
      
      {(formError || (authError && !needsVerification)) && (
        <div className="error-message">
          {formError || authError}
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
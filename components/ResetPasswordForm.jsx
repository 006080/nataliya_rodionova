import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ResetPasswordForm.module.css';

const ResetPasswordForm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(null);
  const { token } = useParams();
  const navigate = useNavigate();

  const getApiUrl = () => {
    return import.meta.env.VITE_NODE_ENV === "production"
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL;
  };
  
  // Password strength checker (same as RegisterForm)
  const checkPasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return {
      score: strength,
      label: ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong'][strength - 1] || '',
      color: ['#ff0000', '#ff4500', '#ffa500', '#9acd32', '#008000'][strength - 1] || ''
    };
  };
  
  const passwordStrength = checkPasswordStrength(password);
  
  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. No token provided.');
      setTokenValid(false);
    }
  }, [token]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!password) {
      setError('Password is required');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (passwordStrength.score < 3) {
      setError('Please use a stronger password');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      setMessage('');
      
      const response = await fetch(`${getApiUrl()}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
      
      setMessage('Your password has been reset successfully.');
      // Clear form
      setPassword('');
      setConfirmPassword('');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message);
      setTokenValid(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (tokenValid === false) {
    return (
      <div className={styles.loginContainer}>
        <h2>Reset Password</h2>
        <div className={styles.errorMessage}>
          {error || 'Invalid or expired reset link. Please request a new one.'}
        </div>
        <div className={styles.registerLink}>
          <a href="/forgot-password" className={styles.link}>Request a new password reset</a>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.loginContainer}>
      <h2>Reset Your Password</h2>
      
      {message && (
        <div className={styles.infoMessage}>
          {message}
        </div>
      )}
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            autoComplete="new-password"
          />
          
          {password && (
            <div className={styles.passwordStrength}>
              <div 
                className={styles.strengthMeter} 
                style={{ 
                  width: `${(passwordStrength.score / 5) * 100}%`,
                  backgroundColor: passwordStrength.color
                }}
              ></div>
              <span className={styles.strengthText}>{passwordStrength.label}</span>
            </div>
          )}
          
          <ul className={styles.passwordRequirements}>
            <li className={password.length >= 8 ? styles.met : ''}>
              At least 8 characters
            </li>
            <li className={/[A-Z]/.test(password) ? styles.met : ''}>
              Contains uppercase letter
            </li>
            <li className={/[a-z]/.test(password) ? styles.met : ''}>
              Contains lowercase letter
            </li>
            <li className={/[0-9]/.test(password) ? styles.met : ''}>
              Contains a number
            </li>
            <li className={/[^A-Za-z0-9]/.test(password) ? styles.met : ''}>
              Contains special character
            </li>
          </ul>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
            autoComplete="new-password"
          />
          
          {password && confirmPassword && (
            <div className={`${styles.passwordMatch} ${password === confirmPassword ? styles.matched : styles.notMatched}`}>
              {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className={styles.loginButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>
      
      <div className={styles.registerLink}>
        Remember your password? <a href="/login" className={styles.link}>Login here</a>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
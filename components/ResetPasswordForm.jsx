// src/components/ResetPasswordForm.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPasswordForm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(null);
  const { token } = useParams();
  const navigate = useNavigate();
  
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
      
      const response = await fetch(`http://localhost:4000/api/auth/reset-password/${token}`, {
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
      <div className="reset-password-container">
        <h2>Reset Password</h2>
        <div className="error-message">
          {error || 'Invalid or expired reset link. Please request a new one.'}
        </div>
        <div className="login-link">
          <a href="/forgot-password">Request a new password reset</a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="reset-password-container">
      <h2>Reset Your Password</h2>
      
      {message && (
        <div className="success-message">
          {message}
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
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
            <div className="password-strength">
              <div 
                className="strength-meter" 
                style={{ 
                  width: `${(passwordStrength.score / 5) * 100}%`,
                  backgroundColor: passwordStrength.color
                }}
              ></div>
              <span className="strength-text">{passwordStrength.label}</span>
            </div>
          )}
          
          <ul className="password-requirements">
            <li className={password.length >= 8 ? 'met' : ''}>
              At least 8 characters
            </li>
            <li className={/[A-Z]/.test(password) ? 'met' : ''}>
              Contains uppercase letter
            </li>
            <li className={/[a-z]/.test(password) ? 'met' : ''}>
              Contains lowercase letter
            </li>
            <li className={/[0-9]/.test(password) ? 'met' : ''}>
              Contains a number
            </li>
            <li className={/[^A-Za-z0-9]/.test(password) ? 'met' : ''}>
              Contains special character
            </li>
          </ul>
        </div>
        
        <div className="form-group">
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
            <div className={`password-match ${password === confirmPassword ? 'matched' : 'not-matched'}`}>
              {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className="reset-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>
      
      <div className="login-link">
        Remember your password? <a href="/login">Login here</a>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
// src/components/RegisterForm.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, authError } = useAuth();
  const navigate = useNavigate();
  
  // Password strength checker
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!name.trim()) {
      setFormError('Name is required');
      return;
    }
    
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    
    if (!password) {
      setFormError('Password is required');
      return;
    }
    
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (passwordStrength.score < 3) {
      setFormError('Please use a stronger password');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError('');
      
      // Attempt registration
      const success = await register(name, email, password);
      
      if (success) {
        // Redirect to homepage after registration
        navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setFormError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="register-container">
      <h2>Create Account</h2>
      
      {(formError || authError) && (
        <div className="error-message">
          {formError || authError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            placeholder="John Doe"
            autoComplete="name"
          />
        </div>
        
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
        
        <div className="terms-agreement">
          <p>
            By creating an account, you agree to our{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </p>
        </div>
        
        <button
          type="submit"
          className="register-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      <div className="login-link">
        Already have an account? <a href="/login">Login here</a>
      </div>
    </div>
  );
};

export default RegisterForm;
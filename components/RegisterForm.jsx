import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import styles from './RegisterForm.module.css';

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
    
    // Form validation (keep existing validation code)
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
      const result = await register(name, email, password);
      
      if (result && result.success) {
        // Redirect to login page with verification message
        navigate('/login', { 
          state: { 
            verificationNeeded: true,
            email: email,
            message: 'Registration successful! Please check your email to verify your account before logging in.'
          } 
        });
      } else {
        setFormError(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setFormError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };


  
  return (
    <div className={styles.loginContainer}>
      <h2>Create Account</h2>
      
      {(formError || authError) && (
        <div className={styles.errorMessage}>
          {formError || authError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
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
        
        <div className={styles.termsAgreement}>
          <p>
            By creating an account, you agree to our{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className={styles.link}>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className={styles.link}>
              Privacy Policy
            </a>
          </p>
        </div>
        
        <button
          type="submit"
          className={styles.loginButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      <div className={styles.registerLink}>
        Already have an account? <a href="/login" className={styles.link}>Login here</a>
      </div>
    </div>
  );
};

export default RegisterForm;
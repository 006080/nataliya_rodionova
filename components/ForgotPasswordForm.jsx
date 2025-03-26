import { useState } from 'react';
import styles from './ForgotPasswordForm.module.css';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const getApiUrl = () => {
    return import.meta.env.VITE_NODE_ENV === "production"
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      setMessage('');
      
      const response = await fetch(`${getApiUrl()}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send password reset request');
      }
      
      setMessage('If your email exists in our system, you will receive a password reset link.');
      setEmail(''); // Clear the form
    } catch (error) {
      console.error('Password reset request error:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={styles.loginContainer}>
      <h2>Forgot Password</h2>
      
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
        
        <button
          type="submit"
          className={styles.loginButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Reset Password'}
        </button>
      </form>
      
      <div className={styles.registerLink}>
        Remember your password? <a href="/login" className={styles.link}>Login here</a>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
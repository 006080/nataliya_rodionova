// src/components/ForgotPasswordForm.js
import { useState } from 'react';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
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
      
      const response = await fetch('http://localhost:4000/api/auth/forgot-password', {
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
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      
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
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Reset Password'}
        </button>
      </form>
      
      <div className="login-link">
        Remember your password? <a href="/login">Login here</a>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
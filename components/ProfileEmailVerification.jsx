// src/components/ProfileEmailVerification.js
import { useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';

const ProfileEmailVerification = () => {
  const { user, resendVerificationEmail } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const handleResendVerification = async () => {
    if (!user || !user.email) {
      setError('User email is not available');
      return;
    }
    
    try {
      setIsSending(true);
      setMessage('');
      setError('');
      
      const success = await resendVerificationEmail(user.email);
      
      if (success) {
        setMessage('Verification email has been sent. Please check your inbox.');
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };
  
  if (!user) {
    return <div>Loading user information...</div>;
  }
  
  return (
    <div className="email-verification-section">
      <h3>Email Verification</h3>
      
      <div className="verification-status">
        <p>
          <strong>Status:</strong>{' '}
          <span className={user.emailVerified ? 'verified' : 'not-verified'}>
            {user.emailVerified ? 'Verified' : 'Not Verified'}
          </span>
        </p>
        
        {!user.emailVerified && (
          <>
            <p>
              Your email address has not been verified. Please check your inbox for a verification link,
              or request a new verification email.
            </p>
            
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
            
            <button
              onClick={handleResendVerification}
              disabled={isSending}
              className="resend-verification-button"
            >
              {isSending ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileEmailVerification;
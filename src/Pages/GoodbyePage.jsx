import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './GoodbyePage.module.css';

const GoodbyePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  
  const accountDeleted = location.state?.accountDeleted || false;
  const restorationDate = location.state?.restorationDate ? new Date(location.state.restorationDate) : null;
  
  const formatDate = (date) => {
    if (!date) return 'in 30 days';
    
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  useEffect(() => {
    // Redirect to home page after countdown
    const timer = setTimeout(() => {
      navigate('/');
    }, countdown * 1000);
    
    // Countdown effect
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [navigate]);
  
  return (
    <div className={styles.goodbyeContainer}>
      <div className={styles.goodbyeCard}>
        <div className={styles.goodbyeIcon}>
          {accountDeleted ? '👋' : '🔒'}
        </div>
        
        <h1 className={styles.goodbyeTitle}>
          {accountDeleted ? 'Account Scheduled for Deletion' : 'You\'ve Been Logged Out'}
        </h1>
        
        {accountDeleted ? (
          <div className={styles.deletionInfo}>
            <p>
              Your account has been scheduled for permanent deletion. All your personal information
              will be removed from our systems on <strong>{formatDate(restorationDate)}</strong>.
            </p>
            
            <div className={styles.restoreBox}>
              <h3>Changed your mind?</h3>
              <p>
                You can restore your account at any time before {formatDate(restorationDate)} by simply 
                logging in with your current credentials.
              </p>
              <button 
                onClick={() => navigate('/login')}
                className={styles.restoreButton}
              >
                Restore My Account
              </button>
            </div>
            
            <p className={styles.moreInfo}>
              If you have any questions about your account or the deletion process, 
              please contact our customer support team.
            </p>
          </div>
        ) : (
          <p className={styles.goodbyeMessage}>
            Thank you for visiting our store. We hope to see you again soon!
          </p>
        )}
        
        <div className={styles.countdown}>
          Redirecting to home page in {countdown} seconds...
        </div>
        
        <div className={styles.navigationButtons}>
          <button 
            onClick={() => navigate('/')}
            className={styles.homeButton}
          >
            Return to Home Page
          </button>
          
          {!accountDeleted && (
            <button 
              onClick={() => navigate('/login')}
              className={styles.loginButton}
            >
              Log In Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoodbyePage;
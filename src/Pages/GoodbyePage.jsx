import { useLocation, useNavigate } from 'react-router-dom';
import styles from './GoodbyePage.module.css';

const GoodbyePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
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
  
  const handleRestore = () => {
    navigate('/login', { 
      state: { 
        attemptingRestore: true
      } 
    });
  };
  
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
            
            <div className={styles.dataInfo}>
              <h3>What happens to your data:</h3>
              <ul className={styles.dataList}>
                <li>Your profile information will be permanently deleted</li>
                <li>Your cart items and favorites will be removed</li>
                <li>Your order history will be kept for business records but anonymized</li>
                <li>Your reviews and feedback will remain visible but will be anonymized</li>
              </ul>
            </div>
            
            <div className={styles.restoreBox}>
              <h3>Changed your mind?</h3>
              <p>
                You can restore your account at any time before {formatDate(restorationDate)} by simply 
                logging in with your current credentials.
              </p>
              <button 
                onClick={handleRestore}
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
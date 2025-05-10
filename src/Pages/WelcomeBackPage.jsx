import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './WelcomeBackPage.module.css';

const WelcomeBackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/profile';
  
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(from);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [navigate, from]);
  
  return (
    <div className={styles.welcomeBackContainer}>
      <div className={styles.welcomeBackCard}>
        <div className={styles.welcomeBackIcon}>
          🎉
        </div>
        
        <h1 className={styles.welcomeBackTitle}>Welcome Back!</h1>
        
        <div className={styles.messageBox}>
          <p className={styles.welcomeBackMessage}>
            We're delighted to see you again! Your account has been fully restored.
          </p>
          
          <ul className={styles.restoredItemsList}>
            <li>Your personal profile information is restored</li>
            <li>Your order history is fully accessible</li>
            <li>Your reviews and feedback remain connected to your account</li>
            <li>Your cart items and favorited products are available</li>
          </ul>
          
          <p className={styles.continueBrowsing}>
            You'll be automatically redirected to your profile in a few seconds, or you can click the button below to continue.
          </p>
        </div>
        
        <div className={styles.navigationButtons}>
          <button 
            onClick={() => navigate('/profile')}
            className={styles.profileButton}
          >
            Go to My Profile
          </button>
          <button 
            onClick={() => navigate('/')}
            className={styles.homeButton}
          >
            Browse Shop
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBackPage;
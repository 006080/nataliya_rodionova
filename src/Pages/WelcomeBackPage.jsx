import { useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './WelcomeBackPage.module.css';

const WelcomeBackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from || '/profile';
  const isAccountRestoration = location.state?.isAccountRestoration || false;
  
  useEffect(() => {
    console.log('WelcomeBackPage mounted, checking restoration state');
    
    const wasRestored = window.accountWasJustRestored === true || isAccountRestoration;
    
    if (!wasRestored) {
      console.log('WelcomeBackPage: Not a restoration flow, redirecting to profile');
      navigate('/profile', { replace: true });
      return;
    }
  }, [navigate, from, isAccountRestoration]);
  
  const handleContinue = () => {
    navigate(from, { 
      replace: true,
      state: { 
        fromWelcomeBack: true 
      }
    });
  };
  
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
        </div>
        
        <div className={styles.navigationButtons}>
          <button 
            onClick={handleContinue}
            className={styles.profileButton}
          >
            Continue Now
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
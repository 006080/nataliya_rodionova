import { useState, useEffect } from 'react';
import styles from './WelcomeBackNotification.module.css';

const WelcomeBackNotification = ({ onClose }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onClose && onClose();
      }, 500); 
    }, 12000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose && onClose();
    }, 500); 
  };
  
  return (
    <div className={`${styles.welcomeBackContainer} ${visible ? styles.visible : styles.hidden}`}>
      <div className={styles.welcomeBackContent}>
        <div className={styles.welcomeBackIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
          </svg>
        </div>
        <div className={styles.welcomeBackMessage}>
          <h4>Welcome Back!</h4>
          <p>We're delighted to see you again. Your account has been fully restored, and all your data is available just as you left it.</p>
        </div>
        <button className={styles.closeButton} onClick={handleClose}>×</button>
      </div>
    </div>
  );
};

export default WelcomeBackNotification;
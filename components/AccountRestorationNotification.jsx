import { useState, useEffect } from 'react';
import styles from './AccountRestorationNotification.module.css';

const AccountRestorationNotification = ({ onClose }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    // Auto-hide notification after 8 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onClose && onClose();
      }, 500); // Allow time for fade-out animation
    }, 8000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose && onClose();
    }, 500); // Allow time for fade-out animation
  };
  
  return (
    <div className={`${styles.notificationContainer} ${visible ? styles.visible : styles.hidden}`}>
      <div className={styles.notificationContent}>
        <div className={styles.notificationIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <div className={styles.notificationMessage}>
          <h4>Account Successfully Restored!</h4>
          <p>Your account and all your data have been fully restored. Welcome back!</p>
        </div>
        <button className={styles.closeButton} onClick={handleClose}>×</button>
      </div>
    </div>
  );
};

export default AccountRestorationNotification;
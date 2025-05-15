import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import { authFetch } from '../src/services/authService';
import styles from './DeleteAccountModule.module.css';

const DeleteAccountModule = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [step, setStep] = useState(1);

  const getApiUrl = () => {
    return import.meta.env.VITE_NODE_ENV === 'production'
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL;
  };

  const openModal = () => {
    setShowModal(true);
    setStep(1);
    setConfirmEmail('');
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setStep(1);
  };

  const proceed = () => {
    setStep(2);
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError('');

      // Call the API to soft-delete the account
      const response = await authFetch(`${getApiUrl()}/api/users/me`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          reason: deleteReason 
        })
      });

      if (!response.ok) throw new Error('Failed to delete account');

      // Calculate the restoration date (30 days from now)
      const restorationDate = new Date();
      restorationDate.setDate(restorationDate.getDate() + 30);
      
      // Store a flag in sessionStorage to indicate account deletion flow
      // This will be used by the logout function to prevent redirect
      sessionStorage.setItem('accountDeletionFlow', 'true');
      
      // Navigate to goodbye page first with restoration information
      navigate('/goodbye', { 
        state: { 
          accountDeleted: true, 
          restorationDate: restorationDate.toISOString() 
        } 
      });
      
      // Then perform logout with a slight delay to ensure navigation completes
      setTimeout(async () => {
        await logout();
        // Clear the flag after logout is complete
        setTimeout(() => {
          sessionStorage.removeItem('accountDeletionFlow');
        }, 500);
      }, 300);

    } catch (error) {
      console.error('Delete account error:', error);
      setError('Failed to delete your account. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Account Management</h2>
      
      <div className={styles.accountManagementContent}>
        <div className={styles.sectionDivider}>
          <h3 className={styles.subheading}>Delete Your Account</h3>
          <div className={styles.warningBox}>
            <div className={styles.warningIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div className={styles.warningContent}>
              <p>Deleting your account will remove your personal information from our systems, including:</p>
              <ul className={styles.warningList}>
                <li>Your personal profile and account information</li>
                <li>Your order history and saved addresses</li>
                <li>Your saved items and wishlist</li>
                <li>Your shopping cart and preferences</li>
              </ul>
              <p className={styles.recoveryNote}>
                <strong>Recovery period:</strong> You will have 30 days to restore your account before it is permanently deleted. After this period, all data will be permanently removed.
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={openModal}
          className={`${styles.buttonDanger}`}
        >
          Delete My Account
        </button>
      </div>

      {/* Delete Account Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <button className={styles.modalClose} onClick={closeModal}>×</button>
            
            {step === 1 ? (
              <>
                <div className={styles.modalHeader}>
                  <div className={styles.modalIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                  <h3>Account Deletion Warning</h3>
                </div>
                
                <div className={styles.modalBody}>
                  <p>We're sorry to see you go. Before you proceed, please understand the following:</p>
                  
                  <div className={styles.consequencesList}>
                    <div className={styles.consequenceItem}>
                      <span className={styles.consequenceIcon}>🔒</span>
                      <span>Your profile information and preferences will be removed</span>
                    </div>
                    <div className={styles.consequenceItem}>
                      <span className={styles.consequenceIcon}>🛒</span>
                      <span>Your shopping cart and favorited items will be deleted</span>
                    </div>
                    <div className={styles.consequenceItem}>
                      <span className={styles.consequenceIcon}>📦</span>
                      <span>Your order history will be anonymized</span>
                    </div>
                    <div className={styles.consequenceItem}>
                      <span className={styles.consequenceIcon}>💬</span>
                      <span>Your feedback and reviews will be anonymized but remain visible</span>
                    </div>
                    <div className={styles.consequenceItem}>
                      <span className={styles.consequenceIcon}>📅</span>
                      <span>You have 30 days to restore your account before permanent deletion</span>
                    </div>
                  </div>
                  
                  <div className={styles.infoNote}>
                    <strong>Note about your content:</strong> Any reviews or feedback you've provided 
                    will remain on our platform, but will be anonymized to protect your privacy.
                    Your contributions are valuable to our community.
                  </div>
                  
                  <p className={styles.finalWarning}>
                    To restore your account within the 30-day period, simply log in with your current credentials.
                  </p>
                </div>
                
                <div className={styles.modalFooter}>
                  <button 
                    className={`${styles.buttonSecondary}`} 
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button 
                    className={`${styles.buttonDanger}`} 
                    onClick={proceed}
                  >
                    Continue Deletion
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <div className={styles.modalIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                    </svg>
                  </div>
                  <h3>Confirm Account Deletion</h3>
                </div>
                
                <div className={styles.modalBody}>
                  <p className={styles.finalWarning}>
                    This is your final confirmation. Please type <strong>DELETE</strong> to confirm:
                  </p>
                  
                  <input
                    type="text"
                    className={styles.confirmInput}
                    placeholder="Type DELETE to confirm"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                  />
                  
                  <div className={styles.reasonContainer}>
                    <label htmlFor="deleteReason">
                      Help us improve - why are you deleting your account? (optional)
                    </label>
                    <textarea
                      id="deleteReason"
                      className={styles.reasonInput}
                      placeholder="Please share your feedback..."
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      rows={3}
                    ></textarea>
                  </div>

                  {error && <p className={styles.errorText}>{error}</p>}
                </div>
                
                <div className={styles.modalFooter}>
                  <button 
                    className={`${styles.buttonSecondary}`} 
                    onClick={closeModal}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    className={`${styles.buttonDanger}`} 
                    onClick={handleDeleteAccount}
                    disabled={confirmEmail !== 'DELETE' || loading}
                  >
                    {loading ? 'Processing...' : 'Delete My Account'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccountModule;
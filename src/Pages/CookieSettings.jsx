import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './CookieSettings.module.css';

const CookieSettings = () => {
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
  });
  const [isSaved, setIsSaved] = useState(false);

  // 1. Automatically snap to the top when the user lands on the page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 2. Load existing cookie preferences from localStorage on mount
  useEffect(() => {
    const savedConsent = localStorage.getItem('cookie-consent-portfolio');
    if (savedConsent) {
      const parsed = JSON.parse(savedConsent);
      setPreferences(parsed);
    }
  }, []);

  const handleToggle = (type) => {
    if (type === 'essential') return; // Core cookies cannot be deactivated
    setPreferences((prev) => ({ ...prev, [type]: !prev[type] }));
    setIsSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('cookie-consent-portfolio', JSON.stringify(preferences));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, analytics: true };
    setPreferences(allAccepted);
    localStorage.setItem('cookie-consent-portfolio', JSON.stringify(allAccepted));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // 3. Smooth-glide interaction to bring user back to the top of the canvas
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.mainTitle}>Cookie Settings</h1>
        <p className={styles.lastUpdated}>Manage Your Privacy Preferences</p>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <p className={styles.text}>
            We use cookies to optimize your experience, analyze site traffic, and maintain 
            platform stability. Below you can customize which categories of cookies you 
            allow while exploring this editorial portfolio.
          </p>
        </section>

        {/* Preferences Control Matrix */}
        <div className={styles.matrix}>
          {/* Row 1: Essential */}
          <div className={styles.matrixItem}>
            <div className={styles.meta}>
              <h3 className={styles.cookieTitle}>01. Essential Cookies</h3>
              <p className={styles.cookieDesc}>
                Required for core systems, UI stability, security protocols, and remembering 
                your data preferences. They cannot be turned off.
              </p>
            </div>
            <div className={styles.controlWrapper}>
              <span className={styles.statusLabelActive}>Required</span>
            </div>
          </div>

          {/* Row 2: Analytics */}
          <div className={styles.matrixItem}>
            <div className={styles.meta}>
              <h3 className={styles.cookieTitle}>02. Performance & Analytics</h3>
              <p className={styles.cookieDesc}>
                Anonymously counts visits, views, and interactions to evaluate performance and 
                improve our creative portfolio layout.
              </p>
            </div>
            <div className={styles.controlWrapper}>
              <button 
                type="button"
                onClick={() => handleToggle('analytics')} 
                className={preferences.analytics ? styles.toggleBtnActive : styles.toggleBtn}
              >
                {preferences.analytics ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className={styles.actionStrip}>
          <button onClick={handleSave} className={styles.secondaryBtn}>
            Save Current Preferences
          </button>
          <button onClick={handleAcceptAll} className={styles.primaryBtn}>
            Accept All Categories
          </button>
        </div>

        {isSaved && (
          <p className={styles.successMessage}>✓ Preferences have been successfully updated.</p>
        )}

        <div className={styles.footerRow}>
          <div className={styles.footerLinksGroup}>
            <Link to="/" className={styles.backLink}>
              ← Back to portfolio
            </Link>
            <button 
              type="button" 
              onClick={handleScrollToTop} 
              className={styles.scrollTopButton}
            >
              ↑ Scroll to Top
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieSettings;
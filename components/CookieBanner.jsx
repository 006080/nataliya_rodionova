'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getConsentSettings,
  saveConsentSettings,
  getStorageCategories,
  hasUserMadeConsentChoice,
} from '../src/utils/enhancedConsentUtils';
import styles from './CookieBanner.module.css';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showMiniBanner, setShowMiniBanner] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settings, setSettings] = useState({
    cookies: 'none',
    localStorage: {
      granted: false,
      categories: {
        userPreferences: true,
        shoppingData: true,
      },
    },
  });

  const storageCategories = getStorageCategories();

  useEffect(() => {
    const hasChoice = hasUserMadeConsentChoice();
    const currentSettings = getConsentSettings();

    setSettings(currentSettings);

    if (!hasChoice) {
      setShowBanner(true);
      setShowMiniBanner(false);
    } else {
      setShowBanner(false);
      setShowMiniBanner(true);
    }

    const handleOpenSettings = () => {
      setShowSettingsModal(true);
    };

    const handleOpenCookieSettings = () => {
      setShowBanner(true);
    };

    window.addEventListener('openConsentSettings', handleOpenSettings);
    window.addEventListener('openCookieSettings', handleOpenCookieSettings);

    return () => {
      window.removeEventListener('openConsentSettings', handleOpenSettings);
      window.removeEventListener('openCookieSettings', handleOpenCookieSettings);
    };
  }, []);

  const handleAcceptAll = () => {
    const newSettings = {
      cookies: 'all',
      localStorage: {
        granted: true,
        categories: {
          userPreferences: true,
          shoppingData: true,
        },
      },
    };

    saveConsentSettings(newSettings);
    setSettings(newSettings);
    closeAllModals();
  };

  const handleContinueWithoutConsent = () => {
    const newSettings = {
      cookies: 'essential',
      localStorage: {
        granted: false,
        categories: {
          userPreferences: false,
          shoppingData: false,
        },
      },
    };

    saveConsentSettings(newSettings);
    setSettings(newSettings);
    closeAllModals();
  };

  const handleSaveSettings = () => {
    saveConsentSettings(settings);
    closeAllModals();
  };

  const closeAllModals = () => {
    setShowBanner(false);
    setShowSettingsModal(false);
    setShowMiniBanner(true);
  };

  const handleOpenSettings = () => {
    setShowSettingsModal(true);
  };

  const handleCloseSettings = () => {
    setShowSettingsModal(false);
  };

  const handleCookieSettingChange = (value) => {
    setSettings((prev) => ({
      ...prev,
      cookies: value,
    }));
  };

  const handleStorageToggle = () => {
    setSettings((prev) => {
      const newGranted = !prev.localStorage.granted;
      return {
        ...prev,
        localStorage: {
          granted: newGranted,
          categories: {
            userPreferences: newGranted,
            shoppingData: newGranted,
          },
        },
      };
    });
  };

  const handleCategoryToggle = (category) => {
    setSettings((prev) => {
      const newCategoryValue = !prev.localStorage.categories[category];
      const updatedCategories = {
        ...prev.localStorage.categories,
        [category]: newCategoryValue,
      };

      const anyCategoryEnabled = Object.values(updatedCategories).some(
        (value) => value
      );

      return {
        ...prev,
        localStorage: {
          granted: anyCategoryEnabled,
          categories: updatedCategories,
        },
      };
    });
  };

  return (
    <>
      {/* ГЛАВНЫЙ НИЖНИЙ БАННЕР */}
      {showBanner && (
        <div className={styles.cookieBanner}>
          <div className={styles.bannerContainer}>
            <h2 className={styles.bannerTitle}>
              Cookie & Privacy Consent
            </h2>
            <p className={styles.bannerText}>
              We use essential cookies to ensure the core functionality of our website. With your consent, we may also use third-party cookies from services such as Google reCAPTCHA to enhance security and PayPal to support payment processing. In addition, we use local data storage to securely save your shopping cart and layout preferences.
            </p>
            <p className={styles.bannerText}>
              You can customize your choices in Settings at any time. Review our{' '}
              <Link to="/privacy-policy" className={styles.policyLink}>
                Privacy Policy
              </Link>{' '}
              for deeper insights into how we respect your independent data.
            </p>
            
            <div className={styles.bannerButtons}>
              

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleContinueWithoutConsent}
              >
                Reject All
              </button>
              
              <button 
                type="button"
                className={styles.primaryButton}
                onClick={handleAcceptAll}
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МИНИ-КНОПКА ВЫЗОВА (ОТПЕЧАТОК КУКИ) */}
      {showMiniBanner && (
        <button
          className={styles.cookieSettingsButton}
          onClick={() => setShowBanner(true)}
          aria-label="Cookie Settings"
        >
          <div className={styles.cookieIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21.598 11.064a1.006 1.006 0 0 0-.854-.172A2.938 2.938 0 0 1 20 11c-1.654 0-3-1.346-3.003-2.937.005-.034.016-.136.017-.17a.998.998 0 0 0-1.254-1.006A2.963 2.963 0 0 1 15 7c-1.654 0-3-1.346-3-3 0-.217.031-.444.099-.716a1 1 0 0 0-1.067-1.236A9.956 9.956 0 0 0 2 12c0 5.514 4.486 10 10 10s10-4.486 10-10c0-.049-.003-.097-.007-.16a1.004 1.004 0 0 0-.395-.776zM12 20c-4.411 0-8-3.589-8-8a7.962 7.962 0 0 1 6.006-7.75A5.006 5.006 0 0 0 15 9l.101-.001a5.007 5.007 0 0 0 4.837 4C19.444 16.941 16.073 20 12 20z"></path>
              <circle cx="12.5" cy="11.5" r="1.5"></circle>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <circle cx="7.5" cy="12.5" r="1.5"></circle>
              <circle cx="15.5" cy="15.5" r="1.5"></circle>
              <circle cx="10.5" cy="16.5" r="1.5"></circle>
            </svg>
          </div>
        </button>
      )}

      {/* МОДАЛЬНОЕ ОКНО НАСТРОЕК (SETTINGS MODAL) */}
      {showSettingsModal && (
        <div className={styles.modalOverlay} onClick={handleCloseSettings}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Privacy Settings</h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={handleCloseSettings}
              >
                ×
              </button>
            </div>

            {/* Группа 1: Радио-кнопки для сторонних сервисов */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Third-Party Services</h3>
              <div className={styles.radioGroup}>
                <label 
                  className={`${styles.radioOption} ${settings.cookies === 'essential' ? styles.radioOptionSelected : ''}`}
                  onClick={() => handleCookieSettingChange('essential')}
                >
                  <input
                    type="radio"
                    name="cookies"
                    value="essential"
                    checked={settings.cookies === 'essential'}
                    onChange={(e) => handleCookieSettingChange(e.target.value)}
                  />
                  <span className={styles.radioText}>
                    <strong>Essential Only</strong> — Basic functionality, security configurations, and technical core operations.
                  </span>
                </label>
                
                <label 
                  className={`${styles.radioOption} ${settings.cookies === 'all' ? styles.radioOptionSelected : ''}`}
                  onClick={() => handleCookieSettingChange('all')}
                >
                  <input
                    type="radio"
                    name="cookies"
                    value="all"
                    checked={settings.cookies === 'all'}
                    onChange={(e) => handleCookieSettingChange(e.target.value)}
                  />
                  <span className={styles.radioText}>
                    <strong>All Services</strong> — Activates Google reCAPTCHA protection, seamless PayPal transactions, and analytics.
                  </span>
                </label>
              </div>
            </div>

            {/* Группа 2: Главный переключатель Local Storage */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Local Data Storage</h3>
              <div className={styles.toggleRow}>
                <div className={styles.textContainer}>
                  <div className={styles.toggleLabel}>Allow Local Data Storage</div>
                  <div className={styles.toggleDescription}>
                    Enables persistent sessions, layout preferences, and secures item storage in your bag.
                  </div>
                </div>
                <div
                  className={`${styles.toggleSwitch} ${settings.localStorage.granted ? styles.toggleActive : ''}`}
                  onClick={handleStorageToggle}
                >
                  <div className={styles.toggleSlider} />
                </div>
              </div>

              {/* Вложенные подкатегории локального хранилища */}
              <div
                className={`${styles.categoryContainer} ${settings.localStorage.granted ? '' : styles.categoryContainerDisabled}`}
              >
                {Object.entries(storageCategories).map(([key, category]) => (
                  <div key={key} className={styles.toggleRowNested}>
                    <div className={styles.textContainer}>
                      <div className={styles.toggleLabelNested}>{category.name}</div>
                      <div className={styles.toggleDescriptionNested}>
                        {category.description}
                      </div>
                    </div>
                    <div
                      className={`${styles.toggleSwitchSmall} ${settings.localStorage.categories[key] ? styles.toggleActive : ''}`}
                      onClick={() => settings.localStorage.granted && handleCategoryToggle(key)}
                    >
                      <div className={styles.toggleSliderSmall} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Кнопки управления внизу модального окна */}
            <div className={styles.modalButtons}>
              <button
                type="button"
                className={styles.modalSecondaryButton}
                onClick={handleCloseSettings}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalPrimaryButton}
                onClick={handleSaveSettings}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieBanner;
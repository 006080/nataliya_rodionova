import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  getConsentSettings, 
  saveConsentSettings, 
  getStorageCategories,
  hasUserMadeConsentChoice 
} from '../src/utils/enhancedConsentUtils'
import styles from './CookieBanner.module.css'

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false)
  const [showMiniBanner, setShowMiniBanner] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [settings, setSettings] = useState({
    cookies: 'none',
    localStorage: {
      granted: false,
      categories: {
        userPreferences: true,
        shoppingData: true
      }
    }
  })

  const storageCategories = getStorageCategories()

  // Check if user has already set preferences
  useEffect(() => {
    const hasChoice = hasUserMadeConsentChoice()
    const currentSettings = getConsentSettings()
    
    setSettings(currentSettings)
    
    if (!hasChoice) {
      setShowBanner(true)
      setShowMiniBanner(false)
    } else {
      setShowBanner(false)
      setShowMiniBanner(true)
    }

    // Listen for requests to reopen settings
    const handleOpenSettings = () => {
      setShowSettingsModal(true)
    }

    const handleOpenCookieSettings = () => {
      setShowBanner(true)
    }

    window.addEventListener('openConsentSettings', handleOpenSettings)
    window.addEventListener('openCookieSettings', handleOpenCookieSettings)

    return () => {
      window.removeEventListener('openConsentSettings', handleOpenSettings)
      window.removeEventListener('openCookieSettings', handleOpenCookieSettings)
    }
  }, [])

  const handleAcceptAll = () => {
    const newSettings = {
      cookies: 'all',
      localStorage: {
        granted: true,
        categories: {
          userPreferences: true,
          shoppingData: true
        }
      }
    }
    
    saveConsentSettings(newSettings)
    setSettings(newSettings)
    closeAllModals()
  }

  const handleContinueWithoutConsent = () => {
    const newSettings = {
      cookies: 'essential',
      localStorage: {
        granted: false,
        categories: {
          userPreferences: false,
          shoppingData: false
        }
      }
    }
    
    saveConsentSettings(newSettings)
    setSettings(newSettings)
    closeAllModals()
  }

  const handleSaveSettings = () => {
    saveConsentSettings(settings)
    closeAllModals()
  }

  const closeAllModals = () => {
    setShowBanner(false)
    setShowSettingsModal(false)
    setShowMiniBanner(true)
  }

  const handleOpenSettings = () => {
    setShowSettingsModal(true)
  }

  const handleCloseSettings = () => {
    setShowSettingsModal(false)
  }

  const handleCookieSettingChange = (value) => {
    setSettings(prev => ({
      ...prev,
      cookies: value
    }))
  }

  // UPDATED: Auto-toggle categories when main localStorage toggle changes
  const handleStorageToggle = () => {
    setSettings(prev => {
      const newGranted = !prev.localStorage.granted;
      return {
        ...prev,
        localStorage: {
          granted: newGranted,
          categories: {
            // When enabling localStorage, turn on all categories
            // When disabling localStorage, turn off all categories
            userPreferences: newGranted,
            shoppingData: newGranted
          }
        }
      }
    })
  }

  // UPDATED: Auto-update main toggle when categories change
  const handleCategoryToggle = (category) => {
    setSettings(prev => {
      const newCategoryValue = !prev.localStorage.categories[category];
      const updatedCategories = {
        ...prev.localStorage.categories,
        [category]: newCategoryValue
      };
      
      // If any category is enabled, enable main localStorage toggle
      const anyCategoryEnabled = Object.values(updatedCategories).some(value => value);
      
      return {
        ...prev,
        localStorage: {
          granted: anyCategoryEnabled, // Auto-update main toggle based on categories
          categories: updatedCategories
        }
      };
    })
  }

  return (
    <>
      {showBanner && (
        <div className={styles.cookieBanner}>
          <div className={styles.bannerContainer}>
            {/* <button className={styles.closeButtonBanner} onClick={() => setShowBanner(false)}>
              ×
            </button> */}
            <h2 className={styles.bannerTitle}>
              Cookie and Privacy Policy Consent
            </h2>
            <p className={styles.bannerText}>
              We use essential cookies to ensure the core functionality of our
              website. With your consent, we may also use third-party cookies
              from services like Google reCAPTCHA and PayPal to enhance security
              and support payment processing. Additionally, we can store your 
              preferences locally to improve your experience. Please review our{' '}
              <Link to="/privacy-policy" className={styles.policyLink}>
                Privacy Policy
              </Link>{' '}
              carefully before proceeding. By clicking "Accept All", you agree
              to our use of all cookies and accept the terms of our Privacy
              Policy.
            </p>
            <div className={styles.bannerButtons}>
              <button
                className={styles.continueButton}
                onClick={handleContinueWithoutConsent}
              >
                Reject All
              </button>
              <button
                className={styles.settingsButton}
                onClick={handleOpenSettings}
              >
                Settings
              </button>
              <button 
                className={styles.acceptButton}
                onClick={handleAcceptAll}
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {showMiniBanner && (
        <button
          className={styles.cookieSettingsButton}
          onClick={() => setShowBanner(true)}
          aria-label="Cookie Settings"
        >
          <div className={styles.cookieIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
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

      {showSettingsModal && (
        <div className={styles.modal} onClick={handleCloseSettings}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Privacy Settings</h2>
              <button className={styles.closeButton} onClick={handleCloseSettings}>
                ×
              </button>
            </div>

            {/* Cookie Settings */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Third-Party Services</h3>
              <div className={styles.radioGroup}>
                <label 
                  className={styles.radioOption}
                  onClick={() => handleCookieSettingChange('essential')}
                >
                  <input
                    type="radio"
                    name="cookies"
                    value="essential"
                    checked={settings.cookies === 'essential'}
                    onChange={(e) => handleCookieSettingChange(e.target.value)}
                  />
                  <span>
                    <strong>Essential Only</strong> - Basic website functionality only
                  </span>
                </label>
                <label 
                  className={styles.radioOption}
                  onClick={() => handleCookieSettingChange('all')}
                >
                  <input
                    type="radio"
                    name="cookies"
                    value="all"
                    checked={settings.cookies === 'all'}
                    onChange={(e) => handleCookieSettingChange(e.target.value)}
                  />
                  <span>
                    <strong>All Services</strong> - Include Google reCAPTCHA, PayPal, and other third-party services
                  </span>
                </label>
              </div>
            </div>

            {/* Local Storage Settings */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Local Data Storage</h3>
              <div className={styles.toggleContainer}>
                <div>
                  <div className={styles.toggleLabel}>Allow Local Data Storage</div>
                  <div className={styles.toggleDescription}>
                    Store your preferences and data locally for a better experience
                  </div>
                </div>
                <div
                  className={`${styles.toggle} ${settings.localStorage.granted ? styles.toggleActive : ''}`}
                  onClick={handleStorageToggle}
                >
                  <div
                    className={`${styles.toggleSlider} ${settings.localStorage.granted ? styles.toggleSliderActive : ''}`}
                  />
                </div>
              </div>

              {/* Category-specific settings */}
              <div className={`${styles.categoryContainer} ${settings.localStorage.granted ? '' : styles.categoryContainerDisabled}`}>
                {Object.entries(storageCategories).map(([key, category]) => (
                  <div key={key} className={styles.toggleContainer}>
                    <div>
                      <div className={styles.toggleLabel}>{category.name}</div>
                      <div className={styles.toggleDescription}>
                        {category.description}
                      </div>
                    </div>
                    <div
                      className={`${styles.toggle} ${settings.localStorage.categories[key] ? styles.toggleActive : ''}`}
                      onClick={() => handleCategoryToggle(key)}
                    >
                      <div
                        className={`${styles.toggleSlider} ${settings.localStorage.categories[key] ? styles.toggleSliderActive : ''}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.modalButtons}>
              <button
                className={styles.continueButton}
                onClick={handleCloseSettings}
              >
                Cancel
              </button>
              <button
                className={styles.acceptButton}
                onClick={handleSaveSettings}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CookieBanner






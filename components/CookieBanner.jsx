import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './CookieBanner.module.css'
import { loadThirdPartyScripts } from '../src/utils/consentUtils'

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false)
  const [showMiniBanner, setShowMiniBanner] = useState(false)

  // Check if user has already set cookie preferences
  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (!cookieConsent) {
      setShowBanner(true)
      setShowMiniBanner(false)
    } else {
      setShowBanner(false)
      setShowMiniBanner(true)
    }

    // Listen for requests to reopen cookie settings
    const handleOpenCookieSettings = () => {
      setShowBanner(true)
    }

    window.addEventListener('openCookieSettings', handleOpenCookieSettings)

    return () => {
      window.removeEventListener('openCookieSettings', handleOpenCookieSettings)
    }
  }, [])

  const handleAcceptAll = () => {
    // Save consent to localStorage
    localStorage.setItem('cookieConsent', 'all')

    // Load third-party scripts
    loadThirdPartyScripts()

    // Dispatch event for other components to react to consent change
    window.dispatchEvent(
      new CustomEvent('consentChanged', {
        detail: { consent: 'all' },
      })
    )

    // Wait a moment for hooks to update before hiding the banner
    setTimeout(() => {
      setShowBanner(false)
      setShowMiniBanner(true)
    }, 100)
  }

  const handleContinueWithoutConsent = () => {
    // Save minimal consent to localStorage
    localStorage.setItem('cookieConsent', 'essential')

    // Dispatch event for other components to react to consent change
    window.dispatchEvent(
      new CustomEvent('consentChanged', {
        detail: { consent: 'essential' },
      })
    )

    // Wait a moment for hooks to update before hiding the banner
    setTimeout(() => {
      setShowBanner(false)
      setShowMiniBanner(true)
    }, 100)
  }

  const handleSettingsClick = () => {
    setShowBanner(true)
  }

  return (
    <>
      {showBanner && (
        <div className={styles.cookieBanner}>
          <div className={styles.bannerContainer}>
            <h2 className={styles.bannerTitle}>
              Cookie and Privacy Policy Consent
            </h2>
            <p className={styles.bannerText}>
              We use essential cookies to ensure the core functionality of our
              website. With your consent, we may also use third-party cookies
              from services like Google reCAPTCHA and PayPal to enhance security
              and support payment processing. Please review our{' '}
              <Link to="/privacy-policy" className={styles.policyLink}>
                Privacy Policy
              </Link>{' '}
              carefully before proceeding. By clicking “Accept All”, you agree
              to our use of all cookies and accept the terms of our Privacy
              Policy.
            </p>
            <div className={styles.bannerButtons}>
              <button
                className={styles.continueButton}
                onClick={handleContinueWithoutConsent}
              >
                Continue without consent
              </button>
              <button className={styles.acceptButton} onClick={handleAcceptAll}>
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mini floating cookie settings button */}
      {showMiniBanner && (
        <button
          className={styles.cookieSettingsButton}
          onClick={handleSettingsClick}
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
    </>
  )
}

export default CookieBanner

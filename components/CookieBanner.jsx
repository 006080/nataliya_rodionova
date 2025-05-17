import { useState, useEffect } from 'react';
import styles from './CookieBanner.module.css';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMiniBanner, setShowMiniBanner] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    functional: false,
    targeting: false
  });

  // Check if user has already set cookie preferences
  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowBanner(true);
      setShowMiniBanner(false);
    } else {
      // If consent exists, load saved preferences
      try {
        const savedPreferences = JSON.parse(localStorage.getItem('cookiePreferences'));
        if (savedPreferences) {
          setPreferences(savedPreferences);
          // Apply the saved preferences on initial load
          applyPreferences(savedPreferences);
        }
        setShowMiniBanner(true);
      } catch (error) {
        console.error('Error loading cookie preferences:', error);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      functional: true,
      targeting: true
    };
    
    // First save the preferences
    saveCookiePreferences(allAccepted);
    
    // Then update state
    setPreferences(allAccepted);
    setShowBanner(false);
    setShowMiniBanner(true);
  };

  // Fixed Reject All function - no setTimeout
  const handleRejectAll = () => {
    console.log('Reject All clicked');
    
    const allRejected = {
      necessary: true, // Essential cookies cannot be rejected
      analytics: false,
      functional: false,
      targeting: false
    };
    
    // First save the preferences
    saveCookiePreferences(allRejected);
    
    // Then update state directly, no setTimeout
    setPreferences(allRejected);
    setShowBanner(false);
    setShowMiniBanner(true);
  };

  const handleSavePreferences = () => {
    saveCookiePreferences(preferences);
    setShowBanner(false);
    setShowSettings(false);
    setShowMiniBanner(true);
  };

  const saveCookiePreferences = (prefs) => {
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
    
    // Apply preferences immediately
    applyPreferences(prefs);
  };

  // const applyPreferences = (prefs) => {
  //   // 1. Handling Analytics Cookies (Google Analytics)
  //   if (prefs.analytics) {
  //     // Enable Google Analytics
  //     if (window.gtag) {
  //       window.gtag('consent', 'update', {
  //         'analytics_storage': 'granted'
  //       });
  //     }
      
  //     // If you're using Google Analytics 4, you can set analytics consent
  //     if (window.dataLayer) {
  //       window.dataLayer.push({
  //         'event': 'consent_update',
  //         'consent_analytics': 'granted'
  //       });
  //     }
  //   } else {
  //     // Disable Google Analytics
  //     if (window.gtag) {
  //       window.gtag('consent', 'update', {
  //         'analytics_storage': 'denied'
  //       });
  //     }
      
  //     // For Google Analytics 4
  //     if (window.dataLayer) {
  //       window.dataLayer.push({
  //         'event': 'consent_update',
  //         'consent_analytics': 'denied'
  //       });
  //     }
  //   }
    
  //   // 2. Handling Functional Cookies 
  //   // (like user preferences, cart functionality that persists across sessions)
  //   if (prefs.functional) {
  //     // Enable local storage for cart and favorites persistence
  //     // Since your app uses localStorage for cart and favorites, we'll allow it
      
  //     // If you implement session persistence via cookies
  //     document.cookie = "functional_cookies_allowed=true; path=/; max-age=31536000; SameSite=Lax";
      
  //     // You might also have UI preference cookies
  //     document.cookie = "allow_ui_preferences=true; path=/; max-age=31536000; SameSite=Lax";
  //   } else {
  //     // Clear functional cookies, but keep necessary authentication ones
      
  //     // Get all cookies
  //     const cookies = document.cookie.split(';');
      
  //     // Remove specific functional cookies (adjust names based on your app)
  //     for (let i = 0; i < cookies.length; i++) {
  //       const cookie = cookies[i].trim();
  //       // Skip authentication and necessary cookies
  //       if (!cookie.startsWith('jwt=') && !cookie.startsWith('refreshToken=')) {
  //         // Remove functional cookies
  //         if (cookie.startsWith('functional_') || 
  //             cookie.startsWith('ui_preference_') ||
  //             cookie.startsWith('allow_ui_preferences=')) {
  //           // Extract cookie name
  //           const name = cookie.split('=')[0];
  //           // Set expiration to past date
  //           document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  //         }
  //       }
  //     }
  //   }
    
  //   // 3. Handling Marketing/Targeting Cookies (Facebook, ads, etc.)
  //   if (prefs.targeting) {
  //     // Enable Facebook pixel if present
  //     if (window.fbq) {
  //       window.fbq('consent', 'grant');
  //     }
      
  //     // Enable other advertising/marketing tags
  //     document.cookie = "marketing_cookies_allowed=true; path=/; max-age=31536000; SameSite=Lax";
      
  //     // If using Google Ad tags
  //     if (window.gtag) {
  //       window.gtag('consent', 'update', {
  //         'ad_storage': 'granted',
  //         'ad_user_data': 'granted',
  //         'ad_personalization': 'granted'
  //       });
  //     }
  //   } else {
  //     // Disable Facebook pixel if present
  //     if (window.fbq) {
  //       window.fbq('consent', 'revoke');
  //     }
      
  //     // Remove marketing cookies
  //     document.cookie = "marketing_cookies_allowed=false; path=/; max-age=31536000; SameSite=Lax";
      
  //     // If using Google Ad tags, deny consent
  //     if (window.gtag) {
  //       window.gtag('consent', 'update', {
  //         'ad_storage': 'denied',
  //         'ad_user_data': 'denied',
  //         'ad_personalization': 'denied'
  //       });
  //     }
      
  //     // Get all cookies and remove marketing ones
  //     const cookies = document.cookie.split(';');
      
  //     for (let i = 0; i < cookies.length; i++) {
  //       const cookie = cookies[i].trim();
  //       if (cookie.startsWith('_fbp=') || 
  //           cookie.startsWith('_fbc=') || 
  //           cookie.startsWith('fr=') ||
  //           cookie.startsWith('_gcl_au=') ||
  //           cookie.startsWith('ads_')) {
  //         const name = cookie.split('=')[0];
  //         document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  //       }
  //     }
  //   }

  //   // 4. If user rejected all optional cookies, consider adding a Do Not Track signal
  //   if (!prefs.analytics && !prefs.functional && !prefs.targeting) {
  //     // This is just indicative, actual DNT is browser controlled
  //     // Some browsers might ignore this setting
  //     try {
  //       navigator.doNotTrack = "1";
  //     } catch (e) {
  //       console.log('Unable to set Do Not Track signal');
  //     }
  //   }
  // };



  const applyPreferences = (prefs) => {
    console.log('Applying cookie preferences:', prefs);
  
    // Track which cookies were successfully managed
    const report = {
      managed: [],
      unmanageable: [],
      errors: []
    };
  
    // 1. ANALYTICS COOKIES
    if (prefs.analytics) {
      console.log('Enabling analytics cookies');
      
      // Google Analytics cookies
      if (window.gtag) {
        try {
          window.gtag('consent', 'update', {
            'analytics_storage': 'granted'
          });
          report.managed.push('Google Analytics consent');
        } catch (e) {
          report.errors.push('Error enabling Google Analytics: ' + e.message);
        }
      }
      
      if (window.dataLayer) {
        try {
          window.dataLayer.push({
            'event': 'consent_update',
            'consent_analytics': 'granted'
          });
          report.managed.push('Google Tag Manager dataLayer');
        } catch (e) {
          report.errors.push('Error updating dataLayer: ' + e.message);
        }
      }
    } else {
      console.log('Disabling analytics cookies');
      
      // Deny Google Analytics tracking
      if (window.gtag) {
        try {
          window.gtag('consent', 'update', {
            'analytics_storage': 'denied'
          });
          report.managed.push('Google Analytics consent denied');
        } catch (e) {
          report.errors.push('Error disabling Google Analytics: ' + e.message);
        }
      }
      
      if (window.dataLayer) {
        try {
          window.dataLayer.push({
            'event': 'consent_update',
            'consent_analytics': 'denied'
          });
          report.managed.push('Google Tag Manager dataLayer update');
        } catch (e) {
          report.errors.push('Error updating dataLayer: ' + e.message);
        }
      }
      
      // Delete first-party analytics cookies (those on your domain)
      try {
        const cookies = document.cookie.split(';');
        
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          // Google Analytics cookies on our domain
          if (cookie.startsWith('_ga=') || 
              cookie.startsWith('_ga_') || 
              cookie.startsWith('_gid=')) {
            const name = cookie.split('=')[0];
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            report.managed.push(name);
          }
        }
      } catch (e) {
        report.errors.push('Error deleting analytics cookies: ' + e.message);
      }
      
      // Add third-party analytics cookies to unmanageable list
      report.unmanageable.push('Google Analytics cookies on google.com domain');
      report.unmanageable.push('PayPal analytics cookies (_ga on paypal.com)');
    }
    
    // 2. FUNCTIONAL COOKIES
    if (prefs.functional) {
      console.log('Enabling functional cookies');
      
      try {
        // Mark that functional cookies are allowed
        document.cookie = "functional_cookies_allowed=true; path=/; max-age=31536000; SameSite=Lax";
        report.managed.push('functional_cookies_allowed flag');
      } catch (e) {
        report.errors.push('Error setting functional cookie flag: ' + e.message);
      }
    } else {
      console.log('Disabling functional cookies');
      
      try {
        // Mark that functional cookies are not allowed
        document.cookie = "functional_cookies_allowed=false; path=/; max-age=31536000; SameSite=Lax";
        report.managed.push('functional_cookies_allowed flag set to false');
        
        // Clean up first-party functional cookies
        const cookies = document.cookie.split(';');
        
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          
          // Skip authentication-related cookies which are essential
          if (!cookie.startsWith('refreshToken=') && !cookie.startsWith('jwt=')) {
            // Clear functional cookies on our domain
            if (cookie.startsWith('functional_') || 
                cookie.startsWith('ui_preference_')) {
              const name = cookie.split('=')[0];
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
              report.managed.push(name);
            }
          }
        }
      } catch (e) {
        report.errors.push('Error managing functional cookies: ' + e.message);
      }
      
      // Note third-party functional cookies that can't be deleted
      report.unmanageable.push('PayPal UI preferences (ui_experience on paypal.com)');
      report.unmanageable.push('PayPal user settings (consumer_display on paypal.com)');
      report.unmanageable.push('PayPal login_email on paypal.com');
    }
    
    // 3. MARKETING/TARGETING COOKIES
    if (prefs.targeting) {
      console.log('Enabling marketing cookies');
      
      try {
        // Mark that marketing cookies are allowed
        document.cookie = "marketing_cookies_allowed=true; path=/; max-age=31536000; SameSite=Lax";
        report.managed.push('marketing_cookies_allowed flag');
      } catch (e) {
        report.errors.push('Error setting marketing cookie flag: ' + e.message);
      }
      
      // Enable Facebook Pixel if present
      if (window.fbq) {
        try {
          window.fbq('consent', 'grant');
          report.managed.push('Facebook Pixel consent');
        } catch (e) {
          report.errors.push('Error enabling Facebook Pixel: ' + e.message);
        }
      }
      
      // Google ads consent
      if (window.gtag) {
        try {
          window.gtag('consent', 'update', {
            'ad_storage': 'granted',
            'ad_user_data': 'granted',
            'ad_personalization': 'granted'
          });
          report.managed.push('Google Ads consent');
        } catch (e) {
          report.errors.push('Error enabling Google Ads: ' + e.message);
        }
      }
      
      // PayPal marketing - use their SDK if available
      if (window.paypal && window.paypal.consent) {
        try {
          window.paypal.consent.grant();
          report.managed.push('PayPal consent');
        } catch (e) {
          report.unmanageable.push('PayPal tracking cookies (no SDK access)');
        }
      } else {
        report.unmanageable.push('PayPal tracking cookies (PayPal SDK not found)');
      }
    } else {
      console.log('Disabling marketing cookies');
      
      try {
        // Mark that marketing cookies are not allowed
        document.cookie = "marketing_cookies_allowed=false; path=/; max-age=31536000; SameSite=Lax";
        report.managed.push('marketing_cookies_allowed flag set to false');
      } catch (e) {
        report.errors.push('Error setting marketing cookie flag: ' + e.message);
      }
      
      // Disable Facebook Pixel if present
      if (window.fbq) {
        try {
          window.fbq('consent', 'revoke');
          report.managed.push('Facebook Pixel consent revoked');
        } catch (e) {
          report.errors.push('Error disabling Facebook Pixel: ' + e.message);
        }
      }
      
      // Google ads consent denied
      if (window.gtag) {
        try {
          window.gtag('consent', 'update', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied'
          });
          report.managed.push('Google Ads consent denied');
        } catch (e) {
          report.errors.push('Error disabling Google Ads: ' + e.message);
        }
      }
      
      // PayPal marketing - use their SDK if available
      if (window.paypal && window.paypal.consent) {
        try {
          window.paypal.consent.revoke();
          report.managed.push('PayPal consent revoked');
        } catch (e) {
          report.unmanageable.push('PayPal tracking cookies (no SDK access)');
        }
      } else {
        report.unmanageable.push('PayPal tracking cookies (PayPal SDK not found)');
      }
      
      // Delete first-party marketing cookies
      try {
        const cookies = document.cookie.split(';');
        
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          
          // Clear marketing cookies on our domain only
          if (cookie.startsWith('_gcl_au=') || // Google Ads
              cookie.startsWith('_fbp=') ||    // Facebook Pixel
              cookie.startsWith('_fbc=') ||    // Facebook Click ID
              cookie.startsWith('marketing_cookies_allowed=')) {
            
            const name = cookie.split('=')[0];
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            report.managed.push(name);
          }
        }
      } catch (e) {
        report.errors.push('Error deleting marketing cookies: ' + e.message);
      }
      
      // Note third-party marketing cookies that can't be deleted directly
      report.unmanageable.push('PayPal tracking cookies (ts, ts_c on paypal.com)');
      report.unmanageable.push('Google NID, AEC cookies');
      report.unmanageable.push('Facebook fr cookie on facebook.com domain');
    }
  
    // 4. BROWSER-SPECIFIC FEATURES AND LIMITATIONS
    
    // Attempt to use browser Do Not Track if all optional cookies rejected
    if (!prefs.analytics && !prefs.functional && !prefs.targeting) {
      try {
        navigator.doNotTrack = "1";
        report.managed.push('Browser Do Not Track signal');
      } catch (e) {
        report.errors.push('Unable to set Do Not Track signal: ' + e.message);
      }
    }
  
    // Use SameSite cookie policy enforcement if browser supports it
    try {
      document.cookie = "cookie_policy_enforced=true; path=/; max-age=31536000; SameSite=Strict";
      report.managed.push('SameSite cookie policy');
    } catch (e) {
      report.errors.push('Error setting SameSite policy cookie: ' + e.message);
    }
    
    // 5. THIRD-PARTY COOKIE LIMITATIONS NOTICE
    // Add a block of code to check if there are PayPal cookies still visible
    try {
      const allCookies = document.cookie.split(';');
      let hasPayPalCookies = false;
      
      for (let i = 0; i < allCookies.length; i++) {
        const cookie = allCookies[i].trim();
        if (cookie.includes('paypal')) {
          hasPayPalCookies = true;
          break;
        }
      }
      
      if (hasPayPalCookies && !prefs.targeting && !prefs.functional) {
        console.warn('IMPORTANT: Some PayPal cookies may still be visible due to browser limitations on managing third-party cookies. These cookies are now blocked from tracking you by revoking consent at the service level.');
      }
    } catch (e) {
      report.errors.push('Error checking PayPal cookies: ' + e.message);
    }
    
    console.log('Cookie preferences applied with the following report:', report);
    return report;
  };



  const handleTogglePreference = (type) => {
    if (type === 'necessary') return; // Cannot toggle necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleSettingsClick = () => {
    setShowBanner(true);
    setShowSettings(true);
  };

  return (
    <>
      {showBanner && (
        <div className={styles.cookieBanner}>
          <div className={styles.bannerContainer}>
            {!showSettings ? (
              <div className={styles.mainBanner}>
                <h2 className={styles.bannerTitle}>Cookie Consent</h2>
                <p className={styles.bannerText}>
                  We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                  By clicking "Accept All", you consent to our use of cookies as described in our Cookie Policy.
                </p>
                <div className={styles.bannerButtons}>
                  <button 
                    className={styles.settingsButton}
                    onClick={() => setShowSettings(true)}
                  >
                    Cookie Settings
                  </button>
                  <button 
                    className={styles.rejectButton}
                    onClick={handleRejectAll}
                  >
                    Reject All
                  </button>
                  <button 
                    className={styles.acceptButton}
                    onClick={handleAcceptAll}
                  >
                    Accept All
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.settingsPanel}>
                <h2 className={styles.bannerTitle}>Cookie Settings</h2>
                <p className={styles.bannerText}>
                  Customize your cookie preferences. Essential cookies are necessary for the website to function and cannot be disabled.
                </p>
                
                <div className={styles.cookieOptions}>
                  <div className={styles.cookieOption}>
                    <div className={styles.cookieOptionHeader}>
                      <label className={`${styles.cookieOptionLabel} ${styles.disabled}`}>
                        <input
                          type="checkbox"
                          checked={preferences.necessary}
                          disabled={true}
                          className={styles.checkbox}
                        />
                        <span className={styles.cookieOptionTitle}>Essential Cookies</span>
                      </label>
                    </div>
                    <p className={styles.cookieOptionDescription}>
                      These cookies are necessary for the website to function properly. They enable core functionality such as security, account management, and authentication.
                    </p>
                  </div>
                  
                  <div className={styles.cookieOption}>
                    <div className={styles.cookieOptionHeader}>
                      <label className={styles.cookieOptionLabel}>
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={() => handleTogglePreference('analytics')}
                          className={styles.checkbox}
                        />
                        <span className={styles.cookieOptionTitle}>Analytics Cookies</span>
                      </label>
                    </div>
                    <p className={styles.cookieOptionDescription}>
                      These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular.
                    </p>
                  </div>
                  
                  <div className={styles.cookieOption}>
                    <div className={styles.cookieOptionHeader}>
                      <label className={styles.cookieOptionLabel}>
                        <input
                          type="checkbox"
                          checked={preferences.functional}
                          onChange={() => handleTogglePreference('functional')}
                          className={styles.checkbox}
                        />
                        <span className={styles.cookieOptionTitle}>Functional Cookies</span>
                      </label>
                    </div>
                    <p className={styles.cookieOptionDescription}>
                      These cookies enable enhanced functionality and personalization, such as remembering your shopping cart items, favorites, and UI preferences between sessions.
                    </p>
                  </div>
                  
                  <div className={styles.cookieOption}>
                    <div className={styles.cookieOptionHeader}>
                      <label className={styles.cookieOptionLabel}>
                        <input
                          type="checkbox"
                          checked={preferences.targeting}
                          onChange={() => handleTogglePreference('targeting')}
                          className={styles.checkbox}
                        />
                        <span className={styles.cookieOptionTitle}>Marketing Cookies</span>
                      </label>
                    </div>
                    <p className={styles.cookieOptionDescription}>
                      These cookies may be set by our advertising partners to build a profile of your interests and show you relevant ads on other sites. They do not directly store personal information.
                    </p>
                  </div>
                </div>
                
                <div className={styles.bannerButtons}>
                  <button 
                    className={styles.backButton}
                    onClick={() => setShowSettings(false)}
                  >
                    Back
                  </button>
                  <button 
                    className={styles.saveButton}
                    onClick={handleSavePreferences}
                  >
                    Save Preferences
                  </button>
                </div>
                
                <div className={styles.privacyLink}>
                  <a href="/privacy-policy" className={styles.privacyLinkText}>
                    View our Privacy Policy
                  </a>
                </div>
              </div>
            )}
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
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M21.598 11.064a1.006 1.006 0 0 0-.854-.172A2.938 2.938 0 0 1 20 11c-1.654 0-3-1.346-3.003-2.937.005-.034.016-.136.017-.17a.998.998 0 0 0-1.254-1.006A2.963 2.963 0 0 1 15 7c-1.654 0-3-1.346-3-3 0-.217.031-.444.099-.716a1 1 0 0 0-1.067-1.236A9.956 9.956 0 0 0 2 12c0 5.514 4.486 10 10 10s10-4.486 10-10c0-.049-.003-.097-.007-.16a1.004 1.004 0 0 0-.395-.776zM12 20c-4.411 0-8-3.589-8-8a7.962 7.962 0 0 1 6.006-7.75A5.006 5.006 0 0 0 15 9l.101-.001a5.007 5.007 0 0 0 4.837 4C19.444 16.941 16.073 20 12 20z"></path><circle cx="12.5" cy="11.5" r="1.5"></circle><circle cx="8.5" cy="8.5" r="1.5"></circle><circle cx="7.5" cy="12.5" r="1.5"></circle><circle cx="15.5" cy="15.5" r="1.5"></circle><circle cx="10.5" cy="16.5" r="1.5"></circle></svg>
          </div>
        </button>
      )}
    </>
  );
};

export default CookieBanner;



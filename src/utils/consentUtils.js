// Check if user has consented to third-party cookies
export const hasThirdPartyConsent = () => {
  return localStorage.getItem('cookieConsent') === 'all';
};

// Load third-party scripts based on consent
export const loadScriptsByConsent = () => {
  if (hasThirdPartyConsent()) {
    loadThirdPartyScripts();
  }
};

// Script loading status tracking
const loadedScripts = {
  recaptcha: false,
  paypal: false
};

// Load all third-party scripts
export const loadThirdPartyScripts = () => {
  // Clear any existing loading markers first
  loadedScripts.recaptcha = false;
  loadedScripts.paypal = false;
  
  // Remove any existing scripts to avoid duplicates
  const existingRecaptcha = document.querySelector('script[src*="recaptcha/api.js"]');
  const existingPaypal = document.querySelector('script[src*="paypal.com/sdk/js"]');
  
  if (existingRecaptcha) {
    existingRecaptcha.remove();
  }
  
  if (existingPaypal) {
    existingPaypal.remove();
  }
  
  // Load fresh scripts
  loadReCaptcha();
  loadPayPal();
  
  // Notify components that scripts are being reloaded
  window.dispatchEvent(new CustomEvent('scriptsReloading'));
};

// Load Google reCAPTCHA script
export const loadReCaptcha = () => {
  if (document.querySelector('script[src*="recaptcha/api.js"]') || loadedScripts.recaptcha) {
    return; // Script already loaded or loading
  }
  
  try {
    loadedScripts.recaptcha = true;
    
    const recaptchaScript = document.createElement('script');
    recaptchaScript.src = 'https://www.google.com/recaptcha/api.js';
    recaptchaScript.async = true;
    recaptchaScript.defer = true;
    
    // Add load event to confirm the script loaded successfully
    recaptchaScript.onload = () => {
      // console.log('reCAPTCHA script loaded successfully');
    };
    
    recaptchaScript.onerror = () => {
      // console.error('reCAPTCHA script failed to load');
      loadedScripts.recaptcha = false;
      
      // Try loading again after a delay
      setTimeout(() => {
        loadReCaptcha();
      }, 2000);
    };
    
    document.head.appendChild(recaptchaScript);
  } catch (error) {
    console.error('Error loading reCAPTCHA script:', error);
    loadedScripts.recaptcha = false;
  }
};

// Load PayPal script
export const loadPayPal = () => {
  if (document.querySelector('script[src*="paypal.com/sdk/js"]') || loadedScripts.paypal) {
    return; // Script already loaded or loading
  }
  
  try {
    const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    if (!paypalClientId) {
      console.error('PayPal client ID not found in environment variables');
      return;
    }
    
    loadedScripts.paypal = true;
    
    const paypalScript = document.createElement('script');
    paypalScript.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=EUR`;
    paypalScript.async = true;
    
    // Add load event to confirm the script loaded successfully
    paypalScript.onload = () => {
      // console.log('PayPal script loaded successfully');
      window.dispatchEvent(new CustomEvent('paypalLoaded'));
    };
    
    paypalScript.onerror = () => {
      console.error('PayPal script failed to load');
      loadedScripts.paypal = false;
      
      // Try loading again after a delay
      setTimeout(() => {
        loadPayPal();
      }, 2000);
    };
    
    document.head.appendChild(paypalScript);
  } catch (error) {
    console.error('Error loading PayPal script:', error);
    loadedScripts.paypal = false;
  }
};

// Check for ReCAPTCHA rendering and handle based on consent
export const renderRecaptchaIfConsented = (recaptchaRef) => {
  if (!recaptchaRef || !recaptchaRef.current) {
    return false;
  }
  
  if (hasThirdPartyConsent()) {
    // Make sure the script is loaded
    loadReCaptcha();
    return true;
  } else {
    // If no consent, show an alternative message and prevent form submission
    // console.log('ReCAPTCHA requires cookie consent');
    return false;
  }
};

// Check for PayPal buttons rendering and handle based on consent
export const renderPayPalIfConsented = () => {
  if (hasThirdPartyConsent()) {
    // Make sure the script is loaded
    loadPayPal();
    return true;
  } else {
    // If no consent, return false
    // console.log('PayPal requires cookie consent');
    return false;
  }
};

// Open cookie settings banner
export const openCookieSettings = () => {
  window.dispatchEvent(new CustomEvent('openCookieSettings'));
};

// Initialize consent management on app mount
export const initConsentManagement = () => {
  // Load scripts only if consent was previously given
  loadScriptsByConsent();
  
  // Add listener for consent changes (can be used by other components)
  window.addEventListener('consentChanged', (event) => {
    if (event.detail && event.detail.consent === 'all') {
      loadThirdPartyScripts();
    }
  });
};



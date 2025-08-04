// import { loadThirdPartyScripts } from './consentUtils';

// // Essential localStorage keys that cannot be disabled
// const ESSENTIAL_STORAGE_KEYS = [
//   'cookieConsent',
//   'localStorageConsent',
//   'storageConsentSettings',
//   // PayPal related keys (if any specific ones are used)
//   'paypal_storage_consent'
// ];

// // Optional storage categories with their respective keys (REMOVED sessionData)
// const OPTIONAL_STORAGE_CATEGORIES = {
//   userPreferences: {
//     name: 'User Preferences',
//     description: 'Remember your preferences like delivery details and measurements',
//     keys: ['measurements', 'deliveryDetails', 'rememberedEmail'],
//     defaultEnabled: true
//   },
//   shoppingData: {
//     name: 'Shopping Data',
//     description: 'Save your cart items and favorite products for future visits',
//     keys: ['cartItems', 'favorites'],
//     defaultEnabled: true
//   }
// };

// // Get current consent settings
// export const getConsentSettings = () => {
//   try {
//     const cookieConsent = localStorage.getItem('cookieConsent') || 'none';
//     const storageSettings = JSON.parse(localStorage.getItem('storageConsentSettings') || '{}');
    
//     return {
//       cookies: cookieConsent,
//       localStorage: {
//         granted: localStorage.getItem('localStorageConsent') === 'granted',
//         categories: {
//           userPreferences: storageSettings.userPreferences !== false,
//           shoppingData: storageSettings.shoppingData !== false
//         }
//       }
//     };
//   } catch (error) {
//     console.error('Error reading consent settings:', error);
//     return {
//       cookies: 'none',
//       localStorage: {
//         granted: false,
//         categories: {
//           userPreferences: false,
//           shoppingData: false
//         }
//       }
//     };
//   }
// };

// // Save consent settings
// export const saveConsentSettings = (settings) => {
//   try {
//     // Save cookie consent
//     localStorage.setItem('cookieConsent', settings.cookies);
    
//     // Save localStorage consent
//     localStorage.setItem('localStorageConsent', settings.localStorage.granted ? 'granted' : 'denied');
    
//     // Save category-specific settings
//     localStorage.setItem('storageConsentSettings', JSON.stringify(settings.localStorage.categories));
    
//     // Load third-party scripts if cookies are accepted
//     if (settings.cookies === 'all') {
//       loadThirdPartyScripts();
//     }
    
//     // Clean up localStorage if consent was revoked
//     if (!settings.localStorage.granted) {
//       cleanupOptionalStorage();
//     } else {
//       // Clean up specific categories if they were disabled
//       Object.keys(settings.localStorage.categories).forEach(category => {
//         if (!settings.localStorage.categories[category]) {
//           cleanupStorageCategory(category);
//         }
//       });
//     }
    
//     // Dispatch events for components to react
//     window.dispatchEvent(new CustomEvent('consentChanged', {
//       detail: { 
//         consent: settings.cookies,
//         localStorage: settings.localStorage 
//       }
//     }));
    
//     window.dispatchEvent(new CustomEvent('storageConsentChanged', {
//       detail: settings.localStorage
//     }));
    
//     return true;
//   } catch (error) {
//     console.error('Error saving consent settings:', error);
//     return false;
//   }
// };

// // Check if a specific localStorage operation is allowed
// export const isStorageAllowed = (key, category = null) => {
//   // Always allow essential keys
//   if (ESSENTIAL_STORAGE_KEYS.includes(key)) {
//     return true;
//   }
  
//   const settings = getConsentSettings();
  
//   // If localStorage consent not granted, deny optional storage
//   if (!settings.localStorage.granted) {
//     return false;
//   }
  
//   // If category is specified, check category consent
//   if (category && settings.localStorage.categories[category] === false) {
//     return false;
//   }
  
//   // If no category specified, try to determine from key
//   if (!category) {
//     for (const [catName, catInfo] of Object.entries(OPTIONAL_STORAGE_CATEGORIES)) {
//       if (catInfo.keys.includes(key)) {
//         return settings.localStorage.categories[catName] !== false;
//       }
//     }
//   }
  
//   // Default to allowed if localStorage consent is granted
//   return true;
// };

// // Enhanced localStorage wrapper functions
// export const setStorageItem = (key, value, category = null) => {
//   if (!isStorageAllowed(key, category)) {
//     console.log(`Storage denied for key: ${key}`);
//     return false;
//   }
  
//   try {
//     localStorage.setItem(key, value);
//     return true;
//   } catch (error) {
//     console.error(`Error setting localStorage item ${key}:`, error);
//     return false;
//   }
// };

// export const getStorageItem = (key, category = null) => {
//   // Always allow reading essential keys
//   if (ESSENTIAL_STORAGE_KEYS.includes(key)) {
//     return localStorage.getItem(key);
//   }
  
//   if (!isStorageAllowed(key, category)) {
//     return null;
//   }
  
//   try {
//     return localStorage.getItem(key);
//   } catch (error) {
//     console.error(`Error getting localStorage item ${key}:`, error);
//     return null;
//   }
// };

// export const removeStorageItem = (key, category = null) => {
//   // Prevent removal of essential keys
//   if (ESSENTIAL_STORAGE_KEYS.includes(key)) {
//     console.warn(`Cannot remove essential storage key: ${key}`);
//     return false;
//   }
  
//   try {
//     localStorage.removeItem(key);
//     return true;
//   } catch (error) {
//     console.error(`Error removing localStorage item ${key}:`, error);
//     return false;
//   }
// };

// // Clean up optional storage when consent is revoked
// export const cleanupOptionalStorage = () => {
//   try {
//     const allKeys = Object.keys(localStorage);
    
//     allKeys.forEach(key => {
//       if (!ESSENTIAL_STORAGE_KEYS.includes(key)) {
//         localStorage.removeItem(key);
//       }
//     });
    
//     console.log('Optional localStorage cleaned up');
//   } catch (error) {
//     console.error('Error cleaning up localStorage:', error);
//   }
// };

// // Clean up specific storage category
// export const cleanupStorageCategory = (category) => {
//   try {
//     const categoryInfo = OPTIONAL_STORAGE_CATEGORIES[category];
//     if (!categoryInfo) return;
    
//     categoryInfo.keys.forEach(key => {
//       localStorage.removeItem(key);
//     });
    
//     console.log(`Cleaned up storage category: ${category}`);
//   } catch (error) {
//     console.error(`Error cleaning up storage category ${category}:`, error);
//   }
// };

// // Initialize consent system
// export const initConsentManagement = () => {
//   const settings = getConsentSettings();
  
//   // Load scripts if consent was previously given
//   if (settings.cookies === 'all') {
//     loadThirdPartyScripts();
//   }
  
//   // Listen for consent changes
//   window.addEventListener('consentChanged', (event) => {
//     if (event.detail && event.detail.consent === 'all') {
//       loadThirdPartyScripts();
//     }
//   });
  
//   // Clean up storage if consent was previously revoked
//   if (!settings.localStorage.granted) {
//     cleanupOptionalStorage();
//   }
// };

// // Get available storage categories for UI
// export const getStorageCategories = () => {
//   return OPTIONAL_STORAGE_CATEGORIES;
// };

// // Check if user has made any consent choices
// export const hasUserMadeConsentChoice = () => {
//   const cookieConsent = localStorage.getItem('cookieConsent');
//   const storageConsent = localStorage.getItem('localStorageConsent');
  
//   return !!(cookieConsent && storageConsent);
// };





import { loadThirdPartyScripts } from './consentUtils';

// Essential localStorage keys that cannot be disabled
const ESSENTIAL_STORAGE_KEYS = [
  'cookieConsent',
  'localStorageConsent',
  'storageConsentSettings',
  // PayPal related keys (if any specific ones are used)
  'paypal_storage_consent'
];

// Optional storage categories with their respective keys (REMOVED sessionData)
const OPTIONAL_STORAGE_CATEGORIES = {
  userPreferences: {
    name: 'User Preferences',
    description: 'Remember your preferences like delivery details and measurements',
    keys: ['measurements', 'deliveryDetails', 'rememberedEmail'],
    defaultEnabled: true
  },
  shoppingData: {
    name: 'Shopping Data',
    description: 'Save your cart items and favorite products for future visits',
    keys: ['cartItems', 'favorites'],
    defaultEnabled: true
  }
};

// Get current consent settings
export const getConsentSettings = () => {
  try {
    const cookieConsent = localStorage.getItem('cookieConsent') || 'none';
    const storageSettings = JSON.parse(localStorage.getItem('storageConsentSettings') || '{}');
    
    return {
      cookies: cookieConsent,
      localStorage: {
        granted: localStorage.getItem('localStorageConsent') === 'granted',
        categories: {
          userPreferences: storageSettings.userPreferences !== false,
          shoppingData: storageSettings.shoppingData !== false
        }
      }
    };
  } catch (error) {
    console.error('Error reading consent settings:', error);
    return {
      cookies: 'none',
      localStorage: {
        granted: false,
        categories: {
          userPreferences: false,
          shoppingData: false
        }
      }
    };
  }
};

// Save consent settings
export const saveConsentSettings = (settings) => {
  try {
    // Save cookie consent
    localStorage.setItem('cookieConsent', settings.cookies);
    
    // Save localStorage consent
    localStorage.setItem('localStorageConsent', settings.localStorage.granted ? 'granted' : 'denied');
    
    // Save category-specific settings
    localStorage.setItem('storageConsentSettings', JSON.stringify(settings.localStorage.categories));
    
    // Load third-party scripts if cookies are accepted
    if (settings.cookies === 'all') {
      loadThirdPartyScripts();
    }
    
    // Clean up localStorage if consent was revoked
    if (!settings.localStorage.granted) {
      cleanupOptionalStorage();
    } else {
      // Clean up specific categories if they were disabled
      Object.keys(settings.localStorage.categories).forEach(category => {
        if (!settings.localStorage.categories[category]) {
          cleanupStorageCategory(category);
        }
      });
    }
    
    // Dispatch events for components to react
    window.dispatchEvent(new CustomEvent('consentChanged', {
      detail: { 
        consent: settings.cookies,
        localStorage: settings.localStorage 
      }
    }));
    
    window.dispatchEvent(new CustomEvent('storageConsentChanged', {
      detail: settings.localStorage
    }));
    
    return true;
  } catch (error) {
    console.error('Error saving consent settings:', error);
    return false;
  }
};

// Check if a specific localStorage operation is allowed
export const isStorageAllowed = (key, category = null) => {
  // Always allow essential keys
  if (ESSENTIAL_STORAGE_KEYS.includes(key)) {
    return true;
  }
  
  const settings = getConsentSettings();
  
  // If localStorage consent not granted, deny optional storage
  if (!settings.localStorage.granted) {
    return false;
  }
  
  // If category is specified, check category consent
  if (category && settings.localStorage.categories[category] === false) {
    return false;
  }
  
  // If no category specified, try to determine from key
  if (!category) {
    for (const [catName, catInfo] of Object.entries(OPTIONAL_STORAGE_CATEGORIES)) {
      if (catInfo.keys.includes(key)) {
        return settings.localStorage.categories[catName] !== false;
      }
    }
  }
  
  // Default to allowed if localStorage consent is granted
  return true;
};

// NEW: Helper function specifically for user preferences
export const isUserPreferencesAllowed = () => {
  const settings = getConsentSettings();
  return settings.localStorage.granted && settings.localStorage.categories.userPreferences;
};

// Enhanced localStorage wrapper functions
export const setStorageItem = (key, value, category = null) => {
  if (!isStorageAllowed(key, category)) {
    console.log(`Storage denied for key: ${key}`);
    return false;
  }
  
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting localStorage item ${key}:`, error);
    return false;
  }
};

export const getStorageItem = (key, category = null) => {
  // Always allow reading essential keys
  if (ESSENTIAL_STORAGE_KEYS.includes(key)) {
    return localStorage.getItem(key);
  }
  
  if (!isStorageAllowed(key, category)) {
    return null;
  }
  
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting localStorage item ${key}:`, error);
    return null;
  }
};

export const removeStorageItem = (key, category = null) => {
  // Prevent removal of essential keys
  if (ESSENTIAL_STORAGE_KEYS.includes(key)) {
    console.warn(`Cannot remove essential storage key: ${key}`);
    return false;
  }
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage item ${key}:`, error);
    return false;
  }
};

// Clean up optional storage when consent is revoked
export const cleanupOptionalStorage = () => {
  try {
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!ESSENTIAL_STORAGE_KEYS.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('Optional localStorage cleaned up');
  } catch (error) {
    console.error('Error cleaning up localStorage:', error);
  }
};

// Clean up specific storage category
export const cleanupStorageCategory = (category) => {
  try {
    const categoryInfo = OPTIONAL_STORAGE_CATEGORIES[category];
    if (!categoryInfo) return;
    
    categoryInfo.keys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`Cleaned up storage category: ${category}`);
  } catch (error) {
    console.error(`Error cleaning up storage category ${category}:`, error);
  }
};

// Initialize consent system
export const initConsentManagement = () => {
  const settings = getConsentSettings();
  
  // Load scripts if consent was previously given
  if (settings.cookies === 'all') {
    loadThirdPartyScripts();
  }
  
  // Listen for consent changes
  window.addEventListener('consentChanged', (event) => {
    if (event.detail && event.detail.consent === 'all') {
      loadThirdPartyScripts();
    }
  });
  
  // Clean up storage if consent was previously revoked
  if (!settings.localStorage.granted) {
    cleanupOptionalStorage();
  }
};

// Get available storage categories for UI
export const getStorageCategories = () => {
  return OPTIONAL_STORAGE_CATEGORIES;
};

// Check if user has made any consent choices
export const hasUserMadeConsentChoice = () => {
  const cookieConsent = localStorage.getItem('cookieConsent');
  const storageConsent = localStorage.getItem('localStorageConsent');
  
  return !!(cookieConsent && storageConsent);
};
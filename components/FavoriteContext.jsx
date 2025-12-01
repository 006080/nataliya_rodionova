import { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated } from '../src/services/authService';
import { getStorageItem, setStorageItem, getConsentSettings } from '../src/utils/enhancedConsentUtils';
import { 
  fetchFavoritesFromDatabase, 
  saveFavoritesToDatabase, 
  toggleFavoriteInDatabase,
  clearFavoritesInDatabase,
  // mergeFavoritesWithDatabase,
  // syncFavoritesWithDatabase
} from '../src/services/favoritesService';

const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      // Use consent-aware storage getter
      const savedFavorites = getStorageItem('favorites', 'shoppingData');
      return savedFavorites ? JSON.parse(savedFavorites) : [];
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
      return [];
    }
  });
  
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(() => isAuthenticated());
  const [initialSyncDone, setInitialSyncDone] = useState(false);

  // DIRECT consent checking function - no dependencies on complex logic
  const hasShoppingDataConsent = () => {
    try {
      const consentSettings = getConsentSettings();
      const hasConsent = consentSettings.localStorage.granted && consentSettings.localStorage.categories.shoppingData;
      return hasConsent;
    } catch (error) {
      console.error('Error checking consent:', error);
      return false;
    }
  };

  // SIMPLE localStorage wrapper - only saves if user is not authenticated OR has consent
  const safeSetItem = (key, value) => {    
    // For unauthenticated users, always allow (setStorageItem will handle consent)
    if (!isUserAuthenticated) {
      return setStorageItem(key, value, 'shoppingData');
    }
    
    // For authenticated users, check consent directly
    if (hasShoppingDataConsent()) {
      return setStorageItem(key, value, 'shoppingData');
    } else {
      return false;
    }
  };

  const syncFavoritesWithDatabase = async (force = false) => {
    if (sessionStorage.getItem('isUserLogout') === 'true') {
      return;
    }
    
    if (isAuthenticated() && (!initialSyncDone || force)) {
      try {
        if (!initialSyncDone || force) {
          const dbFavorites = await fetchFavoritesFromDatabase();
          
          if (dbFavorites && dbFavorites.length > 0) {
            setFavorites(dbFavorites);
            safeSetItem('favorites', JSON.stringify(dbFavorites));
          } else {
            if (favorites.length > 0) {
              await saveFavoritesToDatabase(favorites);
            }
          }
        }
        
        setInitialSyncDone(true);
        setIsUserAuthenticated(true);
      } catch (error) {
        console.error('Error syncing favorites with database:', error);
      }
    }
  };

  // Initial favorites sync on component mount
  useEffect(() => {
    syncFavoritesWithDatabase();
  }, [initialSyncDone]);
  
  // Listen for auth state changes
  useEffect(() => {
    const handleAuthStateChange = async () => {
      if (sessionStorage.getItem('isUserLogout') === 'true') {
        return;
      }
      
      const userIsAuthenticated = isAuthenticated();
      
      if (userIsAuthenticated && !isUserAuthenticated) {
        setIsUserAuthenticated(true);
        try {
          const dbFavorites = await fetchFavoritesFromDatabase();

          if (dbFavorites.length > 0 && favorites.length > 0) {
            // Merge logic here if needed
          } else if (dbFavorites.length > 0) {
            setFavorites(dbFavorites);
            safeSetItem('favorites', JSON.stringify(dbFavorites));
          } else if (favorites.length > 0) {
            await saveFavoritesToDatabase(favorites);
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
        }
      } else if (!userIsAuthenticated && isUserAuthenticated) {
        setIsUserAuthenticated(false);
        setInitialSyncDone(false);
      }
    };
    
    window.addEventListener('auth-state-changed', handleAuthStateChange);
    window.addEventListener('auth-state-sync', handleAuthStateChange);
    
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChange);
      window.removeEventListener('auth-state-sync', handleAuthStateChange);
    };
  }, [isUserAuthenticated, favorites]);

  useEffect(() => {
    const handleLoadUserFavorites = async () => {
      const currentFavorites = getStorageItem('favorites', 'shoppingData');
      if (currentFavorites) {
        safeSetItem('favorites', '[]');
      }
      setFavorites([]);
      if (isAuthenticated()) {
        await syncFavoritesWithDatabase(true);
      }
    };

    window.addEventListener('load-user-favorites', handleLoadUserFavorites);

    return () => {
      window.removeEventListener('load-user-favorites', handleLoadUserFavorites);
    };
  }, []);

  // Listen for storage consent changes
  useEffect(() => {
    const handleStorageConsentChange = (event) => {
      const storageSettings = event.detail;
      
      if (!storageSettings.granted || !storageSettings.categories.shoppingData) {
        // console.log('Favorites will not be saved due to privacy settings');
      } else {
        if (storageSettings.granted && storageSettings.categories.shoppingData && favorites.length > 0) {
          // Use direct setStorageItem here since this is the consent grant handler
          const saveSuccess = setStorageItem('favorites', JSON.stringify(favorites), 'shoppingData');
          if (saveSuccess) {
            // console.log('Existing favorites successfully saved to localStorage');
          }
        }
      }
    };

    window.addEventListener('storageConsentChanged', handleStorageConsentChange);
    
    return () => {
      window.removeEventListener('storageConsentChanged', handleStorageConsentChange);
    };
  }, [favorites]);

  // Main sync effect - handles localStorage and database
  useEffect(() => {
    
    // Use safe localStorage setter
    const saveSuccess = safeSetItem('favorites', JSON.stringify(favorites));
    
    if (!saveSuccess && favorites.length > 0) {
      // console.log('Favorites not saved to localStorage');
    }
    
    if (sessionStorage.getItem('isUserLogout') === 'true') {
      return;
    }
    
    // For authenticated users, sync with database
    if (isUserAuthenticated && initialSyncDone) {
      const timeoutId = setTimeout(() => {
        if (isAuthenticated()) {
          saveFavoritesToDatabase(favorites).then(success => {
            if (success) {
              // console.log('✅ Favorites synced with database');
            } else {
              console.error('❌ Failed to sync favorites with database');
            }
          }).catch((error) => {
            console.error('Error saving favorites to database:', error);
          });
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [favorites, isUserAuthenticated, initialSyncDone]);

  useEffect(() => {
    const handleLogout = async () => {
      setFavorites([]);
      setIsUserAuthenticated(false);
      setInitialSyncDone(false);
    };
    
    window.addEventListener('user-logout', handleLogout);
    window.addEventListener('auth-logout', handleLogout);
    
    return () => {
      window.removeEventListener('user-logout', handleLogout);
      window.removeEventListener('auth-logout', handleLogout);
    };
  }, [isUserAuthenticated]);

  // Listen for favorites merge events
  useEffect(() => {
    const handleFavoritesMerged = async () => {
      try {
        const dbFavorites = await fetchFavoritesFromDatabase();
        if (dbFavorites && dbFavorites.length > 0) {
          setFavorites(dbFavorites);
          safeSetItem('favorites', JSON.stringify(dbFavorites));
        }
      } catch (error) {
        console.error('Error refreshing favorites after merge:', error);
      }
    };

    window.addEventListener('favorites-merged', handleFavoritesMerged);

    return () => {
      window.removeEventListener('favorites-merged', handleFavoritesMerged);
    };
  }, []);

  useEffect(() => {
    const handleFavoritesCleared = () => {
      setFavorites([]);
      safeSetItem('favorites', '[]');
      setIsUserAuthenticated(false);
      setInitialSyncDone(false);
    };
    
    window.addEventListener('favorites-cleared', handleFavoritesCleared);
    
    return () => {
      window.removeEventListener('favorites-cleared', handleFavoritesCleared);
    };
  }, []);

  const toggleFavorite = async (product) => {
    
    // For authenticated users, use the API
    if (isUserAuthenticated && initialSyncDone) {
      try {
        const result = await toggleFavoriteInDatabase(product);
        if (result.success) {
          setFavorites(result.items);
          // Do NOT save to localStorage here - let the useEffect handle it
          return;
        }
      } catch (error) {
        console.error('Error toggling favorite via API:', error);
        // Only fall back to local if user is not authenticated
        if (!isUserAuthenticated) {
          setFavorites((prevFavorites) => {
            const updatedFavorites = prevFavorites.some(item => item.id === product.id)
              ? prevFavorites.filter(item => item.id !== product.id)
              : [...prevFavorites, {...product, addedAt: new Date().toISOString()}];
            
            return updatedFavorites;
          });
        }
        return;
      }
    }
    
    // Local toggle for unauthenticated users only
    if (!isUserAuthenticated) {
      setFavorites((prevFavorites) => {
        const updatedFavorites = prevFavorites.some(item => item.id === product.id)
          ? prevFavorites.filter(item => item.id !== product.id)
          : [...prevFavorites, {...product, addedAt: new Date().toISOString()}];
        
        return updatedFavorites;
      });
    }
  };

  // Check if a product is in favorites
  const isFavorite = (productId) => {
    return favorites.some(item => item.id === productId);
  };

  const clearFavorites = async () => {
    if (isUserAuthenticated && initialSyncDone) {
      try {
        const success = await clearFavoritesInDatabase();
        if (success) {
          setFavorites([]);
          safeSetItem('favorites', '[]');
          return;
        }
      } catch (error) {
        console.error('Error clearing favorites from database:', error);
      }
    }
    
    setFavorites([]);
    safeSetItem('favorites', '[]');
  };

  return (
    <FavoriteContext.Provider 
      value={{ 
        favorites, 
        toggleFavorite, 
        isFavorite,
        clearFavorites,
        forceFavoritesSync: async () => {
          if (isAuthenticated()) {
            await syncFavoritesWithDatabase(true);
            return true;
          }
          return false;
        }
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
};
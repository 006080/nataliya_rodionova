import { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated } from '../src/services/authService';
import { 
  fetchFavoritesFromDatabase, 
  saveFavoritesToDatabase, 
  toggleFavoriteInDatabase,
  clearFavoritesInDatabase,
  mergeFavoritesWithDatabase,
  syncFavoritesWithDatabase
} from '../src/services/favoritesService';

const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    // Initialize from localStorage if available
    const savedFavorites = localStorage.getItem('favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(() => isAuthenticated());
  const [initialSyncDone, setInitialSyncDone] = useState(false);

  // Initial sync with database for authenticated users
  useEffect(() => {
    const syncFavoritesWithDatabase = async () => {
      if (isAuthenticated() && !initialSyncDone) {
        try {
          const dbFavorites = await fetchFavoritesFromDatabase();
          
          if (dbFavorites && dbFavorites.length > 0) {
            setFavorites(dbFavorites);
            localStorage.setItem('favorites', JSON.stringify(dbFavorites));
          } else if (favorites.length > 0) {
            // If we have local favorites but empty DB favorites, push local to DB
            await saveFavoritesToDatabase(favorites);
          }
          
          setInitialSyncDone(true);
          setIsUserAuthenticated(true);
        } catch (error) {
          console.error('Error syncing favorites with database:', error);
        }
      }
    };
    
    syncFavoritesWithDatabase();
  }, [favorites, initialSyncDone]);
  
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
          // User just logged in - merge local favorites with database
          const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
          if (localFavorites.length > 0) {
            const mergedFavorites = await mergeFavoritesWithDatabase(localFavorites);
            setFavorites(mergedFavorites);
            localStorage.setItem('favorites', JSON.stringify(mergedFavorites));
          } else {
            // No local favorites, just fetch from database
            const dbFavorites = await fetchFavoritesFromDatabase();
            setFavorites(dbFavorites);
            localStorage.setItem('favorites', JSON.stringify(dbFavorites));
          }
        } catch (error) {
          console.error('Error handling auth state change for favorites:', error);
        }
      } else if (!userIsAuthenticated && isUserAuthenticated) {
        setIsUserAuthenticated(false);
        setInitialSyncDone(false);
        // User logged out - keep local favorites (already in state and localStorage)
      }
    };
    
    window.addEventListener('auth-state-changed', handleAuthStateChange);
    window.addEventListener('auth-state-sync', handleAuthStateChange);
    window.addEventListener('load-user-favorites', handleAuthStateChange);
    
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChange);
      window.removeEventListener('auth-state-sync', handleAuthStateChange);
      window.removeEventListener('load-user-favorites', handleAuthStateChange);
    };
  }, [isUserAuthenticated]);
  
  // Handle logout
  useEffect(() => {
    const handleLogout = () => {
      // We keep the favorites in localStorage for convenience
      // They will be merged on next login if needed
      setIsUserAuthenticated(false);
      setInitialSyncDone(false);
    };
    
    window.addEventListener('user-logout', handleLogout);
    window.addEventListener('auth-logout', handleLogout);
    
    return () => {
      window.removeEventListener('user-logout', handleLogout);
      window.removeEventListener('auth-logout', handleLogout);
    };
  }, []);

  // Save to localStorage and sync with database when appropriate
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    if (sessionStorage.getItem('isUserLogout') === 'true') {
      return;
    }
    
    // For authenticated users, sync with database (with debounce)
    if (isUserAuthenticated && initialSyncDone) {
      const timeoutId = setTimeout(() => {
        if (isAuthenticated()) {
          saveFavoritesToDatabase(favorites).catch(error => {
            console.error('Error saving favorites to database:', error);
          });
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [favorites, isUserAuthenticated, initialSyncDone]);


  // Handle favorites-cleared event
useEffect(() => {
  const handleFavoritesCleared = () => {
    localStorage.removeItem('favorites');
    setFavorites([]);
    setIsUserAuthenticated(false);
    setInitialSyncDone(false);
  };
  
  window.addEventListener('favorites-cleared', handleFavoritesCleared);
  
  return () => {
    window.removeEventListener('favorites-cleared', handleFavoritesCleared);
  };
}, []);

// Handle load-user-favorites event
// Updated load-user-favorites event handler
useEffect(() => {
  const handleLoadUserFavorites = async () => {
    if (isAuthenticated()) {
      try {
        // Force a refresh from the database
        const favorites = await syncFavoritesWithDatabase(true);
        
        if (favorites && Array.isArray(favorites)) {
          setFavorites(favorites);
          setInitialSyncDone(true);
          setIsUserAuthenticated(true);
        } else {
          // If no favorites or error, clear state
          setFavorites([]);
        }
      } catch (error) {
        console.error('Error loading user favorites:', error);
        setFavorites([]);
      }
    }
  };
  
  window.addEventListener('load-user-favorites', handleLoadUserFavorites);
  
  // Also listen for favorites-updated events
  const handleFavoritesUpdated = (event) => {
    if (event.detail && Array.isArray(event.detail)) {
      setFavorites(event.detail);
    }
  };
  
  window.addEventListener('favorites-updated', handleFavoritesUpdated);
  
  return () => {
    window.removeEventListener('load-user-favorites', handleLoadUserFavorites);
    window.removeEventListener('favorites-updated', handleFavoritesUpdated);
  };
}, []);

  // Toggle a product in favorites (add if not exists, remove if exists)
  // const toggleFavorite = async (product) => {
  //   // For authenticated users, use the API
  //   if (isUserAuthenticated && initialSyncDone) {
  //     try {
  //       const result = await toggleFavoriteInDatabase(product);
  //       if (result.success) {
  //         setFavorites(result.items);
  //         return;
  //       }
  //     } catch (error) {
  //       console.error('Error toggling favorite via API:', error);
  //       // Fall back to local toggle
  //     }
  //   }
    
  //   // Local toggle logic (still used for unauthenticated or as fallback)
  //   setFavorites(prevFavorites => {
  //     const exists = prevFavorites.some(item => item.id === product.id);
      
  //     if (exists) {
  //       // Remove from favorites
  //       return prevFavorites.filter(item => item.id !== product.id);
  //     } else {
  //       // Add to favorites
  //       return [...prevFavorites, {...product, addedAt: new Date().toISOString()}];
  //     }
  //   });
  // };

  const toggleFavorite = async (product) => {
    // For authenticated users, use the API
    if (isUserAuthenticated && initialSyncDone) {
      try {
        const result = await toggleFavoriteInDatabase(product);
        if (result.success) {
          // Update local state
          setFavorites(result.items);
          // Also update localStorage to keep them in sync
          localStorage.setItem('favorites', JSON.stringify(result.items));
          return;
        }
      } catch (error) {
        console.error('Error toggling favorite via API:', error);
        // Fall back to local toggle
      }
    }
    
    // Local toggle logic (still used for unauthenticated or as fallback)
    const updatedFavorites = favorites.some(item => item.id === product.id)
      ? favorites.filter(item => item.id !== product.id)
      : [...favorites, {...product, addedAt: new Date().toISOString()}];
    
    // Update state and localStorage
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  // Check if a product is in favorites
  const isFavorite = (productId) => {
    return favorites.some(item => item.id === productId);
  };

  // Clear all favorites
  // const clearFavorites = async () => {
  //   if (isUserAuthenticated && initialSyncDone) {
  //     try {
  //       const success = await clearFavoritesInDatabase();
  //       if (success) {
  //         setFavorites([]);
  //         return;
  //       }
  //     } catch (error) {
  //       console.error('Error clearing favorites from database:', error);
  //       // Fall back to local clear
  //     }
  //   }
    
  //   setFavorites([]);
  // };

  const clearFavorites = async () => {
    if (isUserAuthenticated && initialSyncDone) {
      try {
        const success = await clearFavoritesInDatabase();
        if (success) {
          // Clear state and localStorage
          setFavorites([]);
          localStorage.removeItem('favorites');
          return;
        }
      } catch (error) {
        console.error('Error clearing favorites from database:', error);
        // Fall back to local clear
      }
    }
    
    // Clear state and localStorage
    setFavorites([]);
    localStorage.removeItem('favorites');
  };

  return (
    <FavoriteContext.Provider 
      value={{ 
        favorites, 
        toggleFavorite, 
        isFavorite,
        clearFavorites
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
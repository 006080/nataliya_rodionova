import { authFetch, isAuthenticated } from '../services/authService';

const getApiUrl = () => {
  return import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL_PROD
    : import.meta.env.VITE_API_BASE_URL_LOCAL;
};



export const fetchFavoritesFromDatabase = async () => {
  if (!isAuthenticated()) {
    return [];
  }

  try {
    const apiUrl = getApiUrl();
    const response = await authFetch(`${apiUrl}/api/favorites`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch favorites');
    }
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};

export const saveFavoritesToDatabase = async (favorites) => {
  if (!isAuthenticated()) {
    return false;
  }

  try {
    const apiUrl = getApiUrl();
    const response = await authFetch(`${apiUrl}/api/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: favorites }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save favorites');
    }
    
    return true;
  } catch (error) {
    console.error('Error saving favorites:', error);
    return false;
  }
};

// export const toggleFavoriteInDatabase = async (product) => {
//   if (!isAuthenticated()) {
//     return { success: false, message: 'User not authenticated' };
//   }

//   try {
//     const apiUrl = getApiUrl();
//     const response = await authFetch(`${apiUrl}/api/favorites/toggle`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ product }),
//     });
    
//     if (!response.ok) {
//       throw new Error('Failed to toggle favorite');
//     }
    
//     const data = await response.json();
//     return {
//       success: true,
//       added: data.added,
//       items: data.items || []
//     };
//   } catch (error) {
//     console.error('Error toggling favorite:', error);
//     return { success: false, message: error.message };
//   }
// };


export const toggleFavoriteInDatabase = async (product) => {
  if (!isAuthenticated()) {
    return { success: false, message: 'User not authenticated' };
  }

  try {
    const apiUrl = getApiUrl();
    const response = await authFetch(`${apiUrl}/api/favorites/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to toggle favorite');
    }
    
    const data = await response.json();
    
    // Update localStorage with the latest data from server
    if (data.items && Array.isArray(data.items)) {
      localStorage.setItem('favorites', JSON.stringify(data.items));
    }
    
    return {
      success: true,
      added: data.added,
      items: data.items || []
    };
  } catch (error) {
    console.error('Error toggling favorite:', error);
    
    // Try to fall back to local operation
    const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const exists = localFavorites.some(item => item.id === product.id);
    
    let updatedFavorites;
    if (exists) {
      updatedFavorites = localFavorites.filter(item => item.id !== product.id);
    } else {
      updatedFavorites = [...localFavorites, {...product, addedAt: new Date().toISOString()}];
    }
    
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    
    return { 
      success: true, 
      added: !exists,
      items: updatedFavorites,
      message: 'Used local fallback due to API error'
    };
  }
};

// export const clearFavoritesInDatabase = async () => {
//   if (!isAuthenticated()) {
//     return false;
//   }

//   try {
//     const apiUrl = getApiUrl();
//     const response = await authFetch(`${apiUrl}/api/favorites`, {
//       method: 'DELETE',
//     });
    
//     if (!response.ok) {
//       throw new Error('Failed to clear favorites');
//     }
    
//     return true;
//   } catch (error) {
//     console.error('Error clearing favorites:', error);
//     return false;
//   }
// };


export const clearFavoritesInDatabase = async () => {
  if (!isAuthenticated()) {
    return false;
  }

  try {
    const apiUrl = getApiUrl();
    const response = await authFetch(`${apiUrl}/api/favorites`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to clear favorites');
    }
    
    // Clear localStorage as well
    localStorage.removeItem('favorites');
    
    return true;
  } catch (error) {
    console.error('Error clearing favorites:', error);
    
    // Try to clear localStorage anyway
    localStorage.removeItem('favorites');
    
    return true; // Return true since we at least cleared localStorage
  }
};

export const mergeFavoritesWithDatabase = async (localFavorites) => {
  if (!isAuthenticated()) {
    return [];
  }

  try {
    const apiUrl = getApiUrl();
    const response = await authFetch(`${apiUrl}/api/favorites/merge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: localFavorites }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to merge favorites');
    }
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error merging favorites:', error);
    return [];
  }
};

export const syncFavoritesWithDatabase = async (force = false) => {
  if (!isAuthenticated()) {
    return false;
  }

  try {
    // If not forcing and we have data cached in localStorage, use that first for quick loading
    if (!force) {
      const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      
      // If we have local favorites and not forcing a refresh, use them temporarily
      if (localFavorites.length > 0) {
        // Return them immediately, but still fetch in background
        setTimeout(() => fetchFavoritesFromDatabase().then(dbFavorites => {
          if (dbFavorites && dbFavorites.length > 0) {
            // Silently update localStorage for next time
            localStorage.setItem('favorites', JSON.stringify(dbFavorites));
            
            // Dispatch event to update UI
            const updateEvent = new CustomEvent('favorites-updated', { detail: dbFavorites });
            window.dispatchEvent(updateEvent);
          }
        }).catch(err => console.error('Background fetch error:', err)), 100);
        
        return localFavorites;
      }
    }
    
    // If force=true or no local favorites, fetch directly from database
    const dbFavorites = await fetchFavoritesFromDatabase();
    
    // Get local favorites for potential merge
    const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (dbFavorites && dbFavorites.length > 0) {
      // If database has favorites, use those
      localStorage.setItem('favorites', JSON.stringify(dbFavorites));
      return dbFavorites;
    } else if (localFavorites.length > 0) {
      // If database is empty but we have local favorites, push those to database
      await saveFavoritesToDatabase(localFavorites);
      return localFavorites;
    }
    
    // If both are empty, return empty array
    return [];
  } catch (error) {
    console.error('Error syncing favorites with database:', error);
    
    // Return local favorites as fallback
    return JSON.parse(localStorage.getItem('favorites') || '[]');
  }
};
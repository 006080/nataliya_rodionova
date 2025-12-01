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
    
    // DO NOT update localStorage here - let the context handle it based on consent
    
    return {
      success: true,
      added: data.added,
      items: data.items || []
    };
  } catch (error) {
    console.error('Error toggling favorite:', error);
    
    // DO NOT fall back to localStorage operations - just return failure
    // The context will handle local operations for unauthenticated users
    return { 
      success: false, 
      message: error.message
    };
  }
};

// FIXED: Removed direct localStorage operations
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
        
    return true;
  } catch (error) {
    console.error('Error clearing favorites:', error);
    return false;
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

// FIXED: Simplified sync function - no direct localStorage operations
export const syncFavoritesWithDatabase = async (force = false) => {
  if (!isAuthenticated()) {
    return [];
  }

  try {
    // Always fetch from database - let the context handle localStorage
    const dbFavorites = await fetchFavoritesFromDatabase();    
    return dbFavorites || [];
  } catch (error) {
    console.error('Error syncing favorites with database:', error);
    return [];
  }
};
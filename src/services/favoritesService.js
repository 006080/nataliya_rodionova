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
      throw new Error('Failed to toggle favorite');
    }
    
    const data = await response.json();
    return {
      success: true,
      added: data.added,
      items: data.items || []
    };
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return { success: false, message: error.message };
  }
};

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
      throw new Error('Failed to clear favorites');
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
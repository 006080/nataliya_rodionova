import { authFetch, getAccessToken, isAuthenticated } from './authService';

const getApiUrl = () => {
  return import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL_PROD
    : import.meta.env.VITE_API_BASE_URL_LOCAL;
};

/**
 * Save cart items to database for authenticated user
 * @param {Array} cartItems - The cart items to save
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export const saveCartToDatabase = async (cartItems) => {
  try {
    if (!isAuthenticated() || !getAccessToken()) {
      return false;
    }
    
    const apiUrl = getApiUrl();
    const response = await authFetch(`${apiUrl}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: cartItems }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save cart to database');
    }
    
    return true;
  } catch (error) {
    console.error('Error saving cart to database:', error);
    return false;
  }
};

/**
 * Fetch cart items from database for authenticated user
 * @returns {Promise<Array>} - The cart items from database or empty array if error
 */
export const fetchCartFromDatabase = async () => {
  try {
    if (!isAuthenticated() || !getAccessToken()) {
      return [];
    }
    
    const apiUrl = getApiUrl();
    const response = await authFetch(`${apiUrl}/api/cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch cart from database');
    }
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching cart from database:', error);
    return [];
  }
};

/**
 * Merge guest cart with authenticated user's cart
 * Prioritizes items in database cart but combines quantities when same item exists
 * @param {Array} localItems - Local cart items from localStorage
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export const mergeGuestCartWithUserCart = async (localItems) => {
  try {
    if (!isAuthenticated() || !getAccessToken() || !localItems.length) {
      return false;
    }
    
    // Fetch current database cart first
    const dbItems = await fetchCartFromDatabase();
    
    // If no database items, just save local items directly
    if (!dbItems.length) {
      return await saveCartToDatabase(localItems);
    }
    
    // Merge logic: combine items, add quantities for duplicates
    const mergedItems = [...dbItems]; // Start with database items
    
    // Process local items
    localItems.forEach(localItem => {
      // First try to find by ID if available
      const existingItemByIdIndex = localItem.id 
        ? mergedItems.findIndex(item => item.id === localItem.id) 
        : -1;
        
      // If not found by ID, try by name
      const existingItemByNameIndex = existingItemByIdIndex === -1 
        ? mergedItems.findIndex(item => item.name === localItem.name) 
        : -1;
      
      // If found by either method, combine quantities
      if (existingItemByIdIndex !== -1) {
        mergedItems[existingItemByIdIndex].quantity += localItem.quantity;
      } else if (existingItemByNameIndex !== -1) {
        mergedItems[existingItemByNameIndex].quantity += localItem.quantity;
      } else {
        // If not found at all, add as new item
        mergedItems.push(localItem);
      }
    });
    
    // Save merged cart back to database
    const success = await saveCartToDatabase(mergedItems);
    
    if (success) {
      
      return {
        success: true,
        mergedItems
      };
    }
    
    return false;
  } catch (error) {
    console.error('Error merging carts:', error);
    return false;
  }
};

/**
 * Delete cart from database (used during logout)
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export const clearDatabaseCart = async () => {
  try {
    if (!isAuthenticated() || !getAccessToken()) {
      return false;
    }
    
    const apiUrl = getApiUrl();
    const response = await authFetch(`${apiUrl}/api/cart`, {
      method: 'DELETE',
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error clearing database cart:', error);
    return false;
  }
};
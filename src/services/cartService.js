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
    // Check for logout flag first
    if (sessionStorage.getItem('isUserLogout') === 'true') {
      console.log('Skipping cart save due to logout flag');
      return false;
    }
    
    // Then check authentication
    if (!isAuthenticated() || !getAccessToken()) {
      console.log('Cannot save cart: User not authenticated');
      return false;
    }
    
    // Skip if no items (avoid unnecessary API calls)
    if (!cartItems || cartItems.length === 0) {
      console.log('No items to save to database');
      return true;
    }
    
    console.log('Saving cart to database:', cartItems.length, 'items');
    
    const apiUrl = getApiUrl();
    const response = await authFetch(`${apiUrl}/api/cart`, {
      method: 'POST', // Keep your original method
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: cartItems }),
    });
    
    if (!response.ok) {
      // Handle 401 specifically
      if (response.status === 401) {
        console.error('Unauthorized while saving cart - token may be expired');
      }
      throw new Error(`Failed to save cart to database: ${response.status}`);
    }
    
    console.log('Cart saved successfully');
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
    // Check for logout flag first
    if (sessionStorage.getItem('isUserLogout') === 'true') {
      console.log('Skipping cart fetch due to logout flag');
      return [];
    }
    
    // Then check authentication
    if (!isAuthenticated() || !getAccessToken()) {
      console.log('Cannot fetch cart: User not authenticated');
      return [];
    }
    
    console.log('Fetching cart from database');
    
    const apiUrl = getApiUrl();
    const response = await authFetch(`${apiUrl}/api/cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      // Handle 401 specifically
      if (response.status === 401) {
        console.error('Unauthorized while fetching cart - token may be expired');
        return [];
      }
      throw new Error(`Failed to fetch cart from database: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Cart fetched successfully:', (data.items || []).length, 'items');
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
 * @returns {Promise<boolean|Object>} - Result object or false if failed
 */
export const mergeGuestCartWithUserCart = async (localItems) => {
  try {
    // Check for logout flag first
    if (sessionStorage.getItem('isUserLogout') === 'true') {
      console.log('Skipping cart merge due to logout flag');
      return false;
    }
    
    // Then check authentication and items
    if (!isAuthenticated() || !getAccessToken() || !localItems.length) {
      console.log('Cannot merge carts: User not authenticated or no local items');
      return false;
    }
    
    console.log('Merging guest cart with user cart');
    
    // Fetch current database cart first
    const dbItems = await fetchCartFromDatabase();
    
    // If no database items, just save local items directly
    if (!dbItems.length) {
      console.log('No database items, saving local items directly');
      const success = await saveCartToDatabase(localItems);
      return success ? { success: true, mergedItems: localItems } : false;
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
      console.log('Carts merged successfully:', mergedItems.length, 'total items');
      
      // Trigger the cart-merged event
      window.dispatchEvent(new CustomEvent('cart-merged'));
      
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
      console.log('Cannot clear cart: User not authenticated');
      return true; // Return true as we're essentially "done" if not authenticated
    }
    
    console.log('Clearing database cart');
    
    const apiUrl = getApiUrl();
    const response = await authFetch(`${apiUrl}/api/cart`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      console.error('Error clearing cart:', response.status);
      return false;
    }
    
    console.log('Cart cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing database cart:', error);
    return false;
  }
};
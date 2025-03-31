import { authFetch, getAccessToken, isAuthenticated } from './authService';

const getApiUrl = () => {
  return import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL_PROD
    : import.meta.env.VITE_API_BASE_URL_LOCAL;
};

export const saveCartToDatabase = async (cartItems) => {
  try {
    
    if (sessionStorage.getItem('isUserLogout') === 'true') {
      return false;
    }
    
    if (!isAuthenticated() || !getAccessToken()) {
      return false;
    }
    
    const apiUrl = getApiUrl();
    const token = getAccessToken();
    
    
    const response = await fetch(`${apiUrl}/api/cart`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ items: cartItems }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('Unauthorized while saving cart - token may be expired');
        await window.refreshAccessToken();
        const retryToken = getAccessToken();
        if (retryToken) {
          const retryResponse = await fetch(`${apiUrl}/api/cart`, {
            method: 'POST', 
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${retryToken}`
            },
            body: JSON.stringify({ items: cartItems }),
            credentials: 'include'
          });
          
          if (retryResponse.ok) {
            return true;
          }
        }
      }
      throw new Error(`Failed to save cart to database: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving cart to database:', error);
    return false;
  }
}


export const fetchCartFromDatabase = async () => {
  try {
    if (sessionStorage.getItem('isUserLogout') === 'true') {
      return [];
    }
    
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
      if (response.status === 401) {
        console.error('Unauthorized while fetching cart - token may be expired');
        return [];
      }
      throw new Error(`Failed to fetch cart from database: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching cart from database:', error);
    return [];
  }
};


export const clearDatabaseCart = async () => {
  try {
    
    if (!isAuthenticated() || !getAccessToken()) {
      return true; 
    }
    
    
    const apiUrl = getApiUrl();
        const token = getAccessToken()
        const response = await fetch(`${apiUrl}/api/cart`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        })
    
    if (!response.ok) {
      console.error('Error clearing cart:', response.status);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing database cart:', error);
    return false;
  }
};
import { createContext, useState, useContext, useEffect } from 'react';
import { getPendingOrderId, setPendingOrderId, clearPendingOrderId } from '../src/utils/cookieUtils';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // Initialize cart items from localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCartItems = localStorage.getItem('cartItems');
      return savedCartItems ? JSON.parse(savedCartItems) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });

  // Use cookies for pendingOrderId instead of localStorage
  const [pendingOrderId, setPendingOrderState] = useState(() => {
    return getPendingOrderId();
  });

    // Listen for logout events
    useEffect(() => {
      const handleLogout = () => {
        console.log('CartContext: Detected logout, clearing cart data');
        // Clear cart items
        setCartItems([]);
        // Clear pending order
        setPendingOrderState(null);
        clearPendingOrderId();
        // Remove from localStorage
        localStorage.removeItem('cartItems');

           // Clear the pendingOrderId cookie directly
      // document.cookie = 'pendingOrderId=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        // 
      // console.log('Cart data cleared due to user logout');
      };
  
      // Add event listener for the custom logout event
      window.addEventListener('user-logout', handleLogout);
      
      // Clean up on unmount
      return () => {
        window.removeEventListener('user-logout', handleLogout);
      };
    }, []);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      // First try to find by ID
      const existingItemById = product.id ? prevItems.find((item) => item.id === product.id) : null;
      
      // If no match by ID, try to find by name as fallback
      const existingItem = existingItemById || prevItems.find((item) => item.name === product.name);
      
      // Get the quantity to add (use product.quantity if provided, otherwise default to 1)
      const quantityToAdd = product.quantity || 1;
      
      if (existingItem) {
        // Update quantity for existing item
        return prevItems.map((item) => {
          // Match by ID first if available, otherwise by name
          if ((product.id && item.id === product.id) || 
              (!product.id && item.name === product.name)) {
            return { ...item, quantity: item.quantity + quantityToAdd };
          }
          return item;
        });
      } else {
        // Add new item, preserving its quantity if specified, otherwise set to 1
        return [...prevItems, { 
          ...product, 
          quantity: quantityToAdd 
        }];
      }
    });
  };

  // Update quantity for an item
  // const updateQuantity = (itemId, quantity) => {
  //   setCartItems((prevItems) =>
  //     prevItems.map((item) =>
  //       item.id === itemId ? { ...item, quantity } : item
  //     )
  //   );
  // };
  const updateQuantity = (itemIdentifier, quantity) => {
    setCartItems((prevItems) => {
      // If itemIdentifier is an object, extract id or name
      if (typeof itemIdentifier === 'object' && itemIdentifier !== null) {
        const { id, name } = itemIdentifier;
        
        return prevItems.map((item) => {
          if ((id && item.id === id) || (name && item.name === name)) {
            return { ...item, quantity };
          }
          return item;
        });
      }
      
      // If itemIdentifier is a string, first try to match by id
      if (typeof itemIdentifier === 'string') {
        // Check if any item has this string as an id
        const matchById = prevItems.some(item => item.id === itemIdentifier);
        
        if (matchById) {
          // Match by ID
          return prevItems.map((item) => 
            item.id === itemIdentifier ? { ...item, quantity } : item
          );
        } else {
          // Try to match by name instead
          return prevItems.map((item) => 
            item.name === itemIdentifier ? { ...item, quantity } : item
          );
        }
      }
      
      // If we get here, we couldn't match anything, so return the original array
      return prevItems;
    });
  };

  // Remove item from cart - enhanced to handle different identification methods
  const removeFromCart = (itemIdentifier) => {
    // If no identifier is provided, clear the entire cart
    if (!itemIdentifier) {
      setCartItems([]);
      return;
    }
    
    // Check if we're removing by ID or name
    if (typeof itemIdentifier === 'string') {
      // Try to determine if this is an ID or a name
      const matchById = cartItems.some(item => item.id === itemIdentifier);
      
      if (matchById) {
        // This is an ID, filter by ID
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemIdentifier));
      } else {
        // Assume it's a name if not found as an ID
        setCartItems(prevItems => prevItems.filter(item => item.name !== itemIdentifier));
      }
    } else if (typeof itemIdentifier === 'object' && itemIdentifier !== null) {
      // If an object is passed, check for id or name property
      const { id, name } = itemIdentifier;
      
      if (id) {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
      } else if (name) {
        setCartItems(prevItems => prevItems.filter(item => item.name !== name));
      }
    }
  };

  // Set pending order - Uses cookie
  const setPendingOrder = (orderId) => {
    setPendingOrderState(orderId);
    
    // Store in cookie
    if (orderId) {
      setPendingOrderId(orderId);
    }
  };

  // Clear pending order - Clears cookie
  const clearPendingOrder = (clearCart = false) => {
    setPendingOrderState(null);
    
    // Clear from cookie
    clearPendingOrderId();
    
    // Optionally clear cart
    if (clearCart) {
      setCartItems([]);
      localStorage.removeItem('cartItems');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        pendingOrderId,
        setPendingOrder,
        clearPendingOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
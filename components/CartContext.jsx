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

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  // Update quantity for an item
  const updateQuantity = (itemId, quantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
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
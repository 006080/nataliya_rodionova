// import { createContext, useContext, useState } from 'react';

// const CartContext = createContext();

// export const useCart = () => useContext(CartContext);

// export const CartProvider = ({ children }) => {
//   const [cartItems, setCartItems] = useState([]);

//   const addToCart = (product) => {
//     setCartItems((prevItems) => {
//       const existingItem = prevItems.find((item) => item.name === product.name);
//       if (existingItem) {
//         return prevItems.map((item) =>
//           item.name === product.name
//             ? { ...item, quantity: item.quantity + product.quantity }
//             : item
//         );
//       }
//       return [...prevItems, product];
//     });
//   };

//   const removeFromCart = (productName) => {
//     setCartItems((prevItems) =>
//       prevItems.filter((item) => item.name !== productName)
//     );
//   };

//   return (
//     <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
//       {children}
//     </CartContext.Provider>
//   );
// };


// import { createContext, useContext, useState, useEffect } from 'react';

// const CartContext = createContext();

// export const useCart = () => useContext(CartContext);

// export const CartProvider = ({ children }) => {
//   // Load cart items from localStorage on initial render
//   const [cartItems, setCartItems] = useState(() => {
//     try {
//       const savedCartItems = localStorage.getItem('cartItems');
//       return savedCartItems ? JSON.parse(savedCartItems) : [];
//     } catch (error) {
//       console.error('Error loading cart from localStorage:', error);
//       return [];
//     }
//   });

//   // Initialize pendingOrderId from localStorage
//   const [pendingOrderId, setPendingOrderId] = useState(() => {
//     return localStorage.getItem('pendingOrderId') || null;
//   });

//   // Save cart items to localStorage whenever they change
//   useEffect(() => {
//     try {
//       localStorage.setItem('cartItems', JSON.stringify(cartItems));
//     } catch (error) {
//       console.error('Error saving cart to localStorage:', error);
//     }
//   }, [cartItems]);

//   // Save pendingOrderId to localStorage whenever it changes
//   useEffect(() => {
//     if (pendingOrderId) {
//       localStorage.setItem('pendingOrderId', pendingOrderId);
//     } else {
//       localStorage.removeItem('pendingOrderId');
//     }
//   }, [pendingOrderId]);

//   const addToCart = (product) => {
//     setCartItems((prevItems) => {
//       const existingItem = prevItems.find((item) => item.name === product.name);
//       if (existingItem) {
//         return prevItems.map((item) =>
//           item.name === product.name
//             ? { ...item, quantity: item.quantity + product.quantity }
//             : item
//         );
//       }
//       return [...prevItems, product];
//     });
//   };

//   const removeFromCart = (productName) => {
//     // If productName is provided, remove that specific item
//     if (productName) {
//       setCartItems((prevItems) =>
//         prevItems.filter((item) => item.name !== productName)
//       );
//     } 
//     // If no productName is provided, clear the entire cart
//     else {
//       setCartItems([]);
//     }
//   };

//   // Set the pending order ID
//   const setPendingOrder = (orderId) => {
//     setPendingOrderId(orderId);
//   };

//   // Clear the pending order ID
//   const clearPendingOrder = () => {
//     setPendingOrderId(null);
//   };

//   return (
//     <CartContext.Provider 
//       value={{ 
//         cartItems, 
//         addToCart, 
//         removeFromCart,
//         pendingOrderId,
//         setPendingOrder,
//         clearPendingOrder
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };




// import { createContext, useContext, useState, useEffect } from 'react';

// const CartContext = createContext();

// export const useCart = () => useContext(CartContext);

// export const CartProvider = ({ children }) => {
//   // Load cart items from localStorage on initial render
//   const [cartItems, setCartItems] = useState(() => {
//     try {
//       const savedCartItems = localStorage.getItem('cartItems');
//       return savedCartItems ? JSON.parse(savedCartItems) : [];
//     } catch (error) {
//       console.error('Error loading cart from localStorage:', error);
//       return [];
//     }
//   });

//   // Initialize pendingOrderId from localStorage
//   const [pendingOrderId, setPendingOrderId] = useState(() => {
//     return localStorage.getItem('pendingOrderId') || null;
//   });

//   // Save cart items to localStorage whenever they change
//   useEffect(() => {
//     try {
//       localStorage.setItem('cartItems', JSON.stringify(cartItems));
//     } catch (error) {
//       console.error('Error saving cart to localStorage:', error);
//     }
//   }, [cartItems]);

//   // Save pendingOrderId to localStorage whenever it changes
//   useEffect(() => {
//     if (pendingOrderId) {
//       localStorage.setItem('pendingOrderId', pendingOrderId);
//     } else {
//       localStorage.removeItem('pendingOrderId');
//     }
//   }, [pendingOrderId]);

//   const addToCart = (product) => {
//     setCartItems((prevItems) => {
//       const existingItem = prevItems.find((item) => item.name === product.name);
//       if (existingItem) {
//         return prevItems.map((item) =>
//           item.name === product.name
//             ? { ...item, quantity: item.quantity + product.quantity }
//             : item
//         );
//       }
//       return [...prevItems, product];
//     });
//   };

//   const removeFromCart = (productName) => {
//     // If productName is provided, remove that specific item
//     if (productName) {
//       setCartItems((prevItems) =>
//         prevItems.filter((item) => item.name !== productName)
//       );
//     } 
//     // If no productName is provided, clear the entire cart
//     else {
//       setCartItems([]);
//     }
//   };

//   // Set the pending order ID
//   const setPendingOrder = (orderId) => {
//     setPendingOrderId(orderId);
//   };

//   // Clear the pending order ID and optionally clear the cart
//   const clearPendingOrder = (clearCart = false) => {
//     setPendingOrderId(null);
    
//     // Also clear the cart if the clearCart parameter is true
//     if (clearCart) {
//       setCartItems([]);
//       localStorage.removeItem('cartItems');
//     }
//   };

//   return (
//     <CartContext.Provider 
//       value={{ 
//         cartItems, 
//         addToCart, 
//         removeFromCart,
//         pendingOrderId,
//         setPendingOrder,
//         clearPendingOrder
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };


import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // Load cart items from localStorage on initial render
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCartItems = localStorage.getItem('cartItems');
      return savedCartItems ? JSON.parse(savedCartItems) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });

  // Initialize pendingOrderId from localStorage
  const [pendingOrderId, setPendingOrderId] = useState(() => {
    return localStorage.getItem('pendingOrderId') || null;
  });

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    if (cartItems.length > 0) {
      try {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    } else {
      // If cart is empty, remove the item from localStorage
      localStorage.removeItem('cartItems');
    }
  }, [cartItems]);

  // Save pendingOrderId to localStorage whenever it changes
  useEffect(() => {
    if (pendingOrderId) {
      localStorage.setItem('pendingOrderId', pendingOrderId);
    } else {
      localStorage.removeItem('pendingOrderId');
    }
  }, [pendingOrderId]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.name === product.name);
      if (existingItem) {
        return prevItems.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      }
      return [...prevItems, product];
    });
  };

  const removeFromCart = (productName) => {
    // If productName is provided, remove that specific item
    if (productName) {
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.name !== productName)
      );
    } 
    // If no productName is provided, clear the entire cart
    else {
      setCartItems([]);
      localStorage.removeItem('cartItems');
    }
  };

  // Set the pending order ID
  const setPendingOrder = (orderId) => {
    // Always reset the previous pendingOrderId regardless of value
    if (pendingOrderId) {
      console.log(`Replacing existing pendingOrderId: ${pendingOrderId} with new ID: ${orderId}`);
    }
    
    // Set the new order ID
    setPendingOrderId(orderId);
    localStorage.setItem('pendingOrderId', orderId);
  };

  // Clear the pending order ID and optionally clear the cart
  const clearPendingOrder = (clearCart = false) => {
    console.log(`Clearing pendingOrderId: ${pendingOrderId}`);
    
    // Clear pendingOrderId
    setPendingOrderId(null);
    localStorage.removeItem('pendingOrderId');
    
    // Also clear the cart if the clearCart parameter is true
    if (clearCart) {
      setCartItems([]);
      localStorage.removeItem('cartItems');
      
      // Clear other checkout-related localStorage items
      localStorage.removeItem('measurements');
      localStorage.removeItem('deliveryDetails');
    }
  };

  // Check if an order is the same as the pending order
  const isCurrentPendingOrder = (orderId) => {
    return pendingOrderId === orderId;
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart,
        pendingOrderId,
        setPendingOrder,
        clearPendingOrder,
        isCurrentPendingOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
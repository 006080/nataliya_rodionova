// import { createContext, useState, useContext, useEffect } from 'react';
// // import { getPendingOrderId, setPendingOrderId, clearPendingOrderId } from '../src/utils/cookieUtils';

// const CartContext = createContext();

// export const useCart = () => useContext(CartContext);

// export const CartProvider = ({ children }) => {
//   // Initialize cart items from localStorage
//   const [cartItems, setCartItems] = useState(() => {
//     try {
//       const savedCartItems = localStorage.getItem('cartItems');
//       return savedCartItems ? JSON.parse(savedCartItems) : [];
//     } catch (error) {
//       console.error('Error loading cart from localStorage:', error);
//       return [];
//     }
//   });

//   // Use cookies for pendingOrderId instead of localStorage
//   // const [pendingOrderId, setPendingOrderState] = useState(() => {
//   //   return getPendingOrderId();
//   // });
//   // const [pendingOrderId, setPendingOrderState] = useState(null)

//     // Listen for logout events
//     useEffect(() => {
//       const handleLogout = () => {
//         console.log('CartContext: Detected logout, clearing cart data');
//         // Clear cart items
//         setCartItems([]);
//         // Clear pending order
//         // setPendingOrderState(null);
//         // clearPendingOrderId();
//         // Remove from localStorage
//         localStorage.removeItem('cartItems');

//            // Clear the pendingOrderId cookie directly
//       // document.cookie = 'pendingOrderId=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
//         // 
//       // console.log('Cart data cleared due to user logout');
//       };
  
//       // Add event listener for the custom logout event
//       window.addEventListener('user-logout', handleLogout);
      
//       // Clean up on unmount
//       return () => {
//         window.removeEventListener('user-logout', handleLogout);
//       };
//     }, []);

//   // Save cart items to localStorage whenever they change
//   useEffect(() => {
//     localStorage.setItem('cartItems', JSON.stringify(cartItems));
//   }, [cartItems]);

//   // Add item to cart
//   const addToCart = (product) => {
//     setCartItems((prevItems) => {
//       // First try to find by ID
//       const existingItemById = product.id ? prevItems.find((item) => item.id === product.id) : null;
      
//       // If no match by ID, try to find by name as fallback
//       const existingItem = existingItemById || prevItems.find((item) => item.name === product.name);
      
//       // Get the quantity to add (use product.quantity if provided, otherwise default to 1)
//       const quantityToAdd = product.quantity || 1;
      
//       if (existingItem) {
//         // Update quantity for existing item
//         return prevItems.map((item) => {
//           // Match by ID first if available, otherwise by name
//           if ((product.id && item.id === product.id) || 
//               (!product.id && item.name === product.name)) {
//             return { ...item, quantity: item.quantity + quantityToAdd };
//           }
//           return item;
//         });
//       } else {
//         // Add new item, preserving its quantity if specified, otherwise set to 1
//         return [...prevItems, { 
//           ...product, 
//           quantity: quantityToAdd 
//         }];
//       }
//     });
//   };


//   const updateQuantity = (itemIdentifier, quantity) => {
//     setCartItems((prevItems) => {
//       // If itemIdentifier is an object, extract id or name
//       if (typeof itemIdentifier === 'object' && itemIdentifier !== null) {
//         const { id, name } = itemIdentifier;
        
//         return prevItems.map((item) => {
//           if ((id && item.id === id) || (name && item.name === name)) {
//             return { ...item, quantity };
//           }
//           return item;
//         });
//       }
      
//       // If itemIdentifier is a string, first try to match by id
//       if (typeof itemIdentifier === 'string') {
//         // Check if any item has this string as an id
//         const matchById = prevItems.some(item => item.id === itemIdentifier);
        
//         if (matchById) {
//           // Match by ID
//           return prevItems.map((item) => 
//             item.id === itemIdentifier ? { ...item, quantity } : item
//           );
//         } else {
//           // Try to match by name instead
//           return prevItems.map((item) => 
//             item.name === itemIdentifier ? { ...item, quantity } : item
//           );
//         }
//       }
      
//       // If we get here, we couldn't match anything, so return the original array
//       return prevItems;
//     });
//   };

//   // Remove item from cart - enhanced to handle different identification methods
//   const removeFromCart = (itemIdentifier) => {
//     // If no identifier is provided, clear the entire cart
//     if (!itemIdentifier) {
//       setCartItems([]);
//       return;
//     }
    
//     // Check if we're removing by ID or name
//     if (typeof itemIdentifier === 'string') {
//       // Try to determine if this is an ID or a name
//       const matchById = cartItems.some(item => item.id === itemIdentifier);
      
//       if (matchById) {
//         // This is an ID, filter by ID
//         setCartItems(prevItems => prevItems.filter(item => item.id !== itemIdentifier));
//       } else {
//         // Assume it's a name if not found as an ID
//         setCartItems(prevItems => prevItems.filter(item => item.name !== itemIdentifier));
//       }
//     } else if (typeof itemIdentifier === 'object' && itemIdentifier !== null) {
//       // If an object is passed, check for id or name property
//       const { id, name } = itemIdentifier;
      
//       if (id) {
//         setCartItems(prevItems => prevItems.filter(item => item.id !== id));
//       } else if (name) {
//         setCartItems(prevItems => prevItems.filter(item => item.name !== name));
//       }
//     }
//   };


//   //26.03.2025
//   // Set pending order - Uses cookie
//   // const setPendingOrder = (orderId) => {
//   //   setPendingOrderState(orderId);
    
//   //   // Store in cookie
//   //   if (orderId) {
//   //     setPendingOrderId(orderId);
//   //   }
//   // };

//   // // Clear pending order - Clears cookie
//   // const clearPendingOrder = (clearCart = false) => {
//   //   setPendingOrderState(null);
    
//   //   // Clear from cookie
//   //   clearPendingOrderId();
    
//   //   // Optionally clear cart
//   //   if (clearCart) {
//   //     setCartItems([]);
//   //     localStorage.removeItem('cartItems');
//   //   }
//   // };


//   // Remove the setPendingOrder function since we no longer want to use it
// // We'll keep the function signature for compatibility but make it a no-op
// // const setPendingOrder = (orderId) => {
// //   console.log("setPendingOrder is deprecated and will be removed in future versions");
// //   // No longer storing pending order IDs
// // };

// // // Update clearPendingOrder to always clear cart
// // const clearPendingOrder = (clearCart = true) => {
// //   // Always clear cart now 
// //   setCartItems([]);
// //   localStorage.removeItem('cartItems');
  
// //   // Clear from cookie (for backwards compatibility during transition)
// //   clearPendingOrderId();
  
// //   // Reset pendingOrderState for React state consistency
// //   setPendingOrderState(null);
// // };

//   return (
//     <CartContext.Provider
//       value={{
//         cartItems,
//         addToCart,
//         removeFromCart,
//         updateQuantity,
//         // pendingOrderId,
//         // setPendingOrder,
//         // clearPendingOrder
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };

// export default CartContext;




// import { createContext, useState, useContext, useEffect } from 'react';
// import { getPendingOrderId, setPendingOrderId, clearPendingOrderId } from '../src/utils/cookieUtils';

// const CartContext = createContext();

// export const useCart = () => useContext(CartContext);

// export const CartProvider = ({ children }) => {
//   // Initialize cart items from localStorage
//   const [cartItems, setCartItems] = useState(() => {
//     try {
//       const savedCartItems = localStorage.getItem('cartItems');
//       return savedCartItems ? JSON.parse(savedCartItems) : [];
//     } catch (error) {
//       console.error('Error loading cart from localStorage:', error);
//       return [];
//     }
//   });

//   // Use cookies for pendingOrderId instead of localStorage
//   const [pendingOrderId, setPendingOrderState] = useState(() => {
//     return getPendingOrderId();
//   });

//     // Listen for logout events
//     useEffect(() => {
//       const handleLogout = () => {
//         console.log('CartContext: Detected logout, clearing cart data');
//         // Clear cart items
//         setCartItems([]);
//         // Clear pending order
//         setPendingOrderState(null);
//         clearPendingOrderId();
//         // Remove from localStorage
//         localStorage.removeItem('cartItems');

//            // Clear the pendingOrderId cookie directly
//       // document.cookie = 'pendingOrderId=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
//         // 
//       // console.log('Cart data cleared due to user logout');
//       };
  
//       // Add event listener for the custom logout event
//       window.addEventListener('user-logout', handleLogout);
      
//       // Clean up on unmount
//       return () => {
//         window.removeEventListener('user-logout', handleLogout);
//       };
//     }, []);

//   // Save cart items to localStorage whenever they change
//   useEffect(() => {
//     localStorage.setItem('cartItems', JSON.stringify(cartItems));
//   }, [cartItems]);

//   // Add item to cart
//   const addToCart = (product) => {
//     setCartItems((prevItems) => {
//       // First try to find by ID
//       const existingItemById = product.id ? prevItems.find((item) => item.id === product.id) : null;
      
//       // If no match by ID, try to find by name as fallback
//       const existingItem = existingItemById || prevItems.find((item) => item.name === product.name);
      
//       // Get the quantity to add (use product.quantity if provided, otherwise default to 1)
//       const quantityToAdd = product.quantity || 1;
      
//       if (existingItem) {
//         // Update quantity for existing item
//         return prevItems.map((item) => {
//           // Match by ID first if available, otherwise by name
//           if ((product.id && item.id === product.id) || 
//               (!product.id && item.name === product.name)) {
//             return { ...item, quantity: item.quantity + quantityToAdd };
//           }
//           return item;
//         });
//       } else {
//         // Add new item, preserving its quantity if specified, otherwise set to 1
//         return [...prevItems, { 
//           ...product, 
//           quantity: quantityToAdd 
//         }];
//       }
//     });
//   };


//   const updateQuantity = (itemIdentifier, quantity) => {
//     setCartItems((prevItems) => {
//       // If itemIdentifier is an object, extract id or name
//       if (typeof itemIdentifier === 'object' && itemIdentifier !== null) {
//         const { id, name } = itemIdentifier;
        
//         return prevItems.map((item) => {
//           if ((id && item.id === id) || (name && item.name === name)) {
//             return { ...item, quantity };
//           }
//           return item;
//         });
//       }
      
//       // If itemIdentifier is a string, first try to match by id
//       if (typeof itemIdentifier === 'string') {
//         // Check if any item has this string as an id
//         const matchById = prevItems.some(item => item.id === itemIdentifier);
        
//         if (matchById) {
//           // Match by ID
//           return prevItems.map((item) => 
//             item.id === itemIdentifier ? { ...item, quantity } : item
//           );
//         } else {
//           // Try to match by name instead
//           return prevItems.map((item) => 
//             item.name === itemIdentifier ? { ...item, quantity } : item
//           );
//         }
//       }
      
//       // If we get here, we couldn't match anything, so return the original array
//       return prevItems;
//     });
//   };

//   // Remove item from cart - enhanced to handle different identification methods
//   const removeFromCart = (itemIdentifier) => {
//     // If no identifier is provided, clear the entire cart
//     if (!itemIdentifier) {
//       setCartItems([]);
//       return;
//     }
    
//     // Check if we're removing by ID or name
//     if (typeof itemIdentifier === 'string') {
//       // Try to determine if this is an ID or a name
//       const matchById = cartItems.some(item => item.id === itemIdentifier);
      
//       if (matchById) {
//         // This is an ID, filter by ID
//         setCartItems(prevItems => prevItems.filter(item => item.id !== itemIdentifier));
//       } else {
//         // Assume it's a name if not found as an ID
//         setCartItems(prevItems => prevItems.filter(item => item.name !== itemIdentifier));
//       }
//     } else if (typeof itemIdentifier === 'object' && itemIdentifier !== null) {
//       // If an object is passed, check for id or name property
//       const { id, name } = itemIdentifier;
      
//       if (id) {
//         setCartItems(prevItems => prevItems.filter(item => item.id !== id));
//       } else if (name) {
//         setCartItems(prevItems => prevItems.filter(item => item.name !== name));
//       }
//     }
//   };


//   //26.03.2025
//   // Set pending order - Uses cookie
//   // const setPendingOrder = (orderId) => {
//   //   setPendingOrderState(orderId);
    
//   //   // Store in cookie
//   //   if (orderId) {
//   //     setPendingOrderId(orderId);
//   //   }
//   // };

//   // // Clear pending order - Clears cookie
//   // const clearPendingOrder = (clearCart = false) => {
//   //   setPendingOrderState(null);
    
//   //   // Clear from cookie
//   //   clearPendingOrderId();
    
//   //   // Optionally clear cart
//   //   if (clearCart) {
//   //     setCartItems([]);
//   //     localStorage.removeItem('cartItems');
//   //   }
//   // };


//   // Remove the setPendingOrder function since we no longer want to use it
// // We'll keep the function signature for compatibility but make it a no-op
// const setPendingOrder = (orderId) => {
//   console.log("setPendingOrder is deprecated and will be removed in future versions");
//   // No longer storing pending order IDs
// };

// // Update clearPendingOrder to always clear cart
// const clearPendingOrder = (clearCart = true) => {
//   // Always clear cart now 
//   setCartItems([]);
//   localStorage.removeItem('cartItems');
  
//   // Clear from cookie (for backwards compatibility during transition)
//   clearPendingOrderId();
  
//   // Reset pendingOrderState for React state consistency
//   setPendingOrderState(null);
// };

//   return (
//     <CartContext.Provider
//       value={{
//         cartItems,
//         addToCart,
//         removeFromCart,
//         updateQuantity,
//         pendingOrderId,
//         setPendingOrder,
//         clearPendingOrder
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };

// export default CartContext;





import { createContext, useState, useContext, useEffect } from 'react';
import { getPendingOrderId, setPendingOrderId, clearPendingOrderId } from '../src/utils/cookieUtils';
import { isAuthenticated } from '../src/services/authService';
import { 
  saveCartToDatabase,   
  fetchCartFromDatabase, 
  clearDatabaseCart 
} from '../src/services/cartService';

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

  // Track whether initial DB sync has happened
  const [initialSyncDone, setInitialSyncDone] = useState(false);
  // Track if we're authenticated
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(() => isAuthenticated());

  // Use cookies for pendingOrderId instead of localStorage
  const [pendingOrderId, setPendingOrderState] = useState(() => {
    return getPendingOrderId();
  });

  // Initial load - fetch cart from database if user is authenticated
  useEffect(() => {
    const syncCartWithDatabase = async () => {
      if (isAuthenticated() && !initialSyncDone) {
        try {
          console.log('CartContext: Fetching cart from database');
          const dbCartItems = await fetchCartFromDatabase();
          
          // If we have items in the database, use them
          if (dbCartItems && dbCartItems.length > 0) {
            console.log('CartContext: Database cart found with', dbCartItems.length, 'items');
            setCartItems(dbCartItems);
            // Update localStorage for consistency
            localStorage.setItem('cartItems', JSON.stringify(dbCartItems));
          } else {
            // If db cart is empty but we have local items, sync them to db
            if (cartItems.length > 0) {
              console.log('CartContext: Syncing local cart to database');
              await saveCartToDatabase(cartItems);
            }
          }
          
          setInitialSyncDone(true);
          setIsUserAuthenticated(true);
        } catch (error) {
          console.error('Error syncing with database:', error);
        }
      }
    };

    syncCartWithDatabase();
  }, [initialSyncDone, cartItems.length]);

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthStateChange = async () => {
      const userIsAuthenticated = isAuthenticated();
      console.log('CartContext: Auth state changed, authenticated:', userIsAuthenticated);
      
      // If user just logged in
      if (userIsAuthenticated && !isUserAuthenticated) {
        setIsUserAuthenticated(true);
        try {
          // Fetch cart from database
          const dbCartItems = await fetchCartFromDatabase();
          
          // If we have items in database and local cart
          if (dbCartItems.length > 0 && cartItems.length > 0) {
            console.log('CartContext: Need to merge carts');
            // Handle merging logic (we'll let the server handle this)
            // Keep using current cart until server responds with merged cart
          } else if (dbCartItems.length > 0) {
            // Use database cart
            console.log('CartContext: Using database cart');
            setCartItems(dbCartItems);
            localStorage.setItem('cartItems', JSON.stringify(dbCartItems));
          } else if (cartItems.length > 0) {
            // Sync local cart to database
            console.log('CartContext: Syncing local cart to database');
            await saveCartToDatabase(cartItems);
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
        }
      } else if (!userIsAuthenticated && isUserAuthenticated) {
        // User just logged out
        setIsUserAuthenticated(false);
        setInitialSyncDone(false);
      }
    };

    // Add event listener for auth state changes
    window.addEventListener('auth-state-changed', handleAuthStateChange);
    
    // Clean up on unmount
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChange);
    };
  }, [isUserAuthenticated, cartItems]);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    // If authenticated, also save to database
    if (isUserAuthenticated && initialSyncDone) {
      // Debounce database updates to prevent excessive API calls
      const timeoutId = setTimeout(() => {
        saveCartToDatabase(cartItems).catch(error => {
          console.error('Error saving cart to database:', error);
        });
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [cartItems, isUserAuthenticated, initialSyncDone]);

  // Listen for logout events
  useEffect(() => {
    const handleLogout = async () => {
      console.log('CartContext: Detected logout, clearing cart data');
      
      // Clear database cart if we were authenticated
      if (isUserAuthenticated) {
        try {
          await clearDatabaseCart();
        } catch (error) {
          console.error('Error clearing database cart:', error);
        }
      }
      
      // Clear cart items
      setCartItems([]);
      // Clear pending order
      setPendingOrderState(null);
      clearPendingOrderId();
      // Remove from localStorage
      localStorage.removeItem('cartItems');
      // Reset auth state
      setIsUserAuthenticated(false);
      setInitialSyncDone(false);
    };

    // Add event listener for the custom logout event
    window.addEventListener('user-logout', handleLogout);
    
    // Clean up on unmount
    return () => {
      window.removeEventListener('user-logout', handleLogout);
    };
  }, [isUserAuthenticated]);

  // Listen for cart-merged event
  useEffect(() => {
    const handleCartMerged = async (event) => {
      console.log('CartContext: Cart merged event received');
      
      // Refresh cart from database
      try {
        const dbCartItems = await fetchCartFromDatabase();
        if (dbCartItems && dbCartItems.length > 0) {
          setCartItems(dbCartItems);
          localStorage.setItem('cartItems', JSON.stringify(dbCartItems));
          console.log('CartContext: Updated cart after merge, items:', dbCartItems.length);
        }
      } catch (error) {
        console.error('Error refreshing cart after merge:', error);
      }
    };

    window.addEventListener('cart-merged', handleCartMerged);
    
    return () => {
      window.removeEventListener('cart-merged', handleCartMerged);
    };
  }, []);

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

  // Remove the setPendingOrder function since we no longer want to use it
  // We'll keep the function signature for compatibility but make it a no-op
  const setPendingOrder = (orderId) => {
    console.log("setPendingOrder is deprecated and will be removed in future versions");
    // No longer storing pending order IDs
  };

  // Update clearPendingOrder to always clear cart
  const clearPendingOrder = (clearCart = true) => {
    // Always clear cart now 
    setCartItems([]);
    localStorage.removeItem('cartItems');
    
    // If authenticated, also clear database cart
    if (isUserAuthenticated) {
      clearDatabaseCart().catch(error => {
        console.error('Error clearing database cart:', error);
      });
    }
    
    // Clear from cookie (for backwards compatibility during transition)
    clearPendingOrderId();
    
    // Reset pendingOrderState for React state consistency
    setPendingOrderState(null);
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
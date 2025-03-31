import { createContext, useState, useContext, useEffect } from 'react'
import { getAccessToken, isAuthenticated } from '../src/services/authService'
import {
  saveCartToDatabase,
  fetchCartFromDatabase,
  clearDatabaseCart,
} from '../src/services/cartService'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCartItems = localStorage.getItem('cartItems')
      return savedCartItems ? JSON.parse(savedCartItems) : []
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
      return []
    }
  })

  const [initialSyncDone, setInitialSyncDone] = useState(false)
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(() => 
    isAuthenticated()
  )

  const getApiUrl = () => {
    return import.meta.env.VITE_NODE_ENV === "production"
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL;
  };

  const syncCartWithDatabase = async (force = false) => {
    if (sessionStorage.getItem('isUserLogout') === 'true') {
      return
    }
    
    if (isAuthenticated() && (!initialSyncDone || force)) {
      try {
        if (!initialSyncDone || force) {
          const dbCartItems = await fetchCartFromDatabase()
  
          if (dbCartItems && dbCartItems.length > 0) {
            setCartItems(dbCartItems)
            localStorage.setItem('cartItems', JSON.stringify(dbCartItems))
          } else {
            if (cartItems.length > 0) {
              await saveCartToDatabase(cartItems)
            }
          }
        }
  
        setInitialSyncDone(true)
        setIsUserAuthenticated(true)
      } catch (error) {
        console.error('Error syncing with database:', error)
      }
    }
  }

  // Initial cart sync on component mount
  useEffect(() => {
    syncCartWithDatabase()
  }, [initialSyncDone])

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthStateChange = async () => {
      // Skip if logout flag is set
      if (sessionStorage.getItem('isUserLogout') === 'true') {
        return
      }
      
      const userIsAuthenticated = isAuthenticated()

      if (userIsAuthenticated && !isUserAuthenticated) {
        setIsUserAuthenticated(true)
        try {
          const dbCartItems = await fetchCartFromDatabase()

          if (dbCartItems.length > 0 && cartItems.length > 0) {
            // console.log('CartContext: Merging carts')
          } else if (dbCartItems.length > 0) {
            setCartItems(dbCartItems)
            localStorage.setItem('cartItems', JSON.stringify(dbCartItems))
          } else if (cartItems.length > 0) {
            await saveCartToDatabase(cartItems)
          }
        } catch (error) {
          console.error('Error handling auth state change:', error)
        }
      } else if (!userIsAuthenticated && isUserAuthenticated) {
        setIsUserAuthenticated(false)
        setInitialSyncDone(false)
      }
    }

    window.addEventListener('auth-state-changed', handleAuthStateChange)
    window.addEventListener('auth-state-sync', handleAuthStateChange)

    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChange)
      window.removeEventListener('auth-state-sync', handleAuthStateChange)
    }
  }, [isUserAuthenticated, cartItems])

  useEffect(() => {
    const handleLoadUserCart = async () => {

      localStorage.removeItem('cartItems')
      setCartItems([])
      if (isAuthenticated()) {
        await syncCartWithDatabase(true)
      }
    }

    window.addEventListener('load-user-cart', handleLoadUserCart)

    return () => {
      window.removeEventListener('load-user-cart', handleLoadUserCart)
    }
  }, [])

  
useEffect(() => {
  localStorage.setItem('cartItems', JSON.stringify(cartItems))

  if (sessionStorage.getItem('isUserLogout') === 'true') {
    return
  }

  // For authenticated users, sync with database (with debounce)
  if (isUserAuthenticated && initialSyncDone) {
    const timeoutId = setTimeout(() => {
      // Use a direct check before saving to avoid timing issues
      if (isAuthenticated()) {
        saveCartToDatabase(cartItems).then(success => {
          if (success) {
            // console.log('Cart successfully synced with database');
          } else {
            console.error('Failed to sync cart with database');
          }
        }).catch((error) => {
          console.error('Error saving cart to database:', error)
        })
      } else {
        // console.log('Skipping database sync - user no longer authenticated');
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }
}, [cartItems, isUserAuthenticated, initialSyncDone])

  useEffect(() => {
    const handleLogout = async () => {

    setCartItems([])
    localStorage.removeItem('cartItems')
      
    // if (isUserAuthenticated) {
    //   try {
    //     // const success = await clearDatabaseCart()
    //     // console.log('Database cart cleared:', success)
    //   } catch (error) {
    //     console.error('Error clearing database cart:', error)
    //   }
    // }


      setIsUserAuthenticated(false)
      setInitialSyncDone(false)
    }

    window.addEventListener('user-logout', handleLogout)
    window.addEventListener('auth-logout', handleLogout)

    return () => {
      window.removeEventListener('user-logout', handleLogout)
      window.removeEventListener('auth-logout', handleLogout)
    }
  }, [isUserAuthenticated])

  // Listen for cart merge events
  useEffect(() => {
    const handleCartMerged = async () => {
      try {
        const dbCartItems = await fetchCartFromDatabase()
        if (dbCartItems && dbCartItems.length > 0) {
          setCartItems(dbCartItems)
          localStorage.setItem('cartItems', JSON.stringify(dbCartItems))
        }
      } catch (error) {
        console.error('Error refreshing cart after merge:', error)
      }
    }

    window.addEventListener('cart-merged', handleCartMerged)

    return () => {
      window.removeEventListener('cart-merged', handleCartMerged)
    }
  }, [])

  // Cart manipulation functions remain the same
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItemById = product.id
        ? prevItems.find((item) => item.id === product.id)
        : null
      const existingItem =
        existingItemById || prevItems.find((item) => item.name === product.name)
      const quantityToAdd = product.quantity || 1

      if (existingItem) {
        return prevItems.map((item) => {
          if (
            (product.id && item.id === product.id) ||
            (!product.id && item.name === product.name)
          ) {
            return { ...item, quantity: item.quantity + quantityToAdd }
          }
          return item
        })
      } else {
        return [
          ...prevItems,
          {
            ...product,
            quantity: quantityToAdd,
          },
        ]
      }
    })
  }

  const updateQuantity = (itemIdentifier, quantity) => {
    setCartItems((prevItems) => {
      if (typeof itemIdentifier === 'object' && itemIdentifier !== null) {
        const { id, name } = itemIdentifier

        return prevItems.map((item) => {
          if ((id && item.id === id) || (name && item.name === name)) {
            return { ...item, quantity }
          }
          return item
        })
      }

      if (typeof itemIdentifier === 'string') {
        const matchById = prevItems.some((item) => item.id === itemIdentifier)

        if (matchById) {
          return prevItems.map((item) =>
            item.id === itemIdentifier ? { ...item, quantity } : item
          )
        } else {
          return prevItems.map((item) =>
            item.name === itemIdentifier ? { ...item, quantity } : item
          )
        }
      }

      return prevItems
    })
  }

  const removeFromCart = async (itemIdentifier) => {
    let updatedCartItems = [];
    
    if (!itemIdentifier) {
      setCartItems([]);
      localStorage.removeItem('cartItems');
      
      if (isUserAuthenticated) {
        try {
          await clearDatabaseCart();
        } catch (error) {
          console.error('Error clearing database cart:', error);
        }
      }
      return;
    }
  
    // Remove specific item
    if (typeof itemIdentifier === 'string') {
      const matchById = cartItems.some((item) => item.id === itemIdentifier);
  
      if (matchById) {
        updatedCartItems = cartItems.filter((item) => item.id !== itemIdentifier);
      } else {
        updatedCartItems = cartItems.filter((item) => item.name !== itemIdentifier);
      }
    } else if (typeof itemIdentifier === 'object' && itemIdentifier !== null) {
      const { id, name } = itemIdentifier;
  
      if (id) {
        updatedCartItems = cartItems.filter((item) => item.id !== id);
      } else if (name) {
        updatedCartItems = cartItems.filter((item) => item.name !== name);
      }
    }
    
    setCartItems(updatedCartItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
    
    if (isUserAuthenticated && initialSyncDone) {
      try {
        await saveCartToDatabase(updatedCartItems);
      } catch (error) {
        console.error('Error saving updated cart to database:', error);
      }
    }
  }

  const clearPendingOrder = async () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  
    if (isUserAuthenticated) {
      try {
        
        const apiUrl = getApiUrl();
        const token = getAccessToken();
        
        const response = await fetch(`${apiUrl}/api/cart`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          console.error('Direct API call to clear cart failed:', response.status);
     
          const success = await clearDatabaseCart();
          if (!success) {
            console.error('Helper function also failed to clear cart');
          }
        } else {
          // console.log('Cart cleared successfully from database');
        }
      } catch (error) {
        console.error('Error clearing database cart:', error);
      }
    }
  }


useEffect(() => {
  const handleCartCleared = () => {
    setCartItems([])
    localStorage.removeItem('cartItems')
    setIsUserAuthenticated(false)
    setInitialSyncDone(false)
  }

  window.addEventListener('cart-cleared', handleCartCleared)

  return () => {
    window.removeEventListener('cart-cleared', handleCartCleared)
  }
}, [])


  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearPendingOrder: async () => {
          await clearPendingOrder();
        },
        forceCartSync: async () => {
          if (isAuthenticated()) {
            await syncCartWithDatabase(true);
            return true;
          }
          return false;
        },
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export default CartContext
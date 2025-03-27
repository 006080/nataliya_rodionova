import { createContext, useState, useContext, useEffect } from 'react'
import { isAuthenticated } from '../src/services/authService'
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

  useEffect(() => {
    const syncCartWithDatabase = async () => {
      if (isAuthenticated() && !initialSyncDone) {
        try {
          const dbCartItems = await fetchCartFromDatabase()

          if (dbCartItems && dbCartItems.length > 0) {
            setCartItems(dbCartItems)
            localStorage.setItem('cartItems', JSON.stringify(dbCartItems))
          } else {
            if (cartItems.length > 0) {
              await saveCartToDatabase(cartItems)
            }
          }

          setInitialSyncDone(true)
          setIsUserAuthenticated(true)
        } catch (error) {
          console.error('Error syncing with database:', error)
        }
      }
    }

    syncCartWithDatabase()
  }, [initialSyncDone, cartItems.length])

  useEffect(() => {
    const handleAuthStateChange = async () => {
      const userIsAuthenticated = isAuthenticated()

      if (userIsAuthenticated && !isUserAuthenticated) {
        setIsUserAuthenticated(true)
        try {
          const dbCartItems = await fetchCartFromDatabase()

          if (dbCartItems.length > 0 && cartItems.length > 0) {
            // console.log('CartContext: Need to merge carts')
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

    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChange)
    }
  }, [isUserAuthenticated, cartItems])

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems))

    if (isUserAuthenticated && initialSyncDone) {
      const timeoutId = setTimeout(() => {
        saveCartToDatabase(cartItems).catch((error) => {
          console.error('Error saving cart to database:', error)
        })
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [cartItems, isUserAuthenticated, initialSyncDone])

  useEffect(() => {
    const handleLogout = async () => {
      if (isUserAuthenticated) {
        try {
          await clearDatabaseCart()
        } catch (error) {
          console.error('Error clearing database cart:', error)
        }
      }

      setCartItems([])

      localStorage.removeItem('cartItems')

      setIsUserAuthenticated(false)
      setInitialSyncDone(false)
    }

    window.addEventListener('user-logout', handleLogout)

    return () => {
      window.removeEventListener('user-logout', handleLogout)
    }
  }, [isUserAuthenticated])

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

  const removeFromCart = (itemIdentifier) => {
    if (!itemIdentifier) {
      setCartItems([])
      return
    }

    if (typeof itemIdentifier === 'string') {
      const matchById = cartItems.some((item) => item.id === itemIdentifier)

      if (matchById) {
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.id !== itemIdentifier)
        )
      } else {
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.name !== itemIdentifier)
        )
      }
    } else if (typeof itemIdentifier === 'object' && itemIdentifier !== null) {
      const { id, name } = itemIdentifier

      if (id) {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== id))
      } else if (name) {
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.name !== name)
        )
      }
    }
  }

  // const setPendingOrder = () => {
  //   // console.log(
  //   //   'setPendingOrder is deprecated and will be removed in future versions'
  //   // )
  // }

  const clearPendingOrder = () => {
    setCartItems([])
    localStorage.removeItem('cartItems')

    if (isUserAuthenticated) {
      clearDatabaseCart().catch((error) => {
        console.error('Error clearing database cart:', error)
      })
    }
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        // setPendingOrder,
        clearPendingOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export default CartContext

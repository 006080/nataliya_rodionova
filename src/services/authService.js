import { jwtDecode } from 'jwt-decode'
import {
  getPersistedAccessToken,
  persistAccessToken,
} from '../utils/authHelpers'

const getApiUrl = () => {
  return import.meta.env.VITE_NODE_ENV === 'production'
    ? import.meta.env.VITE_API_BASE_URL_PROD
    : import.meta.env.VITE_API_BASE_URL_LOCAL
}

let lastRefreshTime = 0
const REFRESH_COOLDOWN = 10000
let refreshPromise = null

// Extract user data from token
const extractUserDataFromToken = (token) => {
  try {
    if (!token) return null

    const decoded = jwtDecode(token)

    // Store minimal user data
    return {
      id: decoded.sub || null,
      role: decoded.role || 'customer',
      emailVerified: decoded.emailVerified || false,
      expiresAt: decoded.exp ? decoded.exp * 1000 : null,
    }
  } catch (error) {
    return null
  }
}

export const setTokens = (accessToken, refreshToken, userData = {}) => {
  try {
    // Store the access token in memory
    window.accessToken = accessToken
    persistAccessToken(accessToken)

    // Store minimal user info in memory for UI purposes
    if (accessToken) {
      const tokenData = extractUserDataFromToken(accessToken)
      if (tokenData) {
        window.currentUser = {
          ...tokenData,
          name: userData.name || '',
          email: userData.email || '',
        }
      }
    }

    // Broadcast auth state to other tabs
    if (window.authChannel) {
      window.authChannel.postMessage({
        type: 'AUTH_STATE_CHANGED',
        accessToken: window.accessToken,
        currentUser: window.currentUser,
      })
    }
  } catch (error) {
    console.error('Error storing auth tokens')
  }
}

// Clear auth data on logout
export const clearTokens = async () => {
  try {
    // Clear memory tokens
    window.accessToken = null
    window.currentUser = null

    // Clear session indicators
    sessionStorage.removeItem('sessionActive')

    // Clear refresh token cookie (via API call)
    await fetch(`${getApiUrl()}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch (error) {
    console.error('Error clearing auth tokens')
  }
}

// Get current access token from memory
export const getAccessToken = () => {
  return window.accessToken || getPersistedAccessToken()
}

// Check if token is expired
export const isTokenExpired = () => {
  try {
    const user = window.currentUser || {}
    return !user.expiresAt || user.expiresAt <= Date.now()
  } catch (error) {
    return true
  }
}

export const getCurrentUser = () => {
  try {
    // Return the in-memory user object
    if (window.currentUser) {
      return window.currentUser
    }

    // Try to recover by extracting from token
    const token = getAccessToken()
    if (token) {
      const tokenData = extractUserDataFromToken(token)
      if (tokenData && tokenData.id) {
        window.currentUser = tokenData
        return tokenData
      }
    }

    return {}
  } catch (error) {
    return {}
  }
}

// Check if user is authenticated (has valid token)
export const isAuthenticated = () => {
  return !!getAccessToken() && !isTokenExpired()
}

export const refreshAccessToken = async () => {
  // Don't refresh if user has deliberately logged out - use correct flag name
  if (
    window.hasLoggedOut ||
    sessionStorage.getItem('isUserLogout') === 'true'
  ) {
    return null
  }

  // Check if another tab is already refreshing
  if (window.isRefreshingToken) {
    // Wait a bit and check if it's completed
    await new Promise((resolve) => setTimeout(resolve, 500))
    if (window.accessToken) {
      return window.accessToken
    }
  }

  // Return existing promise if refresh is already in progress in this tab
  if (refreshPromise) {
    return refreshPromise
  }

  // Check if we've refreshed recently in this tab
  const now = Date.now()
  if (now - lastRefreshTime < REFRESH_COOLDOWN) {
    return getAccessToken()
  }

  try {
    // Signal to other tabs that we're starting a refresh
    if (window.authChannel) {
      window.authChannel.postMessage({
        type: 'REFRESH_STARTED',
      })
    }

    window.isRefreshingToken = true

    refreshPromise = new Promise((resolve, reject) => {
      // Set last refresh time
      lastRefreshTime = now

      // Make the API call
      fetch(`${getApiUrl()}/api/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
      })
        .then((response) => {
          if (!response.ok) {
            // If refresh fails with 401 Unauthorized, mark as logged out
            if (response.status === 401) {
              window.hasLoggedOut = true
              sessionStorage.setItem('isUserLogout', 'true')
              sessionStorage.removeItem('sessionActive')
            }
            throw new Error('Failed to refresh token')
          }
          return response.json()
        })
        .then((data) => {
          // Check for deliberate logout before processing the response
          if (
            window.hasLoggedOut ||
            sessionStorage.getItem('isUserLogout') === 'true'
          ) {
            throw new Error('User has logged out, ignoring token refresh')
          }

          // Store in memory
          window.accessToken = data.accessToken
          persistAccessToken(data.accessToken)

          if (data.user && data.user.name && data.user.email) {
            window.currentUser = {
              id: data.user.id,
              role: data.user.role,
              emailVerified: data.user.emailVerified,
              name: data.user.name,
              email: data.user.email,
              expiresAt: extractUserDataFromToken(data.accessToken)?.expiresAt,
            }
          } else {
            // Fallback to using token data + preserving existing user info
            const existingUserData = window.currentUser || {}
            const tokenData = extractUserDataFromToken(data.accessToken)

            if (tokenData && tokenData.id) {
              window.currentUser = {
                ...tokenData,
                name: existingUserData.name || '',
                email: existingUserData.email || '',
              }
            }
          }

          // Always set session as active when refresh is successful
          sessionStorage.setItem('sessionActive', 'true')

          // Only update session if not logged out
          if (
            !window.hasLoggedOut &&
            sessionStorage.getItem('isUserLogout') !== 'true'
          ) {
            sessionStorage.setItem('sessionActive', 'true')

            // Broadcast to other tabs
            if (window.authChannel) {
              window.authChannel.postMessage({
                type: 'AUTH_STATE_CHANGED',
                accessToken: window.accessToken,
                currentUser: window.currentUser,
              })
            }

            // Trigger cart load for the user after successful refresh
            try {
              const cartLoadEvent = new CustomEvent('load-user-cart')
              window.dispatchEvent(cartLoadEvent)

              const favoritesLoadEvent = new CustomEvent('load-user-favorites');
              window.dispatchEvent(favoritesLoadEvent);
            } catch (cartError) {
              console.error('Error triggering cart load:', cartError)
            }
          }

          resolve(data.accessToken)
        })
        .catch((error) => {
          // Clear session on refresh failure
          sessionStorage.removeItem('sessionActive')
          reject(error)
        })
        .finally(() => {
          // Signal that refresh is complete
          if (window.authChannel) {
            window.authChannel.postMessage({
              type: 'REFRESH_COMPLETE',
            })
          }
          window.isRefreshingToken = false
        })
    })

    return await refreshPromise
  } catch (error) {
    return null
  } finally {
    refreshPromise = null
  }
}

export const authFetch = async (url, options = {}) => {
  // Check if token needs refresh
  if (isTokenExpired()) {
    const newToken = await refreshAccessToken()
    if (!newToken) {
      throw new Error('Session expired. Please login again.')
    }
  }

  // Add authorization header
  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${getAccessToken()}`,
    },
  }

  // Make the API call
  const response = await fetch(url, authOptions)

  // Handle 401 Unauthorized (token rejected)
  if (response.status === 401) {
    // Try to refresh token and retry request once
    const newToken = await refreshAccessToken()
    if (!newToken) {
      throw new Error('Session expired. Please login again.')
    }

    // Retry the request with new token
    const retryOptions = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      },
    }

    return fetch(url, retryOptions)
  }

  return response
}

export const clearAllAuthData = async () => {
  try {
    window.hasLoggedOut = true
    sessionStorage.setItem('isUserLogout', 'true')

    localStorage.removeItem('cartItems')
    localStorage.removeItem('favorites')

    // Broadcast logout to all tabs
    if (window.authChannel) {
      window.authChannel.postMessage({
        type: 'USER_LOGOUT',
      })
    }

    // Clear memory tokens
    window.accessToken = null
    window.currentUser = null

    // Clear session indicators
    sessionStorage.removeItem('sessionActive')

    // WHITELIST APPROACH: Save only specific items we want to keep
    const whitelistedKeys = [
      // 'cartItems',
      'measurements',
      'deliveryDetails',
      'rememberedEmail',
    ]

    // Save values for whitelisted keys
    const preservedData = {}
    whitelistedKeys.forEach((key) => {
      preservedData[key] = localStorage.getItem(key)
    })

    localStorage.clear()

    // Restore only the whitelisted items
    Object.keys(preservedData).forEach((key) => {
      if (preservedData[key]) {
        localStorage.setItem(key, preservedData[key])
      }
    })

    // Clear sessionStorage except for isUserLogout flag and any whitelisted items
    const whitelistedSessionKeys = ['isUserLogout']
    const sessionKeys = Object.keys(sessionStorage)

    sessionKeys.forEach((key) => {
      if (!whitelistedSessionKeys.includes(key)) {
        sessionStorage.removeItem(key)
      }
    })

    // Clear cart from database if authenticated
    try {
      const apiUrl = getApiUrl()
      await fetch(`${apiUrl}/api/cart`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
        credentials: 'include',
      })
    } catch (cartError) {
      // Continue despite cart error
    }

    // Clear favorites from database if authenticated
    try {
      const apiUrl = getApiUrl()
      await fetch(`${apiUrl}/api/favorites`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
        credentials: 'include',
      })
    } catch (favoritesError) {
      // Continue despite favorites error
    }

    // Clear refresh token cookie (via API call) - wait for this to complete
    const response = await fetch(`${getApiUrl()}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) {
      console.error('Logout API call failed')
    }

    // Client-side attempt to clear cookies (won't work for HttpOnly cookies)
    document.cookie.split(';').forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
    })

    // Dispatch an additional cart-cleared event
    try {
      const cartClearedEvent = new CustomEvent('cart-cleared')
      window.dispatchEvent(cartClearedEvent)

      const favoritesClearedEvent = new CustomEvent('favorites-cleared')
      window.dispatchEvent(favoritesClearedEvent)
    } catch (error) {
      console.error('Error dispatching cart-cleared event:', error)
    }

    return true
  } catch (error) {
    console.error('Error during logout:', error)
    return false
  }
}

export const loginUser = async (email, password) => {
  try {
    // Important: Reset logout flag - use the correct flag name "isUserLogout"
    window.hasLoggedOut = false
    sessionStorage.removeItem('isUserLogout')

    // Also remove the old flag name for compatibility
    sessionStorage.removeItem('hasLoggedOut')

    // Broadcast login to all tabs
    if (window.authChannel) {
      window.authChannel.postMessage({
        type: 'USER_LOGIN',
      })
    }

    localStorage.removeItem('cartItems')
    localStorage.removeItem('favorites')

    const apiUrl = getApiUrl()

    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })

    const data = await response.json()

    // Handle email verification error
    if (response.status === 403 && data.needsVerification) {
      return {
        success: false,
        needsVerification: true,
        verificationDetails: data.verificationDetails || { email },
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Login failed',
      }
    }

    setTokens(data.accessToken, data.refreshToken, data.user)

    const localCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]')

    if (localCartItems.length > 0) {
      try {
        await fetch(`${apiUrl}/api/cart/merge`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.accessToken}`,
          },
          body: JSON.stringify({ items: localCartItems }),
          credentials: 'include',
        })
      } catch (error) {
        // Continue despite cart error
      }
    }

    const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    if (localFavorites.length > 0) {
      try {
        await fetch(`${apiUrl}/api/favorites/merge`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.accessToken}`,
          },
          body: JSON.stringify({ items: localFavorites }),
          credentials: 'include',
        })

        // After successful merge, clear local favorites
        localStorage.removeItem('favorites')
      } catch (error) {
        console.error('Error merging favorites:', error)
      }
    }

    const authStateChangedEvent = new CustomEvent('auth-state-changed')
    window.dispatchEvent(authStateChangedEvent)

    try {
      const cartLoadEvent = new CustomEvent('load-user-cart')
      window.dispatchEvent(cartLoadEvent)

      const favoritesLoadEvent = new CustomEvent('load-user-favorites');
      window.dispatchEvent(favoritesLoadEvent);
    } catch (cartError) {
      console.error('Error triggering cart load:', cartError)
    }

    // Force page reload after allowing time for cart load
    setTimeout(() => {
      window.location.reload()
    }, 300)

    return {
      success: true,
      user: data.user,
      reloading: true,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    }
  }
}

// Make refreshAccessToken available globally
window.refreshAccessToken = refreshAccessToken

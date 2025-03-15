/**
 * Cookie utility functions for managing order persistence
 */

// Set a cookie with expiration in days
export const setCookie = (name, value, expirationDays = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
};

// Get a cookie by name
export const getCookie = (name) => {
  const cookieName = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  return null;
};

// Remove a cookie by name
export const removeCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
};

// Get pending order ID from cookie
export const getPendingOrderId = () => {
  return getCookie('pendingOrderId');
};

// Set pending order ID in cookie
export const setPendingOrderId = (orderId) => {
  // Set cookie to expire in 7 days
  setCookie('pendingOrderId', orderId, 7);
};

// Clear pending order ID from cookie
export const clearPendingOrderId = () => {
  removeCookie('pendingOrderId');
};
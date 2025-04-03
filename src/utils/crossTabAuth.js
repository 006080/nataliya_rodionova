export const initializeAuth = () => {
  if (typeof window === 'undefined') return;

  window.accessToken = null;
  window.currentUser = null;
  
  setupCrossTabAuth();
  
  const hasLoggedOut = sessionStorage.getItem('isUserLogout') === 'true' || window.hasLoggedOut;
  
  if (!hasLoggedOut) {
    setTimeout(() => {
      if (!window.accessToken && !window.isRefreshingToken) {
        window.refreshAccessToken?.()
          .then(token => {
            if (token && window.currentUser) {
              sessionStorage.setItem('sessionActive', 'true');
              window.dispatchEvent(new CustomEvent('auth-state-sync'));
              
              // Broadcast updated auth state to other tabs if needed
              if (window.authChannel) {
                window.authChannel.postMessage({
                  type: 'AUTH_STATE_CHANGED',
                  accessToken: window.accessToken,
                  currentUser: window.currentUser
                });
              }
            }
          })
          .catch(console.error);
      }
    }, 300);
  }
};


export const setupCrossTabAuth = () => {
  if (typeof window === 'undefined' || !window.BroadcastChannel) return;
  
  window.isRefreshingToken = false;
  
  window.hasLoggedOut = sessionStorage.getItem('isUserLogout') === 'true';
  
  const authChannel = new BroadcastChannel('auth_channel');
  
  authChannel.onmessage = (event) => {
    if (event.data.type === 'USER_LOGOUT') {
      // Handle logout from another tab
      window.accessToken = null;
      window.currentUser = null;
      window.isRefreshingToken = false;
      
      // Set logout flag to prevent automatic re-login - use the correct flag name
      window.hasLoggedOut = true;
      sessionStorage.setItem('isUserLogout', 'true');
      
      sessionStorage.removeItem('sessionActive');
      
      window.dispatchEvent(new CustomEvent('auth-logout'));
    }
    else if (event.data.type === 'AUTH_STATE_CHANGED') {
      if (window.hasLoggedOut) {
        return;
      }
      
      // Update auth state from another tab
      window.accessToken = event.data.accessToken;
      window.currentUser = event.data.currentUser;
      window.isRefreshingToken = false;
      
      if (window.accessToken) {
        sessionStorage.setItem('sessionActive', 'true');
      }
      
      window.dispatchEvent(new CustomEvent('auth-state-sync'));
    } 
    else if (event.data.type === 'REFRESH_STARTED') {
      window.isRefreshingToken = true;
    }
    else if (event.data.type === 'REFRESH_COMPLETE') {
      window.isRefreshingToken = false;
    }
    else if (event.data.type === 'AUTH_STATUS_CHECK') {
      if (window.hasLoggedOut) {
        return;
      }
      
      // Another tab is asking if anyone has auth data
      if (window.accessToken && window.currentUser) {
        // Share our auth state with the requesting tab
        authChannel.postMessage({
          type: 'AUTH_STATE_CHANGED',
          accessToken: window.accessToken,
          currentUser: window.currentUser
        });
      }
    }
    else if (event.data.type === 'USER_LOGIN') {
      // Reset logout flag on explicit login
      window.hasLoggedOut = false;
      sessionStorage.removeItem('isUserLogout');
    }
  };
  
  // Store the channel for later use
  window.authChannel = authChannel;
  
  if (!window.hasLoggedOut) {
    // Ask other tabs if they have auth state (helpful for new tabs)
    authChannel.postMessage({
      type: 'AUTH_STATUS_CHECK'
    });
  }
  
  return authChannel;
};

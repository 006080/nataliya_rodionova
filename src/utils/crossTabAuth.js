export const setupCrossTabAuth = () => {
  if (typeof window === 'undefined' || !window.BroadcastChannel) return;
  
  // Track if another tab is refreshing the token
  window.isRefreshingToken = false;
  
  // Create a broadcast channel for authentication
  const authChannel = new BroadcastChannel('auth_channel');
  
  // Listen for auth events from other tabs
  authChannel.onmessage = (event) => {
    if (event.data.type === 'AUTH_STATE_CHANGED') {
      // Update auth state from another tab
      window.accessToken = event.data.accessToken;
      window.currentUser = event.data.currentUser;
      window.isRefreshingToken = false;
      
      // Store session active marker
      if (window.accessToken) {
        sessionStorage.setItem('sessionActive', 'true');
      }
      
      // Trigger auth state update in React
      window.dispatchEvent(new CustomEvent('auth-state-sync'));
    } 
    else if (event.data.type === 'REFRESH_STARTED') {
      // Another tab is already refreshing, let's wait
      window.isRefreshingToken = true;
    }
    else if (event.data.type === 'REFRESH_COMPLETE') {
      // Reset the flag when refresh is done in another tab
      window.isRefreshingToken = false;
    }
    else if (event.data.type === 'AUTH_STATUS_CHECK') {
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
  };
  
  // Store the channel for later use
  window.authChannel = authChannel;
  
  // Ask other tabs if they have auth state (helpful for new tabs)
  authChannel.postMessage({
    type: 'AUTH_STATUS_CHECK'
  });
  
  return authChannel;
};

// Modified script for main.jsx to check for auth data in other tabs first
if (typeof window !== 'undefined') {
  window.accessToken = null;
  window.currentUser = null;

  // Setup cross-tab authentication
  const authChannel = setupCrossTabAuth();
  
  // On new page load, check if other tabs have auth data first
  if (sessionStorage.getItem('sessionActive') === 'true' && authChannel) {
    // Ask other tabs for auth state (handled in setupCrossTabAuth)
    // Wait a short time for responses before proceeding with normal init
    setTimeout(() => {
      // If we still don't have auth data from other tabs, try to refresh
      if (!window.accessToken && !window.isRefreshingToken) {
        window.refreshAccessToken?.().catch(console.error);
      }
    }, 300); // Short delay to allow for responses from other tabs
  }
}
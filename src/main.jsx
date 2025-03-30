import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { setupCrossTabAuth } from './utils/crossTabAuth';
import './index.css'


if (typeof window !== 'undefined') {
  window.accessToken = null;
  window.currentUser = null;

  setupCrossTabAuth();
  
 // Create a broadcast channel for authentication
 window.authChannel = new BroadcastChannel('auth_channel');
  
 // Listen for auth events from other tabs
 window.authChannel.onmessage = (event) => {
   if (event.data.type === 'AUTH_STATE_CHANGED') {
     // Update auth state from another tab
     window.accessToken = event.data.accessToken;
     window.currentUser = event.data.currentUser;
     
     // Trigger auth state update in React
     window.dispatchEvent(new CustomEvent('auth-state-sync'));
   }
 };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

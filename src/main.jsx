import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// ⬅️ НОВЫЙ ИМПОРТ: HelmetProvider для SEO-тегов
import { HelmetProvider } from 'react-helmet-async';
import { initializeAuth } from './utils/crossTabAuth.js';


// Initialize auth state and setup cross-tab communication
// Эта функция остается на месте
initializeAuth();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ⬅️ НОВАЯ ОБЕРТКА: Оборачиваем App в HelmetProvider на самом верхнем уровне */}
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
)
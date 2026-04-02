import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Let vite-plugin-pwa handle service worker registration automatically
if ('serviceWorker' in navigator) {
  // Clears out legacy static worker caches if any
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      if (registration.active && registration.active.scriptURL.endsWith('sw.js') && !registration.active.scriptURL.includes('dev-dist')) {
        registration.unregister();
      }
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

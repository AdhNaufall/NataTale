import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register Service Worker for PWA Phase 1
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && (import.meta as any).env?.MODE !== 'test') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('NataTale PWA ServiceWorker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('NataTale PWA ServiceWorker registration failed:', error);
      });
  });
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ProgressProvider } from './progression/store.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProgressProvider>
      <App />
    </ProgressProvider>
  </StrictMode>,
);

// Register service worker for offline PWA support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

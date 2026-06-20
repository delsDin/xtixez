import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully intercept and suppress benign network/WebSocket/HMR connection errors
// which can occur when HMR is intentionally disabled or restricted by the platform.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const reasonStr = String(reason || '');
    const message = reason?.message || '';
    
    if (
      message.toLowerCase().includes('websocket') || 
      reasonStr.toLowerCase().includes('websocket') ||
      message.toLowerCase().includes('vite') ||
      reasonStr.toLowerCase().includes('vite')
    ) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      console.warn('Suppressed benign live development HMR connection error:', reason);
    }
  }, { capture: true });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (msg.toLowerCase().includes('websocket') || msg.toLowerCase().includes('vite')) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      console.warn('Suppressed benign live development HMR error event:', msg);
    }
  }, { capture: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


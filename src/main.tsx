// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import { ThemeProvider } from './contexts/ThemeContext'; // <-- BUNU EKLEYİN
import { WebSocketProvider } from './contexts/WebSocketContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider> {/* <-- BUNU EKLEYİN */}
      <WebSocketProvider>
          <App />
      </WebSocketProvider>
    </ThemeProvider> {/* <-- BUNU EKLEYİN */}
  </React.StrictMode>
);
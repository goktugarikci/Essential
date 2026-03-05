// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import { ThemeProvider } from './contexts/ThemeContext'; // <-- BUNU EKLEYİN

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider> {/* <-- BUNU EKLEYİN */}
      <App />
    </ThemeProvider> {/* <-- BUNU EKLEYİN */}
  </React.StrictMode>
);
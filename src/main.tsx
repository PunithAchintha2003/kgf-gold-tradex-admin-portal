import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { MerchantChatProvider } from './contexts/MerchantChatContext';
import App from './App';
import { createAppTheme } from './theme/theme';
import { injectKeyframes } from './theme/animations';
import './styles/sonner.css';

injectKeyframes();

// Clean up any corrupted auth values left in localStorage by older builds
// (e.g. the literal string "undefined" from JSON.stringify(undefined)).
(() => {
  try {
    const keys = ['accessToken', 'refreshToken', 'user'];
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value === 'undefined' || value === 'null') {
        localStorage.removeItem(key);
      }
    }
  } catch {
    /* ignore */
  }
})();

const ThemedApp: React.FC = () => {
  const { mode } = useTheme();
  const theme = createAppTheme(mode);

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <NotificationProvider>
          <MerchantChatProvider>
            <App />
          </MerchantChatProvider>
        </NotificationProvider>
      </ToastProvider>
    </MUIThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

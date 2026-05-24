import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { MerchantChatProvider } from './contexts/MerchantChatContext';
import App from './App';
import { createAppTheme } from './theme/theme';
import { injectKeyframes } from './theme/animations';

// Inject keyframe animations on app load
injectKeyframes();

const ThemedApp: React.FC = () => {
  const { mode } = useTheme();
  const theme = createAppTheme(mode);

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <MerchantChatProvider>
          <App />
        </MerchantChatProvider>
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

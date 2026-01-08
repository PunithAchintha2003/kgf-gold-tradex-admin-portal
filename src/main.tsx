import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import App from './App';
import { createAppTheme } from './theme/theme';

const ThemedApp: React.FC = () => {
  const { mode } = useTheme();
  const theme = createAppTheme(mode);

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      <App />
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

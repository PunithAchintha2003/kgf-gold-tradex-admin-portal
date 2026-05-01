import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import App from './App';
import { createAppTheme } from './theme/theme';
const ThemedApp = () => {
    const { mode } = useTheme();
    const theme = createAppTheme(mode);
    return (_jsxs(MUIThemeProvider, { theme: theme, children: [_jsx(CssBaseline, {}), _jsx(App, {})] }));
};
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(BrowserRouter, { children: _jsx(ThemeProvider, { children: _jsx(ThemedApp, {}) }) }) }));

import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const ThemeContext = createContext(undefined);
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
export const ThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        // Initialize from localStorage or system preference
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('kgf-admin-theme');
            if (savedTheme === 'light' || savedTheme === 'dark') {
                return savedTheme;
            }
            // Check system preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light';
    });
    useEffect(() => {
        localStorage.setItem('kgf-admin-theme', mode);
    }, [mode]);
    const toggleTheme = () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    };
    const value = {
        mode,
        toggleTheme,
        setMode,
    };
    return _jsx(ThemeContext.Provider, { value: value, children: children });
};

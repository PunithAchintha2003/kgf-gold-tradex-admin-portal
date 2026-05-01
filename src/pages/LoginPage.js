import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, InputAdornment, IconButton, Alert, Container, useTheme as useMUITheme, } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Brightness4, Brightness7 } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
const LoginPage = () => {
    const navigate = useNavigate();
    const { mode, toggleTheme } = useTheme();
    const muiTheme = useMUITheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await authService.login({ email, password });
            if (response.success && response.data.user.role === 'SUPER_ADMIN') {
                navigate('/dashboard');
            }
            else {
                setError('Access denied. Super admin privileges required.');
                await authService.logout();
            }
        }
        catch (err) {
            setError(err.response?.data?.error || err.message || 'Login failed. Please check your credentials.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(Box, { sx: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
            position: 'relative',
        }, children: [_jsx(IconButton, { onClick: toggleTheme, sx: {
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    color: 'text.primary',
                }, "aria-label": "toggle theme", children: mode === 'dark' ? _jsx(Brightness7, {}) : _jsx(Brightness4, {}) }), _jsx(Container, { maxWidth: "sm", children: _jsx(Card, { sx: {
                        width: '100%',
                        maxWidth: 500,
                        backgroundColor: muiTheme.palette.mode === 'dark' ? '#1a1a1a' : '#f9fafb', // Match price predictor card exact
                        border: muiTheme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e5e7eb', // Match price predictor exact
                        boxShadow: muiTheme.palette.mode === 'dark'
                            ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                            : '0 8px 32px rgba(0, 0, 0, 0.1)',
                    }, children: _jsxs(CardContent, { sx: { p: 4 }, children: [_jsxs(Box, { sx: { textAlign: 'center', mb: 4 }, children: [_jsx(Typography, { variant: "h4", component: "h1", gutterBottom: true, sx: {
                                            fontWeight: 700,
                                            background: mode === 'dark'
                                                ? 'linear-gradient(135deg, #F5D300 0%, #FFE55C 100%)'
                                                : 'linear-gradient(135deg, #d4af37 0%, #c28800 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                        }, children: "KGF Gold TradeX" }), _jsx(Typography, { variant: "h6", sx: {
                                            mt: 1,
                                            color: mode === 'dark' ? '#9ca3af' : '#6b7280', // Match price predictor exact
                                        }, children: "Admin Portal" })] }), error && (_jsx(Alert, { severity: "error", sx: {
                                    mb: 3,
                                    backgroundColor: muiTheme.palette.mode === 'dark'
                                        ? 'rgba(239, 68, 68, 0.1)'
                                        : 'rgba(239, 68, 68, 0.05)',
                                    border: muiTheme.palette.mode === 'dark'
                                        ? '1px solid rgba(239, 68, 68, 0.3)'
                                        : '1px solid rgba(239, 68, 68, 0.2)',
                                    color: muiTheme.palette.mode === 'dark' ? '#fca5a5' : '#ef4444',
                                }, children: error })), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx(TextField, { fullWidth: true, label: "Email Address", type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, margin: "normal", InputProps: {
                                            startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(Email, {}) })),
                                        } }), _jsx(TextField, { fullWidth: true, label: "Password", type: showPassword ? 'text' : 'password', value: password, onChange: (e) => setPassword(e.target.value), required: true, margin: "normal", InputProps: {
                                            startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(Lock, {}) })),
                                            endAdornment: (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: () => setShowPassword(!showPassword), edge: "end", children: showPassword ? _jsx(VisibilityOff, {}) : _jsx(Visibility, {}) }) })),
                                        } }), _jsx(Button, { type: "submit", fullWidth: true, variant: "contained", sx: {
                                            mt: 3,
                                            mb: 2,
                                            py: 1.5,
                                            background: mode === 'dark'
                                                ? 'linear-gradient(135deg, #F5D300 0%, #E6C200 100%)'
                                                : 'linear-gradient(135deg, #d4af37 0%, #c28800 100%)',
                                            color: mode === 'dark' ? '#000000' : '#FFFFFF',
                                            fontWeight: 600,
                                            '&:hover': {
                                                background: mode === 'dark'
                                                    ? 'linear-gradient(135deg, #FFE55C 0%, #F5D300 100%)'
                                                    : 'linear-gradient(135deg, #c28800 0%, #d4af37 100%)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: muiTheme.palette.mode === 'dark'
                                                    ? '0 4px 12px rgba(245, 211, 0, 0.4)'
                                                    : '0 4px 12px rgba(212, 175, 55, 0.4)',
                                            },
                                            '&:disabled': {
                                                background: mode === 'dark'
                                                    ? 'rgba(245, 211, 0, 0.3)'
                                                    : 'rgba(212, 175, 55, 0.3)',
                                            },
                                        }, disabled: loading, children: loading ? 'Signing In...' : 'Sign In' })] })] }) }) })] }));
};
export default LoginPage;

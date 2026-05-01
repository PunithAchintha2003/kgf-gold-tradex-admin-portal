import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText, Container, IconButton, Menu, MenuItem, useTheme as useMUITheme, } from '@mui/material';
import { Dashboard, People, ReceiptLong, PendingActions, Logout, Brightness4, Brightness7, AccountCircle, } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
const drawerWidth = 280;
const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = authService.getCurrentUser();
    const { mode, toggleTheme } = useTheme();
    const muiTheme = useMUITheme();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    const menuItems = [
        { text: 'Dashboard', icon: _jsx(Dashboard, {}), path: '/dashboard' },
        { text: 'Users', icon: _jsx(People, {}), path: '/users' },
        { text: 'Transactions', icon: _jsx(ReceiptLong, {}), path: '/transactions' },
        { text: 'Withdrawals', icon: _jsx(PendingActions, {}), path: '/withdrawals' },
    ];
    return (_jsxs(Box, { sx: { display: 'flex', minHeight: '100vh' }, children: [_jsx(AppBar, { position: "fixed", sx: {
                    width: `calc(100% - ${drawerWidth}px)`,
                    ml: `${drawerWidth}px`,
                    backgroundColor: muiTheme.palette.mode === 'dark' ? '#111111' : '#FFFFFF', // Match price predictor navbar exact
                    background: mode === 'dark'
                        ? '#111111'
                        : 'linear-gradient(135deg, #d4af37 0%, #c28800 100%)',
                    borderBottom: muiTheme.palette.mode === 'dark' ? '1px solid #1f1f1f' : '1px solid #E0E0E0', // Match price predictor exact
                    boxShadow: muiTheme.palette.mode === 'dark'
                        ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                        : '0 2px 8px rgba(0, 0, 0, 0.1)',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }, children: _jsxs(Toolbar, { children: [_jsx(Typography, { variant: "h6", noWrap: true, component: "div", sx: {
                                flexGrow: 1,
                                fontWeight: 600,
                                color: mode === 'dark' ? '#F5D300' : '#FFFFFF',
                            }, children: "KGF Gold TradeX - Admin Portal" }), _jsx(IconButton, { onClick: toggleTheme, sx: {
                                color: mode === 'dark' ? '#F5D300' : '#FFFFFF',
                                mr: 2,
                            }, "aria-label": "toggle theme", children: mode === 'dark' ? _jsx(Brightness7, {}) : _jsx(Brightness4, {}) }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Typography, { variant: "body2", sx: {
                                        display: { xs: 'none', sm: 'block' },
                                        color: mode === 'dark' ? '#FFFFFF' : '#FFFFFF',
                                        mr: 1,
                                    }, children: user?.name || 'Admin' }), _jsx(IconButton, { onClick: handleMenuOpen, sx: {
                                        color: mode === 'dark' ? '#F5D300' : '#FFFFFF',
                                        '&:hover': {
                                            backgroundColor: mode === 'dark'
                                                ? 'rgba(245, 211, 0, 0.1)'
                                                : 'rgba(255, 255, 255, 0.2)',
                                        },
                                    }, children: _jsx(AccountCircle, { sx: { fontSize: 32 } }) }), _jsxs(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleMenuClose, anchorOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    }, transformOrigin: {
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }, PaperProps: {
                                        sx: {
                                            backgroundColor: muiTheme.palette.mode === 'dark' ? '#121212' : '#FFFFFF', // Match price predictor sidebar exact
                                            border: muiTheme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E0E0E0', // Match price predictor exact
                                            boxShadow: muiTheme.palette.mode === 'dark'
                                                ? '0 4px 20px rgba(0, 0, 0, 0.5)'
                                                : '0 4px 20px rgba(0, 0, 0, 0.15)',
                                        },
                                    }, children: [_jsxs(MenuItem, { onClick: handleMenuClose, sx: {
                                                color: muiTheme.palette.mode === 'dark' ? '#FFFFFF' : '#111827', // Match price predictor exact
                                                '&:hover': {
                                                    backgroundColor: muiTheme.palette.mode === 'dark'
                                                        ? 'rgba(255, 255, 255, 0.05)'
                                                        : 'rgba(0, 0, 0, 0.04)',
                                                },
                                            }, children: [_jsx(AccountCircle, { sx: { mr: 1 } }), "Profile"] }), _jsx(Divider, { sx: {
                                                borderColor: muiTheme.palette.mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.1)'
                                                    : '#E0E0E0', // Match price predictor exact
                                            } }), _jsxs(MenuItem, { onClick: handleLogout, sx: {
                                                color: muiTheme.palette.mode === 'dark' ? '#FFFFFF' : '#111827', // Match price predictor exact
                                                '&:hover': {
                                                    backgroundColor: muiTheme.palette.mode === 'dark'
                                                        ? 'rgba(255, 255, 255, 0.05)'
                                                        : 'rgba(0, 0, 0, 0.04)',
                                                },
                                            }, children: [_jsx(Logout, { sx: { mr: 1 } }), "Logout"] })] })] })] }) }), _jsxs(Drawer, { sx: {
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        backgroundColor: muiTheme.palette.mode === 'dark' ? '#121212' : '#FFFFFF', // Match price predictor sidebar exact
                        borderRight: muiTheme.palette.mode === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1px solid #E0E0E0', // Match price predictor exact
                    },
                }, variant: "permanent", anchor: "left", children: [_jsx(Toolbar, { sx: {
                            backgroundColor: muiTheme.palette.mode === 'dark' ? '#121212' : '#FFFFFF', // Match price predictor sidebar exact
                            background: mode === 'dark'
                                ? '#121212'
                                : 'linear-gradient(135deg, #d4af37 0%, #c28800 100%)',
                            color: mode === 'dark' ? '#FFFFFF' : '#000000', // Match price predictor exact
                            minHeight: '64px !important',
                        }, children: _jsx(Typography, { variant: "h6", noWrap: true, component: "div", sx: { fontWeight: 600 }, children: "Admin Portal" }) }), _jsx(Divider, { sx: {
                            borderColor: muiTheme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.1)'
                                : '#E0E0E0', // Match price predictor exact
                        } }), _jsx(List, { sx: { pt: 2 }, children: menuItems.map((item) => (_jsx(ListItem, { disablePadding: true, sx: { px: 1 }, children: _jsxs(ListItemButton, { selected: location.pathname === item.path, onClick: () => navigate(item.path), sx: {
                                    borderRadius: '8px',
                                    mb: 0.5,
                                }, children: [_jsx(ListItemIcon, { sx: {
                                            color: location.pathname === item.path
                                                ? mode === 'dark' ? '#F5D300' : '#d4af37'
                                                : 'inherit',
                                        }, children: item.icon }), _jsx(ListItemText, { primary: item.text, primaryTypographyProps: {
                                            fontWeight: location.pathname === item.path ? 600 : 400,
                                            color: location.pathname === item.path
                                                ? mode === 'dark' ? '#F5D300' : '#d4af37'
                                                : (mode === 'dark' ? '#FFFFFF' : '#111827'), // Match price predictor exact
                                        } })] }) }, item.text))) })] }), _jsxs(Box, { component: "main", sx: {
                    flexGrow: 1,
                    bgcolor: 'background.default',
                    p: 3,
                    minHeight: '100vh',
                }, children: [_jsx(Toolbar, {}), _jsx(Container, { maxWidth: "xl", children: children })] })] }));
};
export default Layout;

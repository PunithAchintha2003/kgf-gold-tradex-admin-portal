import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import TransactionsPage from './pages/TransactionsPage';
import WithdrawalsPage from './pages/WithdrawalsPage';
import Layout from './components/Layout';
import { authService } from './services/authService';
const ProtectedRoute = ({ children }) => {
    if (!authService.isAuthenticated() || !authService.isSuperAdmin()) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
const App = () => {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: authService.isAuthenticated() && authService.isSuperAdmin() ? (_jsx(Navigate, { to: "/dashboard", replace: true })) : (_jsx(LoginPage, {})) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(DashboardPage, {}) }) }) }), _jsx(Route, { path: "/users", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(UsersPage, {}) }) }) }), _jsx(Route, { path: "/transactions", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(TransactionsPage, {}) }) }) }), _jsx(Route, { path: "/withdrawals", element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(WithdrawalsPage, {}) }) }) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard", replace: true }) })] }));
};
export default App;

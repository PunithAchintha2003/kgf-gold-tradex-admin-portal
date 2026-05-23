import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import MerchantsPage from './pages/MerchantsPage';
import TransactionsPage from './pages/TransactionsPage';
import WithdrawalsPage from './pages/WithdrawalsPage';
import MerchantDashboardPage from './pages/merchant/MerchantDashboardPage';
import MerchantProductsPage from './pages/merchant/MerchantProductsPage';
import MerchantOrdersPage from './pages/merchant/MerchantOrdersPage';
import MerchantAuctionsPage from './pages/merchant/MerchantAuctionsPage';
import MerchantAuctionManagementPage from './pages/merchant/MerchantAuctionManagementPage';
import Layout from './components/Layout';
import { authService } from './services/authService';

const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!authService.isAuthenticated() || !authService.isSuperAdmin()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const MerchantProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!authService.isAuthenticated() || !authService.isMerchant()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const RoleHomeRedirect: React.FC = () => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (authService.isSuperAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }
  if (authService.isMerchant()) {
    return <Navigate to="/merchant" replace />;
  }
  authService.clearSession();
  return <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          authService.isAuthenticated() && authService.isSuperAdmin() ? (
            <Navigate to="/dashboard" replace />
          ) : authService.isAuthenticated() && authService.isMerchant() ? (
            <Navigate to="/merchant" replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route path="/users/merchants" element={<Navigate to="/merchants" replace />} />
      <Route
        path="/dashboard"
        element={
          <AdminProtectedRoute>
            <Layout variant="admin">
              <DashboardPage />
            </Layout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <AdminProtectedRoute>
            <Layout variant="admin">
              <UsersPage />
            </Layout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/merchants"
        element={
          <AdminProtectedRoute>
            <Layout variant="admin">
              <MerchantsPage />
            </Layout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <AdminProtectedRoute>
            <Layout variant="admin">
              <TransactionsPage />
            </Layout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/withdrawals"
        element={
          <AdminProtectedRoute>
            <Layout variant="admin">
              <WithdrawalsPage />
            </Layout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/merchant"
        element={
          <MerchantProtectedRoute>
            <Layout variant="merchant">
              <MerchantDashboardPage />
            </Layout>
          </MerchantProtectedRoute>
        }
      />
      <Route
        path="/merchant/products"
        element={
          <MerchantProtectedRoute>
            <Layout variant="merchant">
              <MerchantProductsPage />
            </Layout>
          </MerchantProtectedRoute>
        }
      />
      <Route
        path="/merchant/orders"
        element={
          <MerchantProtectedRoute>
            <Layout variant="merchant">
              <MerchantOrdersPage />
            </Layout>
          </MerchantProtectedRoute>
        }
      />
      <Route
        path="/merchant/auctions"
        element={
          <MerchantProtectedRoute>
            <Layout variant="merchant">
              <MerchantAuctionsPage />
            </Layout>
          </MerchantProtectedRoute>
        }
      />
      <Route
        path="/merchant/auctions/management"
        element={
          <MerchantProtectedRoute>
            <Layout variant="merchant">
              <MerchantAuctionManagementPage />
            </Layout>
          </MerchantProtectedRoute>
        }
      />
      <Route path="/" element={<RoleHomeRedirect />} />
      <Route path="*" element={<RoleHomeRedirect />} />
    </Routes>
  );
};

export default App;

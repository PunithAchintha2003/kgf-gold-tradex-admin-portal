import api from './api';
import { ApiRequestError, throwApiError } from '../utils/apiError';

export { ApiRequestError };

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    resetSessionToken: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: 'SUPER_ADMIN' | 'USER' | 'MERCHANT';
  merchantVerified?: boolean;
  isActive?: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user?: User;
    accessToken?: string;
    refreshToken?: string;
    requiresLoginOtp?: boolean;
    requiresEmailVerification?: boolean;
    email?: string;
    loginSessionToken?: string;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      const payload = response.data?.data ?? {};
      if (response.data?.success && payload.accessToken && payload.user) {
        localStorage.setItem('accessToken', payload.accessToken);
        if (payload.refreshToken) {
          localStorage.setItem('refreshToken', payload.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(payload.user));
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  logout: async (): Promise<void> => {
    // Clear client session immediately so navigation to login is never blocked by the network.
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  clearSession: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      if (userStr) {
        localStorage.removeItem('user');
      }
      return null;
    }
    try {
      const parsed = JSON.parse(userStr) as User | null;
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
      console.warn('Failed to parse stored user, clearing localStorage:', error);
      localStorage.removeItem('user');
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('accessToken');
    return !!token && token !== 'undefined' && token !== 'null';
  },

  isSuperAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === 'SUPER_ADMIN';
  },

  isMerchant: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === 'MERCHANT';
  },

  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    try {
      const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  verifyForgotPasswordCode: async (data: {
    email: string;
    code: string;
    resetSessionToken: string;
  }): Promise<ForgotPasswordResponse> => {
    try {
      const response = await api.post<ForgotPasswordResponse>('/auth/verify-forgot-password', data);
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  resendForgotPasswordCode: async (data: {
    email: string;
    resetSessionToken: string;
  }): Promise<ForgotPasswordResponse> => {
    try {
      const response = await api.post<ForgotPasswordResponse>('/auth/resend-forgot-password', data);
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  resetForgottenPassword: async (data: {
    email: string;
    newPassword: string;
    resetSessionToken: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        '/auth/reset-forgotten-password',
        data
      );
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },
};


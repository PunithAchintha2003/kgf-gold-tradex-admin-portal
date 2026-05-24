import api from './api';
import { throwApiError } from '../utils/apiError';
import type { User } from './authService';

export interface UserResponse {
  success: boolean;
  message?: string;
  data: {
    user: User & {
      isActive?: boolean;
      emailVerified?: boolean;
      lastLogin?: string;
      updatedAt?: string;
    };
  };
}

export interface CredentialOtpResponse {
  success: boolean;
  message: string;
  data?: { email: string };
}

export const userService = {
  getProfile: async (): Promise<UserResponse> => {
    try {
      const response = await api.get<UserResponse>('/users/profile');
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  getMe: async (): Promise<UserResponse> => {
    try {
      const response = await api.get<UserResponse>('/auth/me');
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  updateProfile: async (data: {
    name?: string;
    phone?: string;
    address?: string;
  }): Promise<UserResponse> => {
    try {
      const response = await api.put<UserResponse>('/users/profile', data);
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  requestEmailChange: async (newEmail: string): Promise<CredentialOtpResponse> => {
    try {
      const response = await api.post<CredentialOtpResponse>('/users/request-email-change', {
        newEmail,
      });
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  confirmEmailChange: async (code: string): Promise<UserResponse> => {
    try {
      const response = await api.post<UserResponse>('/users/confirm-email-change', { code });
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  requestPasswordChange: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<CredentialOtpResponse> => {
    try {
      const response = await api.post<CredentialOtpResponse>('/users/request-password-change', data);
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  confirmPasswordChange: async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ success: boolean; message: string }>(
        '/users/confirm-password-change',
        { code }
      );
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },

  resendCredentialOtp: async (): Promise<CredentialOtpResponse> => {
    try {
      const response = await api.post<CredentialOtpResponse>('/users/resend-credential-otp', {});
      return response.data;
    } catch (error) {
      throwApiError(error);
    }
  },
};

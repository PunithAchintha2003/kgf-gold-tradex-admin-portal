import api from './api';
import { User } from './authService';

// Re-export User type for convenience
export type { User };

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  superAdmins: number;
  regularUsers: number;
  merchants: number;
  verifiedMerchants: number;
  recentUsers: number;
  todayLoginUsers: number;
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface UserResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export interface DashboardStatsResponse {
  success: boolean;
  data: {
    stats: DashboardStats;
  };
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  role: 'SUPER_ADMIN' | 'USER' | 'MERCHANT';
  merchantVerified?: boolean;
  isActive?: boolean;
}

export const adminService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStatsResponse>('/admin/dashboard/stats');
    return response.data.data.stats;
  },

  getAllUsers: async (
    page: number = 1,
    limit: number = 10,
    search: string = '',
    role?: 'SUPER_ADMIN' | 'USER' | 'MERCHANT'
  ): Promise<UsersResponse['data']> => {
    const response = await api.get<UsersResponse>('/admin/users', {
      params: { page, limit, search, ...(role ? { role } : {}) },
    });
    return response.data.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<UserResponse>(`/admin/users/${id}`);
    return response.data.data.user;
  },

  createUser: async (payload: CreateUserPayload): Promise<User> => {
    const response = await api.post<UserResponse>('/admin/users', payload);
    return response.data.data.user;
  },

  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.put<UserResponse>(`/admin/users/${id}`, data);
    return response.data.data.user;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },
};


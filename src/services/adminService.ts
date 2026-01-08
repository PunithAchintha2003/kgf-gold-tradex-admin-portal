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

export const adminService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStatsResponse>('/admin/dashboard/stats');
    return response.data.data.stats;
  },

  getAllUsers: async (page: number = 1, limit: number = 10, search: string = ''): Promise<UsersResponse['data']> => {
    const response = await api.get<UsersResponse>('/admin/users', {
      params: { page, limit, search },
    });
    return response.data.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<UserResponse>(`/admin/users/${id}`);
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


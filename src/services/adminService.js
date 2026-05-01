import api from './api';
export const adminService = {
    getDashboardStats: async () => {
        const response = await api.get('/admin/dashboard/stats');
        return response.data.data.stats;
    },
    getAllUsers: async (page = 1, limit = 10, search = '') => {
        const response = await api.get('/admin/users', {
            params: { page, limit, search },
        });
        return response.data.data;
    },
    getUserById: async (id) => {
        const response = await api.get(`/admin/users/${id}`);
        return response.data.data.user;
    },
    updateUser: async (id, data) => {
        const response = await api.put(`/admin/users/${id}`, data);
        return response.data.data.user;
    },
    deleteUser: async (id) => {
        await api.delete(`/admin/users/${id}`);
    },
};

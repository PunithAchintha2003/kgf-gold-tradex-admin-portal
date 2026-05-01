import api from './api';
export const authService = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.success) {
            localStorage.setItem('accessToken', response.data.data.accessToken);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },
    logout: async () => {
        try {
            await api.post('/auth/logout');
        }
        catch (error) {
            console.error('Logout error:', error);
        }
        finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    },
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },
    isAuthenticated: () => {
        return !!localStorage.getItem('accessToken');
    },
    isSuperAdmin: () => {
        const user = authService.getCurrentUser();
        return user?.role === 'SUPER_ADMIN';
    },
};

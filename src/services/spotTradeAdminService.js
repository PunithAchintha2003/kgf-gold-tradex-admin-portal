import axios from 'axios';
const SPOT_API_BASE_URL = import.meta.env.VITE_SPOT_API_URL || 'http://localhost:8001/api/v1';
const spotApi = axios.create({
    baseURL: SPOT_API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});
spotApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
export const spotTradeAdminService = {
    async getWalletTransactions(limit = 200, offset = 0, status_filter, transaction_type) {
        const response = await spotApi.get('/spot-trade/admin/wallet-transactions', {
            params: { limit, offset, status_filter, transaction_type },
        });
        return response.data;
    },
    async getSpotTrades(limit = 200, offset = 0) {
        const response = await spotApi.get('/spot-trade/admin/spot-trades', { params: { limit, offset } });
        return response.data;
    },
    async decideWithdrawal(transactionId, approve, notes) {
        const response = await spotApi.post(`/spot-trade/admin/withdrawals/${transactionId}/decision`, { approve, notes });
        return response.data;
    },
};

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

spotApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface WalletTransaction {
  id: number;
  user_id: string;
  transaction_type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'APPROVED' | 'REJECTED' | 'FAILED';
  payment_method?: string;
  stripe_session_id?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SpotTrade {
  id: number;
  user_id: string;
  order_type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total_value: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export const spotTradeAdminService = {
  async getWalletTransactions(limit = 200, offset = 0, status_filter?: string, transaction_type?: string) {
    const response = await spotApi.get('/spot-trade/admin/wallet-transactions', {
      params: { limit, offset, status_filter, transaction_type },
    });
    return response.data as { transactions: WalletTransaction[]; total: number; limit: number; offset: number };
  },
  async getSpotTrades(limit = 200, offset = 0) {
    const response = await spotApi.get('/spot-trade/admin/spot-trades', { params: { limit, offset } });
    return response.data as { trades: SpotTrade[]; total: number; limit: number; offset: number };
  },
  async decideWithdrawal(transactionId: number, approve: boolean, notes?: string) {
    const response = await spotApi.post(`/spot-trade/admin/withdrawals/${transactionId}/decision`, { approve, notes });
    return response.data as WalletTransaction;
  },
};

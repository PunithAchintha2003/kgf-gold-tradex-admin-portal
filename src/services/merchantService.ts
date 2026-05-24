import api, { API_BASE_URL } from './api';

export interface MerchantIncomeBreakdown {
  total: number;
  today: number;
  thisMonth: number;
}

export interface MerchantShopIncome extends MerchantIncomeBreakdown {
  orderCount: number;
  ordersToday: number;
  ordersThisMonth: number;
  lastAt: string | null;
}

export interface MerchantAuctionIncome extends MerchantIncomeBreakdown {
  wonCount: number;
  wonToday: number;
  wonThisMonth: number;
  lastAt: string | null;
}

export interface MerchantDashboardStats {
  merchantVerified: boolean;
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  inventoryUnits: number;
  /** Combined shop + auction income */
  totalIncomeLkr: number;
  incomeTodayLkr: number;
  incomeThisMonthLkr: number;
  totalOrderCount: number;
  ordersToday: number;
  ordersThisMonth: number;
  lastOrderAt: string | null;
  shopIncome?: MerchantShopIncome;
  auctionIncome?: MerchantAuctionIncome;
  lastActivityAt?: string | null;
}

export interface MerchantProduct {
  _id: string;
  merchant: string;
  title: string;
  description?: string;
  sku?: string;
  price: number;
  currency: string;
  category: string;
  stock: number;
  imageUrl?: string;
  /** HTTPS image URLs (e.g. Cloudinary); first entry is the primary listing image */
  images?: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsListResponse {
  success: boolean;
  data: {
    products: MerchantProduct[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export type DeliveryStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface MerchantOrderLine {
  orderId: string;
  lineItemId: string;
  stripeSessionId: string;
  productId: string | null;
  /** Thumbnail: checkout snapshot, else live product listing image when available */
  imageUrl: string | null;
  name: string;
  unitPriceLkr: number;
  quantity: number;
  deliveryStatus: DeliveryStatus;
  buyer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  } | null;
  createdAt: string;
  orderTotalLkr: number;
}

export const merchantService = {
  getDashboardStats: async (): Promise<MerchantDashboardStats> => {
    const res = await api.get<{ success: boolean; data: { stats: MerchantDashboardStats } }>(
      '/merchant/dashboard/stats'
    );
    return res.data.data.stats;
  },

  getProducts: async (page = 1, limit = 10, search = ''): Promise<ProductsListResponse['data']> => {
    const res = await api.get<ProductsListResponse>('/merchant/products', {
      params: { page, limit, search },
    });
    return res.data.data;
  },

  /** Upload one or more image files to Cloudinary; returns secure URLs. Uses fetch so multipart boundaries are correct. */
  uploadProductImages: async (files: File[], productId?: string): Promise<string[]> => {
    const fd = new FormData();
    files.forEach((f) => fd.append('images', f));
    const qs = productId ? `?productId=${encodeURIComponent(productId)}` : '';
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${API_BASE_URL}/merchant/products/images${qs}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    const json = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      data?: { urls?: string[] };
      error?: string;
      message?: string;
    };
    if (res.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired');
    }
    if (!res.ok) {
      throw new Error(json.error || json.message || `Upload failed (${res.status})`);
    }
    if (!json.success || !Array.isArray(json.data?.urls)) {
      throw new Error(json.error || json.message || 'Invalid upload response');
    }
    return json.data.urls;
  },

  createProduct: async (payload: Partial<MerchantProduct>): Promise<MerchantProduct> => {
    const res = await api.post<{ success: boolean; data: { product: MerchantProduct } }>(
      '/merchant/products',
      payload
    );
    return res.data.data.product;
  },

  updateProduct: async (
    id: string,
    payload: Partial<MerchantProduct>
  ): Promise<MerchantProduct> => {
    const res = await api.put<{ success: boolean; data: { product: MerchantProduct } }>(
      `/merchant/products/${id}`,
      payload
    );
    return res.data.data.product;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/merchant/products/${id}`);
  },

  getMerchantOrders: async (): Promise<MerchantOrderLine[]> => {
    const res = await api.get<{ success: boolean; data: { lines: MerchantOrderLine[] } }>(
      '/merchant/orders'
    );
    return res.data.data.lines;
  },

  updateOrderLineDelivery: async (
    orderId: string,
    lineItemId: string,
    deliveryStatus: DeliveryStatus
  ): Promise<void> => {
    await api.patch(`/merchant/orders/${orderId}/line-items/${lineItemId}`, {
      deliveryStatus,
    });
  },
};

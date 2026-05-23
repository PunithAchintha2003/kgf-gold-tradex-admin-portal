import api, { API_BASE_URL } from './api';

export type AuctionStatus = 'scheduled' | 'active' | 'ended' | 'cancelled';

export interface MerchantAuction {
  id: string;
  title: string;
  description?: string;
  images?: string[];
  category: string;
  purity: string;
  weight: string;
  condition: string;
  startingBid: number;
  currentBid: number;
  nextMinimum: number;
  minIncrement: number;
  startsAt: string;
  endsAt: string;
  timeLeftMs: number;
  bidCount: number;
  watcherCount: number;
  status: AuctionStatus;
  seller?: string;
  merchantId?: string;
  isEnding?: boolean;
  winner?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  } | null;
  winnerId?: string | null;
}

export interface AuctionBidRow {
  id: string;
  amount: number;
  placedAt: string;
  bidder: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  } | null;
}

export interface ChatConversation {
  id: string;
  kind: string;
  auctionId: string | null;
  auctionTitle: string | null;
  otherPartyName: string;
  otherPartyId: string | null;
  lastMessageAt: string;
  lastMessagePreview: string;
  unread: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  isOwn: boolean;
}

export const auctionService = {
  getAuctions: async (
    page = 1,
    limit = 10,
    search = '',
    status?: AuctionStatus
  ): Promise<{ auctions: MerchantAuction[]; pagination: { total: number } }> => {
    const params: Record<string, string | number> = {
      page,
      limit: Math.min(Math.max(1, limit), 100),
    };
    const q = search.trim();
    if (q) params.search = q;
    if (status) params.status = status;

    const res = await api.get<{
      success: boolean;
      data: { auctions: MerchantAuction[]; pagination: { total: number } };
    }>('/merchant/auctions', { params });
    return res.data.data;
  },

  createAuction: async (payload: Record<string, unknown>): Promise<unknown> => {
    const res = await api.post('/merchant/auctions', payload);
    return res.data.data;
  },

  updateAuction: async (id: string, payload: Record<string, unknown>): Promise<unknown> => {
    const res = await api.put(`/merchant/auctions/${id}`, payload);
    return res.data.data;
  },

  deleteAuction: async (id: string): Promise<void> => {
    await api.delete(`/merchant/auctions/${id}`);
  },

  cancelAuction: async (id: string): Promise<void> => {
    await api.patch(`/merchant/auctions/${id}/cancel`);
  },

  uploadImages: async (files: File[]): Promise<string[]> => {
    const fd = new FormData();
    files.forEach((f) => fd.append('images', f));
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${API_BASE_URL}/merchant/auctions/images`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Upload failed');
    return json.data.urls;
  },

  getBidders: async (
    auctionId: string
  ): Promise<{ bids: AuctionBidRow[]; bidders: unknown[]; winnerId: string | null }> => {
    const res = await api.get<{
      success: boolean;
      data: { bids: AuctionBidRow[]; bidders: unknown[]; winnerId: string | null };
    }>(`/merchant/auctions/${auctionId}/bidders`);
    return res.data.data;
  },

  getWinnerConversationId: async (auctionId: string): Promise<string> => {
    const res = await api.get<{
      success: boolean;
      data: { conversationId: string };
    }>(`/merchant/auctions/${auctionId}/winner-conversation`);
    return res.data.data.conversationId;
  },

  listConversations: async (): Promise<ChatConversation[]> => {
    const res = await api.get<{ success: boolean; data: { conversations: ChatConversation[] } }>(
      '/chat/conversations'
    );
    return res.data.data.conversations;
  },

  getMessages: async (conversationId: string, limit = 50): Promise<ChatMessage[]> => {
    const res = await api.get<{ success: boolean; data: { messages: ChatMessage[] } }>(
      `/chat/conversations/${conversationId}/messages`,
      { params: { limit } }
    );
    return res.data.data.messages;
  },

  sendMessage: async (conversationId: string, text: string): Promise<ChatMessage> => {
    const res = await api.post<{ success: boolean; data: { message: ChatMessage } }>(
      `/chat/conversations/${conversationId}/messages`,
      { text }
    );
    return res.data.data.message;
  },

  markRead: async (conversationId: string): Promise<void> => {
    await api.patch(`/chat/conversations/${conversationId}/read`);
  },
};

import api from './api';

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

export type ChatMessageStatus = 'pending' | 'sent' | 'failed';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  isOwn: boolean;
  readBy?: string[];
  isRead?: boolean;
  status?: ChatMessageStatus;
}

export interface MessagesPage {
  messages: ChatMessage[];
  hasMore: boolean;
}

export const chatService = {
  listConversations: async (): Promise<ChatConversation[]> => {
    const res = await api.get<{ success: boolean; data: { conversations: ChatConversation[] } }>(
      '/chat/conversations'
    );
    return res.data.data.conversations;
  },

  getMessages: async (
    conversationId: string,
    options: { limit?: number; before?: string } = {}
  ): Promise<MessagesPage> => {
    const { limit = 50, before } = options;
    const res = await api.get<{
      success: boolean;
      data: { messages: ChatMessage[]; hasMore?: boolean };
    }>(`/chat/conversations/${conversationId}/messages`, {
      params: { limit, ...(before ? { before } : {}) },
    });
    return {
      messages: res.data.data.messages,
      hasMore: res.data.data.hasMore ?? false,
    };
  },

  sendMessage: async (conversationId: string, text: string): Promise<ChatMessage> => {
    const res = await api.post<{ success: boolean; data: { message: ChatMessage } }>(
      `/chat/conversations/${conversationId}/messages`,
      { text }
    );
    return { ...res.data.data.message, status: 'sent' };
  },

  markRead: async (conversationId: string): Promise<void> => {
    await api.patch(`/chat/conversations/${conversationId}/read`);
  },

  getWinnerConversationId: async (auctionId: string): Promise<string> => {
    const res = await api.get<{
      success: boolean;
      data: { conversationId: string };
    }>(`/merchant/auctions/${auctionId}/winner-conversation`);
    return res.data.data.conversationId;
  },
};

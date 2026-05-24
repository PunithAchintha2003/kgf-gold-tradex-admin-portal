import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { authService } from '../services/authService';
import {
  chatService,
  type ChatConversation,
  type ChatMessage,
} from '../services/chatService';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import { useToast } from './ToastContext';

interface MerchantChatContextType {
  isOpen: boolean;
  openChat: (conversationId?: string) => void;
  openChatByAuctionId: (auctionId: string) => Promise<void>;
  closeChat: () => void;
  conversations: ChatConversation[];
  unreadTotal: number;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  activeConversation: ChatConversation | null;
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  sending: boolean;
  typingUser: string | null;
  emitTyping: (draft: string) => void;
}

const MerchantChatContext = createContext<MerchantChatContextType | null>(null);

const MESSAGE_PAGE_SIZE = 50;

export const MerchantChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showInfo } = useToast();
  const user = (() => {
    try {
      return authService.getCurrentUser();
    } catch (error) {
      console.warn('MerchantChatProvider: failed to read current user', error);
      return null;
    }
  })();
  const isMerchant =
    !!user && authService.isAuthenticated() && authService.isMerchant();

  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const typingClearRef = useRef<ReturnType<typeof setTimeout>>();
  const typingEmitRef = useRef<ReturnType<typeof setTimeout>>();

  const unreadTotal = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unread || 0), 0),
    [conversations]
  );

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? null,
    [conversations, activeConversationId]
  );

  const refreshConversations = useCallback(async () => {
    if (!isMerchant) {
      setConversations([]);
      return;
    }
    try {
      const list = await chatService.listConversations();
      setConversations(list);
    } catch {
      /* ignore */
    }
  }, [isMerchant]);

  const loadMessages = useCallback(async (conversationId: string) => {
    setLoading(true);
    try {
      const page = await chatService.getMessages(conversationId, { limit: MESSAGE_PAGE_SIZE });
      setMessages(page.messages);
      setHasMore(page.hasMore);
      await chatService.markRead(conversationId);
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c))
      );
      getSocket()?.emit('chat:join', { conversationId });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (!activeConversationId || loadingMore || !hasMore || messages.length === 0) return;
    setLoadingMore(true);
    try {
      const oldest = messages[0]?.createdAt;
      const page = await chatService.getMessages(activeConversationId, {
        limit: MESSAGE_PAGE_SIZE,
        ...(oldest ? { before: oldest } : {}),
      });
      setMessages((prev) => [...page.messages, ...prev]);
      setHasMore(page.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }, [activeConversationId, hasMore, loadingMore, messages]);

  const openChat = useCallback(
    (conversationId?: string) => {
      setIsOpen(true);
      void refreshConversations();
      if (conversationId) {
        setActiveConversationId(conversationId);
      }
    },
    [refreshConversations]
  );

  const openChatByAuctionId = useCallback(
    async (auctionId: string) => {
      setIsOpen(true);
      try {
        const conversationId = await chatService.getWinnerConversationId(auctionId);
        setActiveConversationId(conversationId);
        void refreshConversations();
      } catch {
        showInfo('Could not open chat for this auction');
      }
    },
    [refreshConversations, showInfo]
  );

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setActiveConversationId(null);
    setMessages([]);
    setHasMore(false);
    setTypingUser(null);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeConversationId || !text.trim()) return;
      const trimmed = text.trim();
      const tempId = `temp-${Date.now()}`;
      const optimistic: ChatMessage = {
        id: tempId,
        conversationId: activeConversationId,
        senderId: user?.id || '',
        senderName: user?.name || 'You',
        text: trimmed,
        createdAt: new Date().toISOString(),
        isOwn: true,
        status: 'pending',
        isRead: false,
      };

      setMessages((prev) => [...prev, optimistic]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, lastMessagePreview: trimmed, lastMessageAt: optimistic.createdAt }
            : c
        )
      );
      setSending(true);

      try {
        const msg = await chatService.sendMessage(activeConversationId, trimmed);
        setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...msg, status: 'sent' } : m)));
      } catch {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m))
        );
      } finally {
        setSending(false);
      }
    },
    [activeConversationId, user?.id, user?.name]
  );

  const emitTyping = useCallback(
    (draft: string) => {
      if (!activeConversationId || !draft.trim()) return;
      clearTimeout(typingEmitRef.current);
      typingEmitRef.current = setTimeout(() => {
        getSocket()?.emit('chat:typing', { conversationId: activeConversationId });
      }, 300);
    },
    [activeConversationId]
  );

  useEffect(() => {
    if (!isMerchant) {
      disconnectSocket();
      setConversations([]);
      return;
    }

    const socket = connectSocket();
    void refreshConversations();

    const onMessage = (msg: ChatMessage & { senderId?: string }) => {
      const isOwn = String(msg.senderId) === String(user?.id || '');
      const normalized: ChatMessage = { ...msg, isOwn, status: 'sent' };

      if (activeConversationId === msg.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          const withoutPending = isOwn
            ? prev.filter((m) => !(m.status === 'pending' && m.text === msg.text))
            : prev;
          return [...withoutPending, normalized];
        });
        void chatService.markRead(msg.conversationId);
        setTypingUser(null);
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === msg.conversationId
              ? {
                  ...c,
                  unread: (c.unread || 0) + 1,
                  lastMessagePreview: msg.text,
                  lastMessageAt: msg.createdAt,
                }
              : c
          )
        );
        if (!isOpen) {
          /* Toast handled by NotificationProvider via socket `notification` event */
        }
      }
    };

    const onConversationCreated = (payload: { conversation: ChatConversation }) => {
      const conv = { ...payload.conversation, unread: payload.conversation.unread ?? 0 };
      setConversations((prev) => {
        if (prev.some((c) => c.id === conv.id)) return prev;
        return [conv, ...prev];
      });
    };

    const onTyping = (payload: { conversationId: string; userId: string; userName: string }) => {
      if (payload.conversationId !== activeConversationId) return;
      if (String(payload.userId) === String(user?.id)) return;
      setTypingUser(payload.userName);
      clearTimeout(typingClearRef.current);
      typingClearRef.current = setTimeout(() => setTypingUser(null), 3000);
    };

    const onRead = (payload: { conversationId: string; userId: string }) => {
      if (payload.conversationId !== activeConversationId) return;
      if (String(payload.userId) === String(user?.id)) return;
      setMessages((prev) =>
        prev.map((m) => (m.isOwn ? { ...m, isRead: true, readBy: [...(m.readBy || []), payload.userId] } : m))
      );
    };

    socket.on('chat:message', onMessage);
    socket.on('conversation:created', onConversationCreated);
    socket.on('chat:typing', onTyping);
    socket.on('chat:read', onRead);

    return () => {
      socket.off('chat:message', onMessage);
      socket.off('conversation:created', onConversationCreated);
      socket.off('chat:typing', onTyping);
      socket.off('chat:read', onRead);
    };
  }, [
    isMerchant,
    activeConversationId,
    isOpen,
    refreshConversations,
    user?.id,
  ]);

  useEffect(() => {
    if (activeConversationId && isOpen) {
      void loadMessages(activeConversationId);
    }
  }, [activeConversationId, isOpen, loadMessages]);

  const value: MerchantChatContextType = {
    isOpen,
    openChat,
    openChatByAuctionId,
    closeChat,
    conversations,
    unreadTotal,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    messages,
    sendMessage,
    refreshConversations,
    loadMoreMessages,
    loading,
    loadingMore,
    hasMore,
    sending,
    typingUser,
    emitTyping,
  };

  return <MerchantChatContext.Provider value={value}>{children}</MerchantChatContext.Provider>;
};

export function useMerchantChat(): MerchantChatContextType {
  const ctx = useContext(MerchantChatContext);
  if (!ctx) throw new Error('useMerchantChat must be used within MerchantChatProvider');
  return ctx;
}

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { connectSocket, disconnectSocket } from '../services/socket';
import { spotTradeAdminService } from '../services/spotTradeAdminService';
import { useToast } from './ToastContext';
import { AppNotification, isAppNotification } from '../types/notification';

const MAX_NOTIFICATIONS = 100;
const STORAGE_PREFIX = 'kgf-admin-notifications';

const WITHDRAWAL_POLL_MS = 30_000;

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  pendingWithdrawalCount: number;
  refreshPendingWithdrawals: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function loadStored(userId: string): AppNotification[] {
  try {
    const raw = sessionStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isAppNotification).slice(0, MAX_NOTIFICATIONS);
  } catch {
    return [];
  }
}

function saveStored(userId: string, items: AppNotification[]) {
  try {
    sessionStorage.setItem(storageKey(userId), JSON.stringify(items.slice(0, MAX_NOTIFICATIONS)));
  } catch {
    /* ignore */
  }
}

function normalizeIncoming(payload: unknown): AppNotification | null {
  if (!isAppNotification(payload)) return null;
  return {
    ...payload,
    read: false,
    severity: payload.severity || 'info',
  };
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const user = authService.getCurrentUser();
  const userId = user?.id;
  const isAuthenticated = authService.isAuthenticated() && !!userId;
  const isSuperAdmin = authService.isSuperAdmin();

  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    userId ? loadStored(userId) : []
  );
  const [pendingWithdrawalCount, setPendingWithdrawalCount] = useState(0);
  const seenIdsRef = useRef<Set<string>>(new Set(notifications.map((n) => n.id)));
  const withdrawalBaselineRef = useRef<number | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const showNotificationToast = useCallback(
    (notification: AppNotification) => {
      const opts = {
        description: notification.message,
        duration: 6000,
      };
      switch (notification.severity) {
        case 'success':
          showSuccess(notification.title, opts);
          break;
        case 'error':
          showError(notification.title, opts);
          break;
        case 'warning':
          showWarning(notification.title, opts);
          break;
        default:
          showInfo(notification.title, opts);
      }
    },
    [showSuccess, showError, showWarning, showInfo]
  );

  const pushNotification = useCallback(
    (incoming: AppNotification, options?: { silent?: boolean }) => {
      if (seenIdsRef.current.has(incoming.id)) return;
      seenIdsRef.current.add(incoming.id);

      setNotifications((prev) => {
        const next = [{ ...incoming, read: false }, ...prev].slice(0, MAX_NOTIFICATIONS);
        if (userId) saveStored(userId, next);
        return next;
      });

      if (!options?.silent) {
        showNotificationToast(incoming);
      }
    },
    [showNotificationToast, userId]
  );

  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
        if (userId) saveStored(userId, next);
        return next;
      });
    },
    [userId]
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      if (userId) saveStored(userId, next);
      return next;
    });
  }, [userId]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    seenIdsRef.current.clear();
    if (userId) sessionStorage.removeItem(storageKey(userId));
  }, [userId]);

  const refreshPendingWithdrawals = useCallback(async () => {
    if (!isSuperAdmin || !isAuthenticated) {
      setPendingWithdrawalCount(0);
      withdrawalBaselineRef.current = null;
      return;
    }

    try {
      const res = await spotTradeAdminService.getWalletTransactions(200, 0, 'PENDING', 'WITHDRAWAL');
      const count = res.transactions.length;
      setPendingWithdrawalCount(count);

      if (withdrawalBaselineRef.current === null) {
        withdrawalBaselineRef.current = count;
        return;
      }

      if (count > withdrawalBaselineRef.current) {
        const diff = count - withdrawalBaselineRef.current;
        pushNotification({
          id: `withdrawal-pending-${Date.now()}`,
          type: 'withdrawal_pending',
          title: 'New withdrawal request',
          message: `${diff} pending withdrawal${diff > 1 ? 's' : ''} need review.`,
          severity: 'warning',
          createdAt: new Date().toISOString(),
          read: false,
          link: '/withdrawals',
        });
      }

      withdrawalBaselineRef.current = count;
    } catch {
      /* spot API may be offline — keep last known count */
    }
  }, [isSuperAdmin, isAuthenticated, pushNotification]);

  useEffect(() => {
    if (!userId) return;
    const stored = loadStored(userId);
    setNotifications(stored);
    seenIdsRef.current = new Set(stored.map((n) => n.id));
  }, [userId]);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket();

    const onNotification = (payload: unknown) => {
      const normalized = normalizeIncoming(payload);
      if (!normalized) return;
      pushNotification(normalized);
      if (
        isSuperAdmin &&
        (normalized.type === 'withdrawal_pending' || normalized.link === '/withdrawals')
      ) {
        void refreshPendingWithdrawals();
      }
    };

    socket.on('notification', onNotification);

    return () => {
      socket.off('notification', onNotification);
    };
  }, [isAuthenticated, isSuperAdmin, pushNotification, refreshPendingWithdrawals]);

  useEffect(() => {
    if (!isSuperAdmin || !isAuthenticated) {
      setPendingWithdrawalCount(0);
      withdrawalBaselineRef.current = null;
      return;
    }

    void refreshPendingWithdrawals();
    const interval = window.setInterval(() => void refreshPendingWithdrawals(), WITHDRAWAL_POLL_MS);
    return () => window.clearInterval(interval);
  }, [isSuperAdmin, isAuthenticated, refreshPendingWithdrawals]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    pendingWithdrawalCount,
    refreshPendingWithdrawals,
    markAsRead,
    markAllRead,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
};

export function useNotificationNavigation() {
  const navigate = useNavigate();
  const { markAsRead } = useNotifications();

  return useCallback(
    (notification: AppNotification) => {
      markAsRead(notification.id);
      if (notification.link) {
        navigate(notification.link);
      }
    },
    [markAsRead, navigate]
  );
}

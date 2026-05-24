export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  createdAt: string;
  read: boolean;
  link?: string;
  data?: Record<string, unknown>;
}

export function isAppNotification(value: unknown): value is AppNotification {
  if (!value || typeof value !== 'object') return false;
  const n = value as AppNotification;
  return (
    typeof n.id === 'string' &&
    typeof n.title === 'string' &&
    typeof n.message === 'string' &&
    typeof n.createdAt === 'string'
  );
}

import React, { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  Tooltip,
  Typography,
} from '@mui/material';
import { NotificationsNone, DoneAll, DeleteSweep } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications, useNotificationNavigation } from '../../contexts/NotificationContext';
import { AppNotification } from '../../types/notification';

function formatTime(iso: string) {
  try {
    const date = new Date(iso);
    const now = Date.now();
    const diffMs = now - date.getTime();
    if (diffMs < 60_000) return 'Just now';
    if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
    if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function severityColor(severity: AppNotification['severity'], isDark: boolean) {
  switch (severity) {
    case 'success':
      return isDark ? '#81c784' : '#2e7d32';
    case 'error':
      return isDark ? '#ef5350' : '#c62828';
    case 'warning':
      return isDark ? '#ffb74d' : '#ed6c02';
    default:
      return isDark ? '#64b5f6' : '#1565c0';
  }
}

export const NotificationBell: React.FC = () => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const { notifications, unreadCount, markAllRead, clearAll } = useNotifications();
  const openNotification = useNotificationNavigation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          sx={{
            color: isDark ? '#F5D300' : '#E6C200',
            mr: { xs: 0.5, sm: 1 },
          }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsNone />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              width: { xs: 320, sm: 380 },
              maxHeight: 480,
              borderRadius: '12px',
              background: isDark ? 'rgba(24, 24, 24, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              border: isDark
                ? '1px solid rgba(245, 211, 0, 0.15)'
                : '1px solid rgba(230, 194, 0, 0.2)',
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Notifications
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Mark all read">
              <span>
                <IconButton size="small" onClick={markAllRead} disabled={unreadCount === 0}>
                  <DoneAll fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Clear all">
              <span>
                <IconButton size="small" onClick={clearAll} disabled={notifications.length === 0}>
                  <DeleteSweep fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
              No notifications yet. Real-time alerts will appear here.
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding sx={{ maxHeight: 360, overflow: 'auto' }}>
            {notifications.map((notification) => (
              <ListItemButton
                key={notification.id}
                onClick={() => {
                  openNotification(notification);
                  setAnchorEl(null);
                }}
                sx={{
                  alignItems: 'flex-start',
                  py: 1.25,
                  px: 2,
                  background: notification.read
                    ? 'transparent'
                    : isDark
                      ? 'rgba(245, 211, 0, 0.06)'
                      : 'rgba(230, 194, 0, 0.08)',
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: notification.read ? 500 : 700,
                        color: severityColor(notification.severity, isDark),
                      }}
                    >
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" component="span" sx={{ display: 'block', mt: 0.25 }}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: isDark ? '#757575' : '#9e9e9e' }}>
                        {formatTime(notification.createdAt)}
                      </Typography>
                    </>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}

        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1.5, textAlign: 'center' }}>
              <Button
                size="small"
                onClick={() => {
                  markAllRead();
                  setAnchorEl(null);
                }}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Mark all as read
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

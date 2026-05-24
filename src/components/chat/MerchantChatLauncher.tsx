import React from 'react';
import { Badge, Fab, Tooltip, useTheme as useMUITheme } from '@mui/material';
import { Chat } from '@mui/icons-material';
import { useMerchantChat } from '../../contexts/MerchantChatContext';
import { authService } from '../../services/authService';

export const MerchantChatLauncher: React.FC = () => {
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const { openChat, unreadTotal, isOpen } = useMerchantChat();

  if (!authService.isMerchant() || isOpen) return null;

  const gold = isDark ? '#F5D300' : '#E6C200';

  return (
    <Tooltip title="Winner messages">
      <Badge
        badgeContent={unreadTotal > 0 ? (unreadTotal > 99 ? '99+' : unreadTotal) : 0}
        color="error"
        overlap="circular"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: (theme) => theme.zIndex.drawer + 2,
        }}
      >
        <Fab
          color="primary"
          aria-label="Open winner messages"
          onClick={() => openChat()}
          sx={{
            background: `linear-gradient(135deg, ${gold} 0%, ${isDark ? '#B8A000' : '#B8A000'} 100%)`,
            color: isDark ? '#000' : '#fff',
            boxShadow: isDark
              ? '0 8px 24px rgba(245, 211, 0, 0.35)'
              : '0 8px 24px rgba(230, 194, 0, 0.35)',
            '&:hover': {
              background: `linear-gradient(135deg, ${isDark ? '#FFE55C' : '#FFE033'} 0%, ${gold} 100%)`,
            },
          }}
        >
          <Chat />
        </Fab>
      </Badge>
    </Tooltip>
  );
};

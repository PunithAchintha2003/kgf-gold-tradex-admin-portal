import React, { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';
import { useTheme as useMUITheme } from '@mui/material/styles';
import RightSidebar from '../RightSidebar';
import { useMerchantChat } from '../../contexts/MerchantChatContext';
import type { ChatMessage } from '../../services/chatService';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function MessageBubble({
  message,
  isDark,
  gold,
  text,
  muted,
}: {
  message: ChatMessage;
  isDark: boolean;
  gold: string;
  text: string;
  muted: string;
}) {
  const isPending = message.status === 'pending';
  const isFailed = message.status === 'failed';

  return (
    <Box sx={{ display: 'flex', justifyContent: message.isOwn ? 'flex-end' : 'flex-start' }}>
      <Box
        sx={{
          maxWidth: '85%',
          px: 1.5,
          py: 1,
          borderRadius: 2,
          backgroundColor: message.isOwn ? gold : isDark ? '#2a2a2a' : '#f3f4f6',
          color: message.isOwn ? (isDark ? '#000' : '#fff') : text,
          opacity: isPending ? 0.7 : 1,
          border: isFailed ? '1px solid #ef4444' : 'none',
        }}
      >
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
          {message.text}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.65rem',
              color: message.isOwn ? (isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.75)') : muted,
            }}
          >
            {formatTime(message.createdAt)}
          </Typography>
          {message.isOwn && message.status === 'pending' && (
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: muted }}>
              Sending…
            </Typography>
          )}
          {message.isOwn && message.status === 'failed' && (
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#ef4444' }}>
              Failed
            </Typography>
          )}
          {message.isOwn && message.status !== 'pending' && message.status !== 'failed' && message.isRead && (
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: muted }}>
              Seen
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export const MerchantChatSidebar: React.FC = () => {
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isOpen,
    closeChat,
    conversations,
    unreadTotal,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    messages,
    sendMessage,
    loadMoreMessages,
    loading,
    loadingMore,
    hasMore,
    sending,
    typingUser,
    emitTyping,
  } = useMerchantChat();

  const [draft, setDraft] = useState('');

  const gold = isDark ? '#F5D300' : '#E6C200';
  const muted = isDark ? '#9ca3af' : '#6b7280';
  const text = isDark ? '#FFFFFF' : '#111827';
  const border = isDark ? 'rgba(255, 255, 255, 0.1)' : '#E0E0E0';

  const handleClose = () => {
    closeChat();
    setDraft('');
  };

  const handleSend = async () => {
    if (!draft.trim()) return;
    const value = draft.trim();
    setDraft('');
    await sendMessage(value);
  };

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, typingUser]);

  const sidebarTitle = activeConversation
    ? activeConversation.otherPartyName
    : `Messages${unreadTotal > 0 ? ` (${unreadTotal})` : ''}`;

  const footer =
    activeConversationId ? (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          size="small"
          placeholder="Type a message…"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            emitTyping(e.target.value);
          }}
          disabled={loading || sending}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
              '& fieldset': { borderColor: border },
              '& .MuiInputBase-input': { color: text },
            },
          }}
        />
        <IconButton
          onClick={() => void handleSend()}
          disabled={!draft.trim() || sending || loading}
          aria-label="Send message"
          sx={{
            flexShrink: 0,
            backgroundColor: gold,
            color: isDark ? '#000' : '#fff',
            '&:hover': { backgroundColor: isDark ? '#FFE55C' : '#B8A000' },
            '&.Mui-disabled': {
              backgroundColor: isDark ? '#3a3a3a' : '#e5e7eb',
              color: muted,
            },
          }}
        >
          <Send />
        </IconButton>
      </Box>
    ) : null;

  return (
    <RightSidebar open={isOpen} onClose={handleClose} title={sidebarTitle} width={420} footer={footer}>
      {activeConversationId && activeConversation ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
          <Button
            size="small"
            startIcon={<ArrowBack />}
            onClick={() => setActiveConversationId(null)}
            sx={{ alignSelf: 'flex-start', mb: 1, color: muted, textTransform: 'none' }}
          >
            All conversations
          </Button>
          {activeConversation.auctionTitle && (
            <Typography variant="body2" sx={{ color: muted, mb: 2, fontSize: '0.875rem' }}>
              {activeConversation.auctionTitle}
            </Typography>
          )}
          <Divider sx={{ borderColor: border, mb: 2 }} />

          {hasMore && (
            <Button
              size="small"
              onClick={() => void loadMoreMessages()}
              disabled={loadingMore}
              sx={{ mb: 2, textTransform: 'none', color: gold }}
            >
              {loadingMore ? 'Loading…' : 'Load earlier messages'}
            </Button>
          )}

          <Box sx={{ flex: 1, minHeight: 200 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} sx={{ color: gold }} />
              </Box>
            ) : messages.length === 0 ? (
              <Typography variant="body2" sx={{ color: muted, textAlign: 'center', py: 3 }}>
                No messages yet. Say hello to arrange payment and delivery.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {messages.map((m) => (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    isDark={isDark}
                    gold={gold}
                    text={text}
                    muted={muted}
                  />
                ))}
                <div ref={messagesEndRef} />
              </Box>
            )}
          </Box>

          {typingUser && (
            <Typography variant="caption" sx={{ color: muted, mt: 1, fontStyle: 'italic' }}>
              {typingUser} is typing…
            </Typography>
          )}
        </Box>
      ) : (
        <Box>
          <Typography variant="body2" sx={{ color: muted, mb: 2, lineHeight: 1.6 }}>
            Chat with auction winners about payment and delivery.
            {unreadTotal > 0 && (
              <Chip
                label={`${unreadTotal} unread`}
                size="small"
                color="error"
                sx={{ ml: 1, height: 22, fontSize: '0.7rem' }}
              />
            )}
          </Typography>
          {conversations.length === 0 ? (
            <Typography variant="body2" sx={{ color: muted, textAlign: 'center', py: 4 }}>
              No conversations yet. A chat opens automatically when an auction ends with a winner.
            </Typography>
          ) : (
            <List disablePadding>
              {conversations.map((c) => (
                <ListItemButton
                  key={c.id}
                  onClick={() => setActiveConversationId(c.id)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    border: `1px solid ${border}`,
                    '&:hover': { backgroundColor: isDark ? '#1f1f1f' : '#f9fafb' },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: gold, color: isDark ? '#000' : '#fff', width: 40, height: 40 }}>
                      {c.otherPartyName.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography component="span" variant="body2" sx={{ fontWeight: 600, color: text }}>
                          {c.otherPartyName}
                        </Typography>
                        {c.unread > 0 && (
                          <Chip label={c.unread} size="small" color="error" sx={{ height: 20 }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        {c.auctionTitle && (
                          <Typography component="span" variant="caption" sx={{ display: 'block', color: muted }}>
                            {c.auctionTitle}
                          </Typography>
                        )}
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{
                            display: 'block',
                            color: muted,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {c.lastMessagePreview || 'No messages yet'}
                        </Typography>
                      </>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      )}
    </RightSidebar>
  );
};

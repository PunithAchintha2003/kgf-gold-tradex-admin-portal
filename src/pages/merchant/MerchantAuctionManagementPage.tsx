import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  InputAdornment,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Chat,
  ContactPageOutlined,
  ExpandLess,
  ExpandMore,
  Gavel,
  Refresh,
  Search,
} from '@mui/icons-material';
import { useTheme as useMUITheme } from '@mui/material/styles';
import {
  auctionService,
  type AuctionBidRow,
  type MerchantAuction,
} from '../../services/auctionService';
import { connectSocket, getSocket } from '../../services/socket';
import { GlassCard, GlassInput, GlassTable } from '../../components/Glass';
import { useMerchantChat } from '../../contexts/MerchantChatContext';

function formatLkr(n: number) {
  return `LKR ${Math.round(n).toLocaleString('en-LK')}`;
}

function formatTimeLeft(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function statusChipSx(status: string, isDark: boolean) {
  switch (status) {
    case 'active':
      return {
        fontWeight: 700,
        background: isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.12)',
        color: isDark ? '#34d399' : '#059669',
        border: `1px solid ${isDark ? 'rgba(16,185,129,0.35)' : 'rgba(16,185,129,0.25)'}`,
      };
    case 'ended':
      return {
        fontWeight: 700,
        background: isDark ? 'rgba(107, 114, 128, 0.2)' : 'rgba(107, 114, 128, 0.12)',
        color: isDark ? '#d1d5db' : '#4b5563',
        border: `1px solid ${isDark ? 'rgba(107,114,128,0.35)' : 'rgba(107,114,128,0.25)'}`,
      };
    default:
      return {
        fontWeight: 700,
        background: isDark ? 'rgba(59, 130, 246, 0.16)' : 'rgba(59, 130, 246, 0.10)',
        color: isDark ? '#93c5fd' : '#2563eb',
        border: `1px solid ${isDark ? 'rgba(59,130,246,0.35)' : 'rgba(59,130,246,0.25)'}`,
      };
  }
}

function matchesSearch(a: MerchantAuction, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  if (a.title.toLowerCase().includes(s)) return true;
  if (a.category?.toLowerCase().includes(s)) return true;
  if (a.winner?.name?.toLowerCase().includes(s)) return true;
  if (a.winner?.email?.toLowerCase().includes(s)) return true;
  return a.id.toLowerCase().includes(s);
}

const MerchantAuctionManagementPage: React.FC = () => {
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const { openChatByAuctionId } = useMerchantChat();

  const [auctions, setAuctions] = useState<MerchantAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bidsByAuction, setBidsByAuction] = useState<Record<string, AuctionBidRow[]>>({});
  const [loadingBids, setLoadingBids] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await auctionService.getAuctions(1, 100, '');
      setAuctions(data.auctions);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setError(e.response?.data?.error || e.message || 'Failed to load auctions');
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAuctions();
    const socket = connectSocket();

    const onBid = (payload: {
      auctionId: string;
      currentBid: number;
      nextMinimum: number;
      bidCount: number;
      endsAt: string;
    }) => {
      setAuctions((prev) =>
        prev.map((a) =>
          a.id === payload.auctionId
            ? {
                ...a,
                currentBid: payload.currentBid,
                nextMinimum: payload.nextMinimum,
                bidCount: payload.bidCount,
                endsAt: payload.endsAt,
              }
            : a
        )
      );
    };

    const onEnded = (payload: {
      auctionId: string;
      winnerId: string | null;
      winnerName: string | null;
    }) => {
      setAuctions((prev) =>
        prev.map((a) =>
          a.id === payload.auctionId
            ? {
                ...a,
                status: 'ended' as const,
                winnerId: payload.winnerId,
                winner: payload.winnerName
                  ? { id: payload.winnerId || '', name: payload.winnerName, email: '' }
                  : null,
              }
            : a
        )
      );
    };

    socket.on('auction:bid', onBid);
    socket.on('auction:ended', onEnded);

    return () => {
      socket.off('auction:bid', onBid);
      socket.off('auction:ended', onEnded);
    };
  }, [fetchAuctions]);

  useEffect(() => {
    auctions.forEach((a) => {
      if (a.status === 'active') {
        getSocket()?.emit('auction:watch', { auctionId: a.id });
      }
    });
  }, [auctions.map((a) => a.id).join(',')]);

  useEffect(() => {
    const t = setTimeout(() => setPage(0), 400);
    return () => clearTimeout(t);
  }, [search]);

  const filteredAuctions = useMemo(
    () => auctions.filter((a) => matchesSearch(a, search)),
    [auctions, search]
  );

  const pagedAuctions = useMemo(
    () => filteredAuctions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredAuctions, page, rowsPerPage]
  );

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredAuctions.length / rowsPerPage) - 1);
    if (page > maxPage) setPage(maxPage);
  }, [filteredAuctions.length, rowsPerPage, page]);

  const toggleExpand = async (auction: MerchantAuction) => {
    if (expandedId === auction.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(auction.id);
    if (!bidsByAuction[auction.id]) {
      setLoadingBids(auction.id);
      try {
        const data = await auctionService.getBidders(auction.id);
        setBidsByAuction((prev) => ({ ...prev, [auction.id]: data.bids }));
      } catch {
        setError('Failed to load bidders');
      } finally {
        setLoadingBids(null);
      }
    }
  };

  return (
    <Box>
      <GlassCard variant="subtle" glassHover={false} sx={{ mb: 3, p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 0.5,
                background: isDark
                  ? 'linear-gradient(135deg, #F5D300 0%, #FFE55C 100%)'
                  : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Auction management
            </Typography>
            <Typography variant="body2" sx={{ color: isDark ? '#cccccc' : '#666' }}>
              Live bid results, bidder details, winners, and chat with the winning bidder after each
              auction ends.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <GlassInput
              size="small"
              placeholder="Search by title, category, or winner…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 260 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: isDark ? '#F5D300' : '#E6C200' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Refresh data">
              <IconButton
                onClick={() => void fetchAuctions()}
                sx={{
                  background: isDark ? 'rgba(245, 211, 0, 0.1)' : 'rgba(230, 194, 0, 0.1)',
                  '&:hover': {
                    background: isDark ? 'rgba(245, 211, 0, 0.2)' : 'rgba(230, 194, 0, 0.2)',
                    transform: 'rotate(180deg)',
                  },
                  transition: 'all 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </GlassCard>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <GlassCard variant="elevated" glassHover={false}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress size={60} sx={{ color: isDark ? '#F5D300' : '#E6C200' }} />
            </Box>
          ) : (
            <>
              <GlassTable glassVariant="subtle">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 48 }} />
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', minWidth: 240 }}>
                      Auction
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      Current bid
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      Bids
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      Watchers
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Time left</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Winner</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAuctions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                        <Typography sx={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>
                          {auctions.length === 0
                            ? 'No auctions yet. Create listings under Auction listings.'
                            : 'No auctions match your search.'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedAuctions.map((a) => {
                      const left = Math.max(0, new Date(a.endsAt).getTime() - Date.now());
                      const expanded = expandedId === a.id;
                      const bids = bidsByAuction[a.id] || [];

                      return (
                        <React.Fragment key={a.id}>
                          <TableRow
                            sx={{
                              '&:hover': {
                                background: isDark ? 'rgba(245, 211, 0, 0.05)' : 'rgba(230, 194, 0, 0.05)',
                              },
                            }}
                          >
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => void toggleExpand(a)}
                                sx={{ color: isDark ? '#F5D300' : '#E6C200' }}
                              >
                                {expanded ? <ExpandLess /> : <ExpandMore />}
                              </IconButton>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar
                                  variant="rounded"
                                  src={a.images?.[0] || undefined}
                                  alt=""
                                  sx={{
                                    width: 44,
                                    height: 44,
                                    flexShrink: 0,
                                    border: isDark
                                      ? '1px solid rgba(245, 211, 0, 0.25)'
                                      : '1px solid rgba(230, 194, 0, 0.35)',
                                    bgcolor: isDark ? 'rgba(245, 211, 0, 0.12)' : 'rgba(230, 194, 0, 0.12)',
                                  }}
                                >
                                  <Gavel sx={{ fontSize: 22, opacity: 0.7, color: isDark ? '#F5D300' : '#E6C200' }} />
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {a.title}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ color: isDark ? '#cccccc' : '#666', fontSize: '0.75rem' }}
                                  >
                                    {a.category}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {formatLkr(a.currentBid)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">{a.bidCount}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">{a.watcherCount}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {a.status === 'active' ? formatTimeLeft(left) : '—'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                                sx={statusChipSx(a.status, isDark)}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: a.winner ? 600 : 400 }}>
                                {a.winner?.name || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {a.status === 'ended' && (a.winner || a.winnerId) ? (
                                <Tooltip title="Chat with winner">
                                  <IconButton
                                    size="small"
                                    onClick={() => void openChatByAuctionId(a.id)}
                                    sx={{
                                      color: isDark ? '#F5D300' : '#E6C200',
                                      '&:hover': {
                                        background: isDark ? 'rgba(245, 211, 0, 0.1)' : 'rgba(230, 194, 0, 0.1)',
                                      },
                                    }}
                                  >
                                    <Chat fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Expand to view bidders">
                                  <IconButton
                                    size="small"
                                    onClick={() => void toggleExpand(a)}
                                    sx={{
                                      color: isDark ? '#9ca3af' : '#6b7280',
                                      '&:hover': {
                                        background: isDark ? 'rgba(245, 211, 0, 0.1)' : 'rgba(230, 194, 0, 0.1)',
                                      },
                                    }}
                                  >
                                    <ContactPageOutlined fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={9} sx={{ py: 0, border: 0 }}>
                              <Collapse in={expanded}>
                                <Box
                                  sx={{
                                    py: 2,
                                    px: 3,
                                    mx: 2,
                                    mb: 2,
                                    borderRadius: 2,
                                    border: isDark
                                      ? '1px solid rgba(245, 211, 0, 0.12)'
                                      : '1px solid rgba(230, 194, 0, 0.15)',
                                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                  }}
                                >
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                                    Bid history
                                  </Typography>
                                  {loadingBids === a.id ? (
                                    <CircularProgress size={28} sx={{ color: isDark ? '#F5D300' : '#E6C200' }} />
                                  ) : bids.length === 0 ? (
                                    <Typography variant="body2" sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                                      No bids yet
                                    </Typography>
                                  ) : (
                                    <Stack spacing={1}>
                                      {bids.map((b) => (
                                        <Box
                                          key={b.id}
                                          sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            py: 1,
                                            px: 1.5,
                                            borderRadius: 1,
                                            background: isDark
                                              ? 'rgba(245, 211, 0, 0.05)'
                                              : 'rgba(230, 194, 0, 0.05)',
                                          }}
                                        >
                                          <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                              {b.bidder?.name || 'Bidder'}
                                            </Typography>
                                            <Typography
                                              variant="caption"
                                              sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                                            >
                                              {b.bidder?.email}
                                              {b.bidder?.phone ? ` · ${b.bidder.phone}` : ''}
                                            </Typography>
                                          </Box>
                                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {formatLkr(b.amount)}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </Stack>
                                  )}
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })
                  )}
                </TableBody>
              </GlassTable>
              <TablePagination
                component="div"
                count={filteredAuctions.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                sx={{
                  borderTop: isDark ? '1px solid rgba(245, 211, 0, 0.1)' : '1px solid rgba(230, 194, 0, 0.1)',
                  px: 2,
                }}
              />
            </>
          )}
        </CardContent>
      </GlassCard>

    </Box>
  );
};

export default MerchantAuctionManagementPage;

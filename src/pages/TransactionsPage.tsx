import React, { useEffect, useState } from 'react';
import {
  Box,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Avatar,
  InputAdornment,
} from '@mui/material';
import { Refresh, Search, Download } from '@mui/icons-material';
import { useTheme as useMUITheme } from '@mui/material/styles';
import { spotTradeAdminService, SpotTrade, WalletTransaction } from '../services/spotTradeAdminService';
import { GlassCard, GlassInput, GlassButton, GlassTable } from '../components/Glass';

const TransactionsPage: React.FC = () => {
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [spotTrades, setSpotTrades] = useState<SpotTrade[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [walletRes, tradeRes] = await Promise.all([
        spotTradeAdminService.getWalletTransactions(200, 0),
        spotTradeAdminService.getSpotTrades(200, 0),
      ]);
      setWalletTransactions(walletRes.transactions);
      setSpotTrades(tradeRes.trades);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const filteredWalletTransactions = walletTransactions.filter((tx) =>
    tx.id.toString().includes(search) || tx.user_id.toString().includes(search)
  );

  const filteredSpotTrades = spotTrades.filter((trade) =>
    trade.id.toString().includes(search) || trade.user_id.toString().includes(search)
  );

  return (
    <Box>
      {/* Header Section */}
      <GlassCard variant="subtle" glassHover={false} sx={{ mb: 3, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
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
              Transaction Management
            </Typography>
            <Typography variant="body2" sx={{ color: isDark ? '#cccccc' : '#666' }}>
              Monitor wallet transactions and gold trades
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <GlassInput
              size="small"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 250 }}
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
                onClick={fetchData}
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
            <GlassButton
              variant="contained"
              startIcon={<Download />}
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #F5D300 0%, #B8A000 100%)'
                  : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
                color: isDark ? '#000' : '#FFF',
              }}
            >
              Export
            </GlassButton>
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
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      <GlassCard variant="elevated" glassHover={false}>
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              px: 3,
              pt: 2,
              borderBottom: isDark
                ? '1px solid rgba(245, 211, 0, 0.1)'
                : '1px solid rgba(230, 194, 0, 0.1)',
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.9375rem',
                minWidth: 180,
                '&.Mui-selected': {
                  color: isDark ? '#FFE55C' : '#E6C200',
                },
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: isDark
                  ? 'linear-gradient(90deg, #F5D300 0%, #FFE55C 100%)'
                  : 'linear-gradient(90deg, #E6C200 0%, #E8D89B 100%)',
              },
            }}
          >
            <Tab label="Deposits / Withdrawals" />
            <Tab label="Gold Buy / Sell" />
          </Tabs>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress size={60} sx={{ color: isDark ? '#F5D300' : '#E6C200' }} />
            </Box>
          ) : tab === 0 ? (
            <GlassTable glassVariant="subtle">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredWalletTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography sx={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>
                        No transactions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWalletTransactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      sx={{
                        '&:hover': {
                          background: isDark
                            ? 'rgba(245, 211, 0, 0.05)'
                            : 'rgba(230, 194, 0, 0.05)',
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                          #{tx.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: isDark
                                ? 'linear-gradient(135deg, #F5D300 0%, #B8A000 100%)'
                                : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
                            }}
                          >
                            U
                          </Avatar>
                          <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                            #{tx.user_id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={tx.transaction_type}
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            ...(tx.transaction_type === 'DEPOSIT'
                              ? {
                                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
                                  color: '#10b981',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                }
                              : {
                                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
                                  color: '#ef4444',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                }),
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          LKR {Math.round(tx.amount).toLocaleString('en-LK')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={tx.status}
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            ...(tx.status === 'PENDING'
                              ? {
                                  background: isDark
                                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%)'
                                    : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
                                  color: isDark ? '#fbbf24' : '#f59e0b',
                                  border: `1px solid ${
                                    isDark ? 'rgba(245, 158, 11, 0.4)' : 'rgba(245, 158, 11, 0.3)'
                                  }`,
                                }
                              : tx.status === 'REJECTED' || tx.status === 'FAILED'
                              ? {
                                  background: isDark
                                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.15) 100%)'
                                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
                                  color: isDark ? '#f87171' : '#dc2626',
                                  border: `1px solid ${
                                    isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)'
                                  }`,
                                }
                              : {
                                  background: isDark
                                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)'
                                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
                                  color: isDark ? '#10b981' : '#059669',
                                  border: `1px solid ${
                                    isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)'
                                  }`,
                                }),
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                          {new Date(tx.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </GlassTable>
          ) : (
            <GlassTable glassVariant="subtle">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Fee</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSpotTrades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography sx={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>
                        No trades found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSpotTrades.map((trade) => (
                    <TableRow
                      key={trade.id}
                      sx={{
                        '&:hover': {
                          background: isDark
                            ? 'rgba(245, 211, 0, 0.05)'
                            : 'rgba(230, 194, 0, 0.05)',
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                          #{trade.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: isDark
                                ? 'linear-gradient(135deg, #F5D300 0%, #B8A000 100%)'
                                : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
                            }}
                          >
                            U
                          </Avatar>
                          <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                            #{trade.user_id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={trade.order_type}
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            ...(trade.order_type === 'BUY'
                              ? {
                                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
                                  color: '#10b981',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                }
                              : {
                                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
                                  color: '#ef4444',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                }),
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                          {trade.quantity.toFixed(4)} pawn
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                          LKR {Math.round(trade.price).toLocaleString('en-LK')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          LKR {Math.round(trade.total_value).toLocaleString('en-LK')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: isDark ? '#cccccc' : '#666' }}>
                          LKR {Math.round(trade.fee || 0).toLocaleString('en-LK')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                          {new Date(trade.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </GlassTable>
          )}
        </CardContent>
      </GlassCard>
    </Box>
  );
};

export default TransactionsPage;

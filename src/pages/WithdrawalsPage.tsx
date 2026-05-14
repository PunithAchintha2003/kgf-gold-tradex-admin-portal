import React, { useEffect, useState } from 'react';
import {
  Box,
  CardContent,
  Typography,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  Avatar,
  InputAdornment,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { CheckCircle, Cancel, Refresh, Search, AttachMoney, AccountBalance } from '@mui/icons-material';
import { useTheme as useMUITheme } from '@mui/material/styles';
import { spotTradeAdminService, WalletTransaction } from '../services/spotTradeAdminService';
import { GlassCard, GlassInput, GlassButton, GlassTable, GlassModal } from '../components/Glass';

const WithdrawalsPage: React.FC = () => {
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<WalletTransaction[]>([]);
  const [selectedItem, setSelectedItem] = useState<WalletTransaction | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await spotTradeAdminService.getWalletTransactions(200, 0, 'PENDING', 'WITHDRAWAL');
      setItems(res.transactions);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to load pending withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id: number, approve: boolean) => {
    try {
      await spotTradeAdminService.decideWithdrawal(id, approve);
      setApproveDialogOpen(false);
      setRejectDialogOpen(false);
      setSelectedItem(null);
      await fetchPending();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to process request');
      setApproveDialogOpen(false);
      setRejectDialogOpen(false);
    }
  };

  const filteredItems = items.filter(
    (tx) =>
      tx.id.toString().includes(search) ||
      tx.user_id.toString().includes(search) ||
      tx.bank_account_number?.includes(search)
  );

  useEffect(() => {
    void fetchPending();
  }, []);

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
              Withdrawal Approvals
            </Typography>
            <Typography variant="body2" sx={{ color: isDark ? '#cccccc' : '#666' }}>
              Review and approve pending withdrawal requests
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <GlassInput
              size="small"
              placeholder="Search withdrawals..."
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
                onClick={fetchPending}
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
          onClose={() => setError('')}
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
            <GlassTable glassVariant="subtle">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Request ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Fee</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Net Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Bank Details</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography sx={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>
                        No pending withdrawals found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((tx) => (
                    <TableRow
                      key={tx.id}
                      sx={{
                        '&:hover': {
                          background: isDark ? 'rgba(245, 211, 0, 0.05)' : 'rgba(230, 194, 0, 0.05)',
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AttachMoney sx={{ fontSize: 16, color: isDark ? '#F5D300' : '#E6C200' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            {Math.round(tx.amount).toLocaleString('en-LK')}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: isDark ? '#cccccc' : '#666' }}>
                          LKR {Math.round(tx.fee || 0).toLocaleString('en-LK')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#10b981' }}>
                          LKR {Math.round(tx.amount + (tx.fee || 0)).toLocaleString('en-LK')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccountBalance sx={{ fontSize: 14, color: isDark ? '#cccccc' : '#666' }} />
                            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                              {tx.bank_name}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: isDark ? '#888' : '#999' }}>
                            {tx.bank_account_number}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: isDark ? '#888' : '#999' }}>
                            {tx.bank_account_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={tx.status}
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            background: isDark
                              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%)'
                              : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
                            color: isDark ? '#fbbf24' : '#f59e0b',
                            border: `1px solid ${
                              isDark ? 'rgba(245, 158, 11, 0.4)' : 'rgba(245, 158, 11, 0.3)'
                            }`,
                            animation: 'pulse 2s cubic-bezier(0.4, 0.0, 0.2, 1) infinite',
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Approve withdrawal">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedItem(tx);
                                setApproveDialogOpen(true);
                              }}
                              sx={{
                                color: '#10b981',
                                '&:hover': {
                                  background: 'rgba(16, 185, 129, 0.1)',
                                },
                              }}
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject withdrawal">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedItem(tx);
                                setRejectDialogOpen(true);
                              }}
                              sx={{
                                color: '#ef4444',
                                '&:hover': {
                                  background: 'rgba(239, 68, 68, 0.1)',
                                },
                              }}
                            >
                              <Cancel fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </GlassTable>
          )}
        </CardContent>
      </GlassCard>

      {/* Approve Dialog */}
      <GlassModal open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            borderBottom: isDark ? '1px solid rgba(245, 211, 0, 0.1)' : '1px solid rgba(230, 194, 0, 0.1)',
          }}
        >
          Approve Withdrawal
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to approve this withdrawal request?
          </Typography>
          {selectedItem && (
            <Box
              sx={{
                p: 2,
                borderRadius: '10px',
                background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Request ID:</strong> #{selectedItem.id}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>User ID:</strong> #{selectedItem.user_id}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Amount:</strong> LKR {Math.round(selectedItem.amount).toLocaleString('en-LK')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Bank:</strong> {selectedItem.bank_name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Account:</strong> {selectedItem.bank_account_number}
              </Typography>
              <Typography variant="body2">
                <strong>Account Name:</strong> {selectedItem.bank_account_name}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setApproveDialogOpen(false)} sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
            Cancel
          </Button>
          <GlassButton
            onClick={() => selectedItem && handleDecision(selectedItem.id, true)}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#FFF',
            }}
          >
            Confirm Approval
          </GlassButton>
        </DialogActions>
      </GlassModal>

      {/* Reject Dialog */}
      <GlassModal open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            borderBottom: isDark ? '1px solid rgba(245, 211, 0, 0.1)' : '1px solid rgba(230, 194, 0, 0.1)',
          }}
        >
          Reject Withdrawal
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to reject this withdrawal request? This action cannot be undone.
          </Typography>
          {selectedItem && (
            <Box
              sx={{
                p: 2,
                borderRadius: '10px',
                background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Request ID:</strong> #{selectedItem.id}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>User ID:</strong> #{selectedItem.user_id}
              </Typography>
              <Typography variant="body2">
                <strong>Amount:</strong> LKR {Math.round(selectedItem.amount).toLocaleString('en-LK')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setRejectDialogOpen(false)} sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
            Cancel
          </Button>
          <GlassButton
            onClick={() => selectedItem && handleDecision(selectedItem.id, false)}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#FFF',
            }}
          >
            Confirm Rejection
          </GlassButton>
        </DialogActions>
      </GlassModal>
    </Box>
  );
};

export default WithdrawalsPage;

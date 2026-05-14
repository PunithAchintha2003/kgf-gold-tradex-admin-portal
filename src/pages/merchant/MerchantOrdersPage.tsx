import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CardContent,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  type SelectChangeEvent,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { ContactPageOutlined, Refresh, Search } from '@mui/icons-material';
import { useTheme as useMUITheme } from '@mui/material/styles';
import {
  merchantService,
  type DeliveryStatus,
  type MerchantOrderLine,
} from '../../services/merchantService';
import { GlassCard, GlassInput, GlassModal, GlassTable } from '../../components/Glass';

const DELIVERY_OPTIONS: DeliveryStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

function formatLkr(n: number) {
  return `LKR ${Math.round(n).toLocaleString('en-LK')}`;
}

function deliveryLabel(s: string) {
  switch (s) {
    case 'pending':
      return 'Pending';
    case 'processing':
      return 'Processing';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return s;
  }
}

function lineThumbnailUrl(line: MerchantOrderLine): string | undefined {
  const u = line.imageUrl;
  return u && /^https?:\/\//i.test(u) ? u : undefined;
}

function matchesSearch(line: MerchantOrderLine, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const orderRef = line.orderId.slice(-8).toLowerCase();
  if (line.name.toLowerCase().includes(s)) return true;
  if (line.orderId.toLowerCase().includes(s) || orderRef.includes(s)) return true;
  const buyer = line.buyer;
  if (!buyer) return false;
  const hay = [buyer.name, buyer.email, buyer.phone, buyer.address]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hay.includes(s);
}

const MerchantOrdersPage: React.FC = () => {
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';

  const [lines, setLines] = useState<MerchantOrderLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<MerchantOrderLine | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await merchantService.getMerchantOrders();
      setLines(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders');
      setLines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => setPage(0), 400);
    return () => clearTimeout(t);
  }, [search]);

  const filteredLines = useMemo(
    () => lines.filter((line) => matchesSearch(line, search)),
    [lines, search],
  );

  const pagedLines = useMemo(
    () => filteredLines.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredLines, page, rowsPerPage],
  );

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredLines.length / rowsPerPage) - 1);
    if (page > maxPage) setPage(maxPage);
  }, [filteredLines.length, rowsPerPage, page]);

  const handleStatusChange = useCallback(
    async (line: MerchantOrderLine, event: SelectChangeEvent<string>) => {
      const next = event.target.value as DeliveryStatus;
      if (next === line.deliveryStatus) return;
      setUpdatingId(line.lineItemId);
      try {
        await merchantService.updateOrderLineDelivery(line.orderId, line.lineItemId, next);
        setLines((prev) =>
          prev.map((row) =>
            row.lineItemId === line.lineItemId ? { ...row, deliveryStatus: next } : row,
          ),
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not update status');
      } finally {
        setUpdatingId(null);
      }
    },
    [],
  );

  const selectOutlineSx = {
    borderRadius: '10px',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: isDark ? 'rgba(245, 211, 0, 0.22)' : 'rgba(230, 194, 0, 0.32)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: isDark ? 'rgba(245, 211, 0, 0.45)' : 'rgba(230, 194, 0, 0.5)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: isDark ? '#F5D300' : '#E6C200',
      borderWidth: '1px',
    },
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
              Order management
            </Typography>
            <Typography variant="body2" sx={{ color: isDark ? '#cccccc' : '#666' }}>
              Purchases of your listings with buyer details for delivery. Update delivery status—buyers
              see updates on their purchase history.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <GlassInput
              size="small"
              placeholder="Search by product, order, or buyer…"
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
                onClick={() => void load()}
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
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', minWidth: 260 }}>
                      Product
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      Qty
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      Line total
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Order</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', minWidth: 168 }}>
                      Delivery
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      Buyer
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography sx={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '0.875rem' }}>
                          {lines.length === 0
                            ? 'No orders for your store yet.'
                            : 'No orders match your search.'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedLines.map((line) => (
                      <TableRow
                        key={`${line.orderId}-${line.lineItemId}`}
                        sx={{
                          '&:hover': {
                            background: isDark ? 'rgba(245, 211, 0, 0.05)' : 'rgba(230, 194, 0, 0.05)',
                          },
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {lineThumbnailUrl(line) ? (
                              <Avatar
                                variant="rounded"
                                src={lineThumbnailUrl(line)}
                                alt=""
                                imgProps={{ alt: line.name }}
                                sx={{
                                  width: 44,
                                  height: 44,
                                  flexShrink: 0,
                                  border: isDark
                                    ? '1px solid rgba(245, 211, 0, 0.25)'
                                    : '1px solid rgba(230, 194, 0, 0.35)',
                                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                }}
                              />
                            ) : (
                              <Avatar
                                variant="rounded"
                                sx={{
                                  width: 44,
                                  height: 44,
                                  flexShrink: 0,
                                  fontSize: '0.875rem',
                                  fontWeight: 600,
                                  background: isDark
                                    ? 'linear-gradient(135deg, #F5D300 0%, #B8A000 100%)'
                                    : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
                                  color: isDark ? '#000' : '#FFF',
                                }}
                              >
                                {line.name?.[0] || 'P'}
                              </Avatar>
                            )}
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {line.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: isDark ? '#cccccc' : '#666', fontSize: '0.75rem' }}
                              >
                                {new Date(line.createdAt).toLocaleString(undefined, {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{line.quantity}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatLkr(line.unitPriceLkr * line.quantity)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                              color: isDark ? '#e5e7eb' : '#374151',
                            }}
                          >
                            …{line.orderId.slice(-8).toUpperCase()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" fullWidth disabled={updatingId === line.lineItemId}>
                            <Select
                              variant="outlined"
                              value={line.deliveryStatus}
                              onChange={(e) => void handleStatusChange(line, e)}
                              sx={selectOutlineSx}
                            >
                              {DELIVERY_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {deliveryLabel(opt)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Buyer details for delivery">
                            <IconButton
                              size="small"
                              onClick={() => setDetail(line)}
                              disabled={!line.buyer}
                              sx={{
                                color: isDark ? '#F5D300' : '#E6C200',
                                '&:hover': {
                                  background: isDark ? 'rgba(245, 211, 0, 0.1)' : 'rgba(230, 194, 0, 0.1)',
                                },
                              }}
                            >
                              <ContactPageOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </GlassTable>
              <TablePagination
                component="div"
                count={filteredLines.length}
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

      <GlassModal open={detail !== null} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            borderBottom: isDark ? '1px solid rgba(245, 211, 0, 0.1)' : '1px solid rgba(230, 194, 0, 0.1)',
          }}
        >
          Buyer details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {detail?.buyer ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2">
                <strong>Name:</strong> {detail.buyer.name || '—'}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {detail.buyer.email || '—'}
              </Typography>
              <Typography variant="body2">
                <strong>Phone:</strong> {detail.buyer.phone || '—'}
              </Typography>
              <Typography variant="body2">
                <strong>Address:</strong> {detail.buyer.address || '—'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: isDark ? '#9ca3af' : '#6b7280' }}>
                <strong>Item:</strong> {detail.name} × {detail.quantity}
              </Typography>
            </Box>
          ) : (
            <Typography sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
              No buyer snapshot on file for this order.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDetail(null)} sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
            Close
          </Button>
        </DialogActions>
      </GlassModal>
    </Box>
  );
};

export default MerchantOrdersPage;

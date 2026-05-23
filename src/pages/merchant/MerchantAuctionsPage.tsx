import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CardContent,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme as useMUITheme,
} from '@mui/material';
import { Add, Delete, Edit, Gavel, PhotoCamera, Refresh, Search } from '@mui/icons-material';
import { auctionService, type MerchantAuction } from '../../services/auctionService';
import { authService } from '../../services/authService';
import { GlassButton, GlassCard, GlassInput, GlassModal, GlassTable } from '../../components/Glass';
import {
  DEFAULT_PRODUCT_CATEGORY,
  PRODUCT_CATEGORIES,
  normalizeProductCategory,
  type ProductCategory,
} from '../../constants/productCategories';

const emptyForm = {
  title: '',
  description: '',
  category: DEFAULT_PRODUCT_CATEGORY as ProductCategory,
  purity: '22K',
  weight: '',
  condition: 'Excellent',
  startingBid: '',
  minIncrement: '2000',
  durationHours: '24',
  images: [] as string[],
};

type FormState = typeof emptyForm;

function formatLkr(n: number) {
  return `LKR ${Math.round(n).toLocaleString('en-LK')}`;
}

function formatTimeLeft(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s % 60}s`;
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
    case 'scheduled':
      return {
        fontWeight: 700,
        background: isDark ? 'rgba(59, 130, 246, 0.16)' : 'rgba(59, 130, 246, 0.10)',
        color: isDark ? '#93c5fd' : '#2563eb',
        border: `1px solid ${isDark ? 'rgba(59,130,246,0.35)' : 'rgba(59,130,246,0.25)'}`,
      };
    default:
      return {
        fontWeight: 700,
        background: isDark ? 'rgba(239, 68, 68, 0.16)' : 'rgba(239, 68, 68, 0.10)',
        color: isDark ? '#fca5a5' : '#dc2626',
        border: `1px solid ${isDark ? 'rgba(239,68,68,0.35)' : 'rgba(239,68,68,0.25)'}`,
      };
  }
}

const MerchantAuctionsPage: React.FC = () => {
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const merchantVerified = Boolean(authService.getCurrentUser()?.merchantVerified);

  const [auctions, setAuctions] = useState<MerchantAuction[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [, setTick] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MerchantAuction | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const formImagesRef = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<MerchantAuction | null>(null);

  formImagesRef.current = form.images;

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await auctionService.getAuctions(page + 1, rowsPerPage, search);
      setAuctions(data.auctions);
      setTotal(data.pagination.total);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setError(e.response?.data?.error || e.message || 'Failed to load auctions');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    void fetchAuctions();
  }, [fetchAuctions]);

  useEffect(() => {
    const t = setTimeout(() => setPage(0), 400);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (a: MerchantAuction) => {
    setEditing(a);
    setForm({
      title: a.title,
      description: a.description || '',
      category: normalizeProductCategory(a.category) as ProductCategory,
      purity: a.purity || '22K',
      weight: a.weight || '',
      condition: a.condition || 'Excellent',
      startingBid: String(a.startingBid),
      minIncrement: String(a.minIncrement || 2000),
      durationHours: '24',
      images: [...(a.images || [])].slice(0, 5),
    });
    setDialogOpen(true);
  };

  const payloadFromForm = useMemo(() => {
    const startingBid = parseFloat(form.startingBid);
    const minIncrement = parseFloat(form.minIncrement);
    const durationHours = parseInt(form.durationHours, 10);
    const images = form.images.filter((u) => u.trim()).slice(0, 5);
    return {
      title: form.title.trim(),
      description: form.description.trim(),
      category: normalizeProductCategory(form.category),
      purity: form.purity.trim(),
      weight: form.weight.trim(),
      condition: form.condition.trim(),
      startingBid: Number.isFinite(startingBid) ? startingBid : NaN,
      minIncrement: Number.isFinite(minIncrement) ? minIncrement : 2000,
      durationHours: Number.isFinite(durationHours) ? durationHours : 24,
      images,
    };
  }, [form]);

  const handleSave = async () => {
    const p = payloadFromForm;
    if (!p.title) {
      setError('Title is required');
      return;
    }
    if (!Number.isFinite(p.startingBid)) {
      setError('Starting bid must be a valid number');
      return;
    }
    if (!merchantVerified && !editing) {
      setError('Verified seller status is required to create auctions');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editing) {
        await auctionService.updateAuction(editing.id, {
          title: p.title,
          description: p.description,
          category: p.category,
          purity: p.purity,
          weight: p.weight,
          condition: p.condition,
          images: p.images,
        });
      } else {
        await auctionService.createAuction(p);
      }
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await fetchAuctions();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setError(e.response?.data?.error || e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    setError('');
    try {
      await auctionService.deleteAuction(deleting.id);
      setDeleteOpen(false);
      setDeleting(null);
      await fetchAuctions();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setError(e.response?.data?.error || e.message || 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeviceImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const list = input.files;
    if (!list?.length) return;
    const files = Array.from(list);
    input.value = '';
    const slots = 5 - formImagesRef.current.length;
    if (slots <= 0) {
      setError('Maximum 5 images per auction');
      return;
    }
    setUploadingImages(true);
    setError('');
    try {
      const urls = await auctionService.uploadImages(files.slice(0, slots));
      setForm((f) => ({ ...f, images: [...f.images, ...urls].slice(0, 5) }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImageAt = (index: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  return (
    <Box>
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
              Auction listings
            </Typography>
            <Typography variant="body2" sx={{ color: isDark ? '#cccccc' : '#666', maxWidth: 760 }}>
              Create live gold auctions with starting bids and duration. Listings go live on the storefront
              once you are verified; bidders compete in real time.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <GlassInput
              size="small"
              placeholder="Search title, category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 280 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: isDark ? '#F5D300' : '#E6C200' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Refresh">
              <IconButton
                onClick={() => void fetchAuctions()}
                sx={{
                  background: isDark ? 'rgba(245, 211, 0, 0.1)' : 'rgba(230, 194, 0, 0.1)',
                  '&:hover': { background: isDark ? 'rgba(245, 211, 0, 0.2)' : 'rgba(230, 194, 0, 0.2)' },
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            <GlassButton
              variant="contained"
              startIcon={<Add />}
              onClick={openCreate}
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #F5D300 0%, #B8A000 100%)'
                  : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
                color: isDark ? '#000' : '#FFF',
              }}
            >
              Add auction
            </GlassButton>
          </Stack>
        </Box>
      </GlassCard>

      {error && !dialogOpen && !deleteOpen && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {!merchantVerified && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: '12px' }}>
          Verified seller status is required to create auctions.
        </Alert>
      )}

      <GlassCard variant="elevated" glassHover={false}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress sx={{ color: isDark ? '#F5D300' : '#E6C200' }} />
            </Box>
          ) : (
            <>
              <GlassTable glassVariant="subtle">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Auction</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Starting bid</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Current bid</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Bids</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Time left</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auctions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>No auctions yet</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    auctions.map((a) => {
                      const left = Math.max(0, new Date(a.endsAt).getTime() - Date.now());
                      return (
                        <TableRow
                          key={a.id}
                          sx={{
                            '&:hover': {
                              background: isDark ? 'rgba(245, 211, 0, 0.05)' : 'rgba(230, 194, 0, 0.05)',
                            },
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                variant="rounded"
                                src={a.images?.[0] || undefined}
                                alt=""
                                sx={{
                                  width: 44,
                                  height: 44,
                                  bgcolor: isDark ? 'rgba(245, 211, 0, 0.12)' : 'rgba(230, 194, 0, 0.12)',
                                }}
                              >
                                <Gavel sx={{ fontSize: 22, opacity: 0.6, color: isDark ? '#F5D300' : '#E6C200' }} />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {a.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                                  {a.category} · {a.purity} · {a.weight || '—'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{formatLkr(a.startingBid)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatLkr(a.currentBid)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{a.bidCount}</Typography>
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
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => openEdit(a)}
                                disabled={a.status === 'ended'}
                                sx={{ color: isDark ? '#F5D300' : '#E6C200' }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setDeleting(a);
                                  setDeleteOpen(true);
                                }}
                                disabled={a.bidCount > 0 && a.status !== 'cancelled'}
                                sx={{ color: '#ef4444' }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </GlassTable>
              <TablePagination
                component="div"
                count={total}
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

      <GlassModal
        open={dialogOpen}
        onClose={() => !saving && !uploadingImages && setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            borderBottom: isDark ? '1px solid rgba(245, 211, 0, 0.1)' : '1px solid rgba(230, 194, 0, 0.1)',
            fontWeight: 800,
          }}
        >
          {editing ? 'Edit auction' : 'Add auction'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && dialogOpen && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          <Stack spacing={2.25} sx={{ mt: 1 }}>
            <GlassInput
              fullWidth
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <GlassInput
              fullWidth
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              multiline
              minRows={3}
            />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                Category
              </Typography>
              <ToggleButtonGroup
                exclusive
                value={form.category}
                onChange={(_e, value: ProductCategory | null) => {
                  if (value != null) setForm({ ...form, category: value });
                }}
                aria-label="Auction category"
                sx={{
                  flexWrap: 'wrap',
                  gap: 0.75,
                  rowGap: 1,
                  '& .MuiToggleButtonGroup-grouped': {
                    border: 0,
                    borderRadius: '10px !important',
                    mx: 0,
                    my: 0,
                  },
                }}
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <ToggleButton
                    key={cat}
                    value={cat}
                    size="small"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      px: 1.25,
                      py: 0.75,
                      border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
                      color: isDark ? '#e5e7eb' : '#374151',
                      '&.Mui-selected': {
                        background: isDark
                          ? 'linear-gradient(135deg, rgba(245, 211, 0, 0.35) 0%, rgba(184, 160, 0, 0.25) 100%)'
                          : 'linear-gradient(135deg, rgba(230, 194, 0, 0.35) 0%, rgba(184, 160, 0, 0.22) 100%)',
                        color: isDark ? '#FFE55C' : '#1f2937',
                        borderColor: isDark ? 'rgba(245, 211, 0, 0.45)' : 'rgba(230, 194, 0, 0.55)',
                      },
                    }}
                  >
                    {cat}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <GlassInput
                fullWidth
                label="Purity"
                value={form.purity}
                onChange={(e) => setForm({ ...form, purity: e.target.value })}
              />
              <GlassInput
                fullWidth
                label="Weight"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
              />
              <GlassInput
                fullWidth
                label="Condition"
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
              />
            </Stack>
            {!editing && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <GlassInput
                  fullWidth
                  label="Starting bid (LKR)"
                  value={form.startingBid}
                  onChange={(e) => setForm({ ...form, startingBid: e.target.value })}
                  type="number"
                  inputProps={{ min: 0, step: '1' }}
                />
                <GlassInput
                  fullWidth
                  label="Min increment (LKR)"
                  value={form.minIncrement}
                  onChange={(e) => setForm({ ...form, minIncrement: e.target.value })}
                  type="number"
                  inputProps={{ min: 1, step: '1' }}
                />
                <GlassInput
                  fullWidth
                  label="Duration (hours)"
                  value={form.durationHours}
                  onChange={(e) => setForm({ ...form, durationHours: e.target.value })}
                  type="number"
                  inputProps={{ min: 1, max: 168, step: '1' }}
                />
              </Stack>
            )}
            <Box sx={{ position: 'relative' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                Auction images
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#9ca3af' : '#6b7280', display: 'block', mb: 1.5 }}>
                Upload from your device. Up to 5 images, 5 MB each.
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <GlassButton
                    type="button"
                    variant="outlined"
                    disabled={uploadingImages || form.images.length >= 5}
                    onClick={() => fileInputRef.current?.click()}
                    startIcon={uploadingImages ? <CircularProgress size={18} /> : <PhotoCamera />}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    {uploadingImages ? 'Uploading…' : 'Add from device'}
                  </GlassButton>
                  <Typography variant="caption" sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                    {form.images.length} / 5
                  </Typography>
                </Stack>
                {form.images.length > 0 ? (
                  <Stack direction="row" flexWrap="wrap" gap={1.25}>
                    {form.images.map((url, idx) => (
                      <Box
                        key={`${url}-${idx}`}
                        sx={{
                          position: 'relative',
                          width: 96,
                          height: 96,
                          borderRadius: 1.5,
                          overflow: 'hidden',
                          border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
                        }}
                      >
                        <Box
                          component="img"
                          src={url}
                          alt=""
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <IconButton
                          type="button"
                          size="small"
                          onClick={() => removeImageAt(idx)}
                          disabled={uploadingImages}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            width: 30,
                            height: 30,
                          }}
                        >
                          <Delete sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                ) : null}
              </Stack>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                hidden
                onChange={(e) => void handleDeviceImagesChange(e)}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            disabled={saving || uploadingImages}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Cancel
          </Button>
          <GlassButton
            onClick={() => void handleSave()}
            variant="contained"
            disabled={saving || uploadingImages}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              background: isDark
                ? 'linear-gradient(135deg, #F5D300 0%, #B8A000 100%)'
                : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
              color: isDark ? '#000' : '#FFF',
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </GlassButton>
        </DialogActions>
      </GlassModal>

      <GlassModal open={deleteOpen} onClose={() => !saving && setDeleteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete auction</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ lineHeight: 1.7 }}>
            Delete <strong>{deleting?.title}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteOpen(false)} disabled={saving} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleDelete()}
            disabled={saving}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            }}
          >
            {saving ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </GlassModal>
    </Box>
  );
};

export default MerchantAuctionsPage;

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
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
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
import { Add, Delete, Edit, PhotoCamera, Refresh, Search } from '@mui/icons-material';
import { merchantService, MerchantProduct } from '../../services/merchantService';
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
  sku: '',
  price: '',
  currency: 'LKR',
  category: DEFAULT_PRODUCT_CATEGORY as ProductCategory,
  stock: '0',
  images: [] as string[],
  isPublished: false,
};

type FormState = typeof emptyForm;

const MerchantProductsPage: React.FC = () => {
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const merchantVerified = Boolean(authService.getCurrentUser()?.merchantVerified);

  const [products, setProducts] = useState<MerchantProduct[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MerchantProduct | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const formImagesRef = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<MerchantProduct | null>(null);

  formImagesRef.current = form.images;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await merchantService.getProducts(page + 1, rowsPerPage, search);
      setProducts(data.products);
      setTotal(data.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const t = setTimeout(() => setPage(0), 400);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: MerchantProduct) => {
    setEditing(p);
    const imgs =
      p.images && p.images.length > 0 ? [...p.images] : p.imageUrl ? [p.imageUrl] : [];
    setForm({
      title: p.title,
      description: p.description || '',
      sku: p.sku || '',
      price: String(p.price),
      currency: p.currency || 'LKR',
      category: normalizeProductCategory(p.category),
      stock: String(p.stock ?? 0),
      images: imgs.slice(0, 5),
      isPublished: Boolean(p.isPublished),
    });
    setDialogOpen(true);
  };

  const payloadFromForm = useMemo(() => {
    const price = parseFloat(form.price);
    const stock = parseInt(form.stock, 10);
    const images = form.images.filter((u) => typeof u === 'string' && u.trim().length > 0).slice(0, 5);
    return {
      title: form.title.trim(),
      description: form.description.trim(),
      sku: form.sku.trim(),
      price: Number.isFinite(price) ? price : NaN,
      currency: form.currency.trim() || 'LKR',
      category: normalizeProductCategory(form.category),
      stock: Number.isFinite(stock) ? Math.max(0, stock) : NaN,
      images,
      imageUrl: images[0] || '',
      isPublished: form.isPublished,
    };
  }, [form]);

  const handleSave = async () => {
    const p = payloadFromForm;
    if (!p.title) {
      setError('Title is required');
      return;
    }
    if (!Number.isFinite(p.price)) {
      setError('Price must be a valid number');
      return;
    }
    if (!Number.isFinite(p.stock)) {
      setError('Stock must be a valid whole number');
      return;
    }
    if (p.isPublished && !merchantVerified) {
      setError('Verified seller status is required to publish');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editing) {
        await merchantService.updateProduct(editing._id, p);
      } else {
        await merchantService.createProduct(p);
      }
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    setError('');
    try {
      await merchantService.deleteProduct(deleting._id);
      setDeleteOpen(false);
      setDeleting(null);
      await fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeviceImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const list = input.files;
    if (!list?.length) return;
    // FileList is live — copy files before clearing the input or length becomes 0.
    const files = Array.from(list);
    input.value = '';

    const slots = 5 - formImagesRef.current.length;
    if (slots <= 0) {
      setError('Maximum 5 images per product');
      return;
    }
    const toUpload = files.slice(0, slots);
    setUploadingImages(true);
    setError('');
    try {
      const urls = await merchantService.uploadProductImages(toUpload, editing?._id);
      setForm((f) => ({ ...f, images: [...f.images, ...urls].slice(0, 5) }));
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Image upload failed';
      setError(message);
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
              Product catalog
            </Typography>
            <Typography variant="body2" sx={{ color: isDark ? '#cccccc' : '#666', maxWidth: 760 }}>
              Keep titles, pricing, and stock accurate. Use drafts while you prepare listings; publish when you are
              verified and ready to sell live.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <GlassInput
              size="small"
              placeholder="Search title, SKU, category…"
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
                onClick={() => void fetchProducts()}
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
              Add product
            </GlassButton>
          </Stack>
        </Box>
      </GlassCard>

      {error && !dialogOpen && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
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
                    <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Stock</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>No products yet</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((p) => (
                      <TableRow
                        key={p._id}
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
                              src={p.images?.[0] || p.imageUrl || undefined}
                              alt=""
                              sx={{
                                width: 44,
                                height: 44,
                                bgcolor: isDark ? 'rgba(245, 211, 0, 0.12)' : 'rgba(230, 194, 0, 0.12)',
                              }}
                            >
                              <PhotoCamera sx={{ fontSize: 22, opacity: 0.6 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {p.title}
                              </Typography>
                              <Typography variant="caption" sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                                {p.category}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{p.sku || '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {p.currency} {p.price.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{p.stock}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={p.isPublished ? 'Published' : 'Draft'}
                            sx={{
                              fontWeight: 700,
                              ...(p.isPublished
                                ? {
                                    background: isDark
                                      ? 'rgba(16, 185, 129, 0.18)'
                                      : 'rgba(16, 185, 129, 0.12)',
                                    color: isDark ? '#34d399' : '#059669',
                                    border: `1px solid ${isDark ? 'rgba(16,185,129,0.35)' : 'rgba(16,185,129,0.25)'}`,
                                  }
                                : {
                                    background: isDark ? 'rgba(59, 130, 246, 0.16)' : 'rgba(59, 130, 246, 0.10)',
                                    color: isDark ? '#93c5fd' : '#2563eb',
                                    border: `1px solid ${isDark ? 'rgba(59,130,246,0.35)' : 'rgba(59,130,246,0.25)'}`,
                                  }),
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => openEdit(p)}
                              sx={{ color: isDark ? '#F5D300' : '#E6C200' }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setDeleting(p);
                                setDeleteOpen(true);
                              }}
                              sx={{ color: '#ef4444' }}
                            >
                              <Delete fontSize="small" />
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
          {editing ? 'Edit product' : 'Add product'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && dialogOpen && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          <Stack spacing={2.25} sx={{ mt: 1 }}>
            <GlassInput fullWidth label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <GlassInput
              fullWidth
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              multiline
              minRows={3}
            />
            <GlassInput fullWidth label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} helperText="Stock Keeping Unit. Optional; must be unique within your catalog" />
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
                aria-label="Product category"
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
                        '&:hover': {
                          background: isDark
                            ? 'linear-gradient(135deg, rgba(245, 211, 0, 0.45) 0%, rgba(184, 160, 0, 0.32) 100%)'
                            : 'linear-gradient(135deg, rgba(230, 194, 0, 0.45) 0%, rgba(184, 160, 0, 0.28) 100%)',
                        },
                      },
                    }}
                  >
                    {cat}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <GlassInput fullWidth label="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} type="number" inputProps={{ min: 0, step: '0.01' }} />
              <GlassInput fullWidth select label="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                {['LKR', 'USD', 'EUR', 'GBP'].map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </GlassInput>
              <GlassInput fullWidth label="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} type="number" inputProps={{ min: 0, step: '1' }} />
            </Stack>
            <Box sx={{ position: 'relative' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                Product images
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#9ca3af' : '#6b7280', display: 'block', mb: 1.5 }}>
                Upload from your device. Up to 5 images, 5 MB each. JPEG, PNG, WebP, or GIF.
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <GlassButton
                    type="button"
                    variant="outlined"
                    disabled={uploadingImages || form.images.length >= 5}
                    onClick={() => {
                      if (uploadingImages || form.images.length >= 5) return;
                      fileInputRef.current?.click();
                    }}
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
                  <Stack direction="row" flexWrap="wrap" gap={1.25} sx={{ pt: 0.5 }}>
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
                          flexShrink: 0,
                        }}
                      >
                        <Box
                          component="img"
                          src={url}
                          alt=""
                          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        <IconButton
                          type="button"
                          size="small"
                          aria-label="Remove image"
                          onClick={(ev) => {
                            ev.preventDefault();
                            ev.stopPropagation();
                            removeImageAt(idx);
                          }}
                          disabled={uploadingImages}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            zIndex: 2,
                            bgcolor: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.95)', color: '#fff' },
                            width: 30,
                            height: 30,
                          }}
                        >
                          <Delete sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="caption" sx={{ color: isDark ? '#6b7280' : '#9ca3af', fontStyle: 'italic' }}>
                    No images yet — use Add from device to upload.
                  </Typography>
                )}
              </Stack>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                aria-label="Upload product images from your device"
                tabIndex={-1}
                onChange={(e) => void handleDeviceImagesChange(e)}
                style={{
                  border: 0,
                  clip: 'rect(0 0 0 0)',
                  clipPath: 'inset(50%)',
                  height: '1px',
                  margin: '-1px',
                  overflow: 'hidden',
                  padding: 0,
                  position: 'absolute',
                  width: '1px',
                  whiteSpace: 'nowrap',
                }}
              />
            </Box>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.08)',
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    disabled={!merchantVerified}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: isDark ? '#F5D300' : '#E6C200' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: isDark ? 'rgba(245, 211, 0, 0.35)' : 'rgba(230, 194, 0, 0.45)',
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Publish listing
                    </Typography>
                    <Typography variant="caption" sx={{ color: isDark ? '#9ca3af' : '#6b7280', display: 'block' }}>
                      {merchantVerified
                        ? 'Published products are visible to buyers in storefront integrations.'
                        : 'Publishing unlocks after administrator verification.'}
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving || uploadingImages} sx={{ textTransform: 'none', fontWeight: 700 }}>
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
        <DialogTitle sx={{ fontWeight: 800 }}>Delete product</DialogTitle>
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

export default MerchantProductsPage;

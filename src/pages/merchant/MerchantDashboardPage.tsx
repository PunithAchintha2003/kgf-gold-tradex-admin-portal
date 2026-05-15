import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  LinearProgress,
  Typography,
  useTheme as useMUITheme,
} from '@mui/material';
import { Inventory2, PublishedWithChanges, EditNote, Verified, Payments, ShoppingCart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { merchantService, MerchantDashboardStats } from '../../services/merchantService';

const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '255, 255, 255';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
};

interface StatTileProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const StatTile: React.FC<StatTileProps> = ({ title, value, icon, color, loading }) => {
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const rgb = hexToRgb(color);

  return (
    <Box
      sx={{
        height: '100%',
        borderRadius: '12px',
        backgroundColor: isDark ? `rgba(${rgb}, 0.1)` : `rgba(${rgb}, 0.05)`,
        border: `1px solid ${isDark ? `rgba(${rgb}, 0.3)` : `rgba(${rgb}, 0.2)`}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        p: 3,
        transition: 'border-color 150ms ease, background-color 150ms ease',
        '&:hover': {
          backgroundColor: isDark ? `rgba(${rgb}, 0.14)` : `rgba(${rgb}, 0.08)`,
          borderColor: isDark ? `rgba(${rgb}, 0.5)` : `rgba(${rgb}, 0.35)`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Typography
          variant="overline"
          sx={{
            fontWeight: 600,
            fontSize: '0.6875rem',
            color: isDark ? '#cccccc' : '#666',
            letterSpacing: '0.08em',
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            backgroundColor: isDark ? `rgba(${rgb}, 0.15)` : `rgba(${rgb}, 0.1)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
          }}
        >
          {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 20 } })}
        </Box>
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: '2rem', lineHeight: 1, color }}>
        {loading ? <CircularProgress size={32} sx={{ color }} /> : value}
      </Typography>
    </Box>
  );
};

const MerchantDashboardPage: React.FC = () => {
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const navigate = useNavigate();
  const [stats, setStats] = useState<MerchantDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const data = await merchantService.getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Could not load merchant dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !stats) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          gap: 2,
        }}
      >
        <CircularProgress size={56} sx={{ color: isDark ? '#F5D300' : '#E6C200' }} />
        <Typography variant="body1" sx={{ color: isDark ? '#cccccc' : '#666' }}>
          Loading your workspace…
        </Typography>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error || 'Something went wrong'}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ minWidth: 0 }}>
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
            Merchant overview
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? '#cccccc' : '#666', maxWidth: 720 }}>
            A focused workspace for catalog health, inventory, and publishing — structured for quick scanning and
            predictable next steps.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => void load(true)}
          disabled={refreshing}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            borderColor: isDark ? 'rgba(245, 211, 0, 0.35)' : 'rgba(230, 194, 0, 0.45)',
            color: isDark ? '#F5D300' : '#B8860B',
            '&:hover': {
              borderColor: isDark ? 'rgba(245, 211, 0, 0.55)' : 'rgba(230, 194, 0, 0.65)',
              background: isDark ? 'rgba(245, 211, 0, 0.06)' : 'rgba(230, 194, 0, 0.06)',
            },
          }}
        >
          Refresh
        </Button>
      </Box>

      {refreshing && (
        <LinearProgress
          sx={{
            mb: 2,
            borderRadius: 1,
            height: 4,
            backgroundColor: isDark ? 'rgba(245, 211, 0, 0.1)' : 'rgba(230, 194, 0, 0.1)',
            '& .MuiLinearProgress-bar': {
              background: isDark
                ? 'linear-gradient(90deg, #F5D300 0%, #FFE55C 100%)'
                : 'linear-gradient(90deg, #E6C200 0%, #E8D89B 100%)',
            },
          }}
        />
      )}

      {!stats.merchantVerified && (
        <Alert
          severity="warning"
          icon={<Verified fontSize="inherit" />}
          sx={{
            mb: 3,
            borderRadius: '12px',
            border: isDark ? '1px solid rgba(245, 211, 0, 0.22)' : '1px solid rgba(230, 194, 0, 0.28)',
            background: isDark ? 'rgba(245, 211, 0, 0.06)' : 'rgba(230, 194, 0, 0.06)',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Verification pending
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.65 }}>
            You can build your catalog as drafts. Publishing live listings is enabled after platform verification by an
            administrator.
          </Typography>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            title="Total SKUs"
            value={stats.totalProducts}
            icon={<Inventory2 />}
            color="#F5D300"
            loading={refreshing}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            title="Live listings"
            value={stats.publishedProducts}
            icon={<PublishedWithChanges />}
            color="#10b981"
            loading={refreshing}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            title="Drafts"
            value={stats.draftProducts}
            icon={<EditNote />}
            color="#3b82f6"
            loading={refreshing}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            title="Inventory units"
            value={stats.inventoryUnits}
            icon={<Inventory2 />}
            color="#8b5cf6"
            loading={refreshing}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            title="Total income (LKR)"
            value={stats.totalIncomeLkr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            icon={<Payments />}
            color="#f59e0b"
            loading={refreshing}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile
            title="Total orders"
            value={stats.totalOrderCount}
            icon={<ShoppingCart />}
            color="#ec4899"
            loading={refreshing}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          borderRadius: '12px',
          backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
          p: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: isDark ? '#F5D300' : '#E6C200' }}>
          Next steps
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/merchant/products')}
              sx={{
                py: 1.5,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                background: isDark
                  ? 'linear-gradient(135deg, #F5D300 0%, #B8A000 100%)'
                  : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
                color: isDark ? '#000' : '#FFF',
                '&:hover': {
                  background: isDark
                    ? 'linear-gradient(135deg, #FFE55C 0%, #F5D300 100%)'
                    : 'linear-gradient(135deg, #E8D89B 0%, #E6C200 100%)',
                },
              }}
            >
              Manage products
            </Button>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/merchant/products')}
              sx={{
                py: 1.5,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                borderColor: isDark ? 'rgba(245, 211, 0, 0.35)' : 'rgba(230, 194, 0, 0.45)',
                color: isDark ? '#F5D300' : '#B8860B',
              }}
            >
              Review drafts & stock
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default MerchantDashboardPage;

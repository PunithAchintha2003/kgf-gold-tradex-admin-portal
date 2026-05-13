import React, { useEffect, useState } from 'react';
import {
  Box,

  Typography,
  CircularProgress,
  Alert,
  Button,
  Grid,
  useTheme as useMUITheme,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  People,
  PersonAdd,
  PersonOff,
  AdminPanelSettings,
  TrendingUp,
  Login,
  TrendingDown,
  Refresh,
  MoreVert,
  ReceiptLong,
  PendingActions,
} from '@mui/icons-material';
import { adminService, DashboardStats } from '../services/adminService';
// GlassCard not used — stat tiles and section containers use direct Box with frontend-matching styles

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; isPositive: boolean };
  loading?: boolean;
}

// Convert hex color to rgb components for rgba() usage
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '255, 255, 255';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend, loading }) => {
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
        overflow: 'hidden',
        transition: 'border-color 150ms ease, background-color 150ms ease',
        '&:hover': {
          backgroundColor: isDark ? `rgba(${rgb}, 0.14)` : `rgba(${rgb}, 0.08)`,
          borderColor: isDark ? `rgba(${rgb}, 0.5)` : `rgba(${rgb}, 0.35)`,
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Title row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 600,
              fontSize: '0.6875rem',
              color: isDark ? '#cccccc' : '#666',
              letterSpacing: '0.08em',
              lineHeight: 1.4,
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
              flexShrink: 0,
            }}
          >
            {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 20 } })}
          </Box>
        </Box>

        {/* Value */}
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '2rem',
            lineHeight: 1,
            mb: 1.5,
            color,
          }}
        >
          {loading ? (
            <CircularProgress size={32} sx={{ color }} />
          ) : (
            value.toLocaleString()
          )}
        </Typography>

        {/* Trend badge */}
        {trend && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              py: 0.25,
              px: 0.75,
              borderRadius: '6px',
              backgroundColor: trend.isPositive
                ? isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)'
                : isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${trend.isPositive
                ? isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'
                : isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
              width: 'fit-content',
            }}
          >
            {trend.isPositive ? (
              <TrendingUp sx={{ fontSize: 14, color: '#10b981' }} />
            ) : (
              <TrendingDown sx={{ fontSize: 14, color: '#ef4444' }} />
            )}
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: trend.isPositive ? '#10b981' : '#ef4444', fontSize: '0.6875rem' }}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const DashboardPage: React.FC = () => {
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: 2 }}>
        <CircularProgress
          size={60}
          sx={{
            color: isDark ? '#F5D300' : '#E6C200',
          }}
        />
        <Typography variant="body1" sx={{ color: isDark ? '#cccccc' : '#666' }}>
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  if (error && !stats) {
    return (
      <Box>
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchStats();
          }}
          sx={{
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
          Retry
        </Button>
      </Box>
    );
  }

  if (!stats) {
    return null;
  }

  // Color palette matched exactly to frontend Price Information / Accuracy Statistics tiles
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <People />,
      color: '#F5D300',            // gold — frontend Price tile
      trend: { value: 12.5, isPositive: true },
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: <PersonAdd />,
      color: '#10b981',            // green — frontend Up/positive tile
      trend: { value: 8.2, isPositive: true },
    },
    {
      title: 'Inactive Users',
      value: stats.inactiveUsers,
      icon: <PersonOff />,
      color: '#ef4444',            // red — frontend Down/negative tile
      trend: { value: -3.1, isPositive: false },
    },
    {
      title: 'Super Admins',
      value: stats.superAdmins,
      icon: <AdminPanelSettings />,
      color: '#8b5cf6',            // purple — frontend Method tile
      trend: null,
    },
    {
      title: 'Regular Users',
      value: stats.regularUsers,
      icon: <People />,
      color: '#3b82f6',            // blue — info
      trend: { value: 15.7, isPositive: true },
    },
    {
      title: 'New Users (30d)',
      value: stats.recentUsers,
      icon: <TrendingUp />,
      color: '#26d4b4',            // teal — frontend Prediction tile
      trend: { value: 22.4, isPositive: true },
    },
    {
      title: 'Logged In Today',
      value: stats.todayLoginUsers,
      icon: <Login />,
      color: '#f59e0b',            // amber — frontend warm accent
      trend: { value: 5.8, isPositive: true },
    },
  ];

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
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
            Dashboard Overview
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? '#cccccc' : '#666' }}>
            Welcome back! Here's what's happening today.
          </Typography>
        </Box>
        <Tooltip title="Refresh data">
          <IconButton
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            sx={{
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
              '&:hover': {
                background: isDark ? 'rgba(245, 211, 0, 0.1)' : 'rgba(230, 194, 0, 0.1)',
                transform: 'rotate(180deg)',
              },
              transition: 'all 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
            }}
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Refreshing Progress */}
      {refreshing && (
        <LinearProgress
          sx={{
            mb: 3,
            borderRadius: '4px',
            height: 4,
            backgroundColor: isDark
              ? 'rgba(245, 211, 0, 0.1)'
              : 'rgba(230, 194, 0, 0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: '4px',
              background: isDark
                ? 'linear-gradient(90deg, #F5D300 0%, #FFE55C 100%)'
                : 'linear-gradient(90deg, #E6C200 0%, #E8D89B 100%)',
            },
          }}
        />
      )}

      {/* Stats Grid */}
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
            <StatCard {...card} loading={refreshing} />
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Box
          sx={{
            borderRadius: '12px',
            backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            p: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 3,
              color: isDark ? '#F5D300' : '#E6C200',
            }}
          >
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {[
              { label: 'Manage Users', icon: <People />, action: '/users', color: '#F5D300' },
              { label: 'View Transactions', icon: <ReceiptLong />, action: '/transactions', color: '#26d4b4' },
              { label: 'Review Withdrawals', icon: <PendingActions />, action: '/withdrawals', color: '#8b5cf6' },
            ].map((item, index) => {
              const rgb = hexToRgb(item.color);
              return (
                <Grid size={{ xs: 12, sm: 4 }} key={index}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={item.icon}
                    onClick={() => window.location.href = item.action}
                    sx={{
                      py: 1.5,
                      borderRadius: '10px',
                      color: item.color,
                      border: `1px solid rgba(${rgb}, 0.3)`,
                      backgroundColor: `rgba(${rgb}, 0.06)`,
                      '&:hover': {
                        border: `1px solid rgba(${rgb}, 0.5)`,
                        backgroundColor: `rgba(${rgb}, 0.12)`,
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;

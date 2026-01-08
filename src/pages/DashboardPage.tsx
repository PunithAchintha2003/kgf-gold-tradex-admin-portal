import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Grid,
  useTheme as useMUITheme,
} from '@mui/material';
import {
  People,
  PersonAdd,
  PersonOff,
  AdminPanelSettings,
  TrendingUp,
  Login,
} from '@mui/icons-material';
import { adminService, DashboardStats } from '../services/adminService';

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => {
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';
  
  return (
    <Card
      sx={{
        backgroundColor: isDark ? '#1a1a1a' : '#f9fafb', // Match price predictor exact
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e5e7eb', // Match price predictor exact
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: isDark
            ? '0 8px 24px rgba(0, 0, 0, 0.4)'
            : '0 8px 24px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography 
              gutterBottom 
              variant="body2"
              sx={{ 
                fontWeight: 500,
                color: isDark ? '#9ca3af' : '#6b7280', // Match price predictor exact
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              component="div"
              sx={{ 
                fontWeight: 700,
                color: isDark ? '#FFFFFF' : '#111827', // Match price predictor exact
              }}
            >
              {value.toLocaleString()}
            </Typography>
          </Box>
          <Box 
            sx={{ 
              color, 
              fontSize: 48,
              opacity: 0.8,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const DashboardPage: React.FC = () => {
  const muiTheme = useMUITheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch stats:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !stats) {
    const isDark = muiTheme.palette.mode === 'dark';
    return (
      <Box>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            backgroundColor: isDark 
              ? 'rgba(239, 68, 68, 0.1)' 
              : 'rgba(239, 68, 68, 0.05)',
            border: isDark 
              ? '1px solid rgba(239, 68, 68, 0.3)' 
              : '1px solid rgba(239, 68, 68, 0.2)',
            color: isDark ? '#fca5a5' : '#ef4444',
          }}
        >
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => {
            setLoading(true);
            setError(null);
            adminService.getDashboardStats()
              .then((data) => {
                setStats(data);
                setError(null);
              })
              .catch((err: any) => {
                setError(err.response?.data?.error || err.message || 'Failed to load dashboard statistics');
              })
              .finally(() => setLoading(false));
          }}
          sx={{
            background: isDark
              ? 'linear-gradient(135deg, #F5D300 0%, #E6C200 100%)'
              : 'linear-gradient(135deg, #d4af37 0%, #c28800 100%)',
            color: isDark ? '#000000' : '#FFFFFF',
            '&:hover': {
              background: isDark
                ? 'linear-gradient(135deg, #FFE55C 0%, #F5D300 100%)'
                : 'linear-gradient(135deg, #c28800 0%, #d4af37 100%)',
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

  return (
    <Box>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          mb: 4, 
          fontWeight: 600,
          color: (theme) => theme.palette.mode === 'dark' ? '#FFFFFF' : '#111827', // Match price predictor exact
        }}
      >
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<People />}
            color="#d4af37"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={<PersonAdd />}
            color="#26d4b4"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Inactive Users"
            value={stats.inactiveUsers}
            icon={<PersonOff />}
            color="#d4183d"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Super Admins"
            value={stats.superAdmins}
            icon={<AdminPanelSettings />}
            color="#d4af37"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Regular Users"
            value={stats.regularUsers}
            icon={<People />}
            color="#c28800"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="New Users (30 days)"
            value={stats.recentUsers}
            icon={<TrendingUp />}
            color="#26d4b4"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Logged In Today"
            value={stats.todayLoginUsers}
            icon={<Login />}
            color="#d4af37"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;


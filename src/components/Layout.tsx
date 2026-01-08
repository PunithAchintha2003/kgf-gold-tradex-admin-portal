import React from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  IconButton,
  Menu,
  MenuItem,
  useTheme as useMUITheme,
} from '@mui/material';
import {
  Dashboard,
  People,
  Logout,
  Brightness4,
  Brightness7,
  AccountCircle,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';

const drawerWidth = 280;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMUITheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Users', icon: <People />, path: '/users' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          backgroundColor: muiTheme.palette.mode === 'dark' ? '#111111' : '#FFFFFF', // Match price predictor navbar exact
          background: mode === 'dark'
            ? '#111111'
            : 'linear-gradient(135deg, #d4af37 0%, #c28800 100%)',
          borderBottom: muiTheme.palette.mode === 'dark' ? '1px solid #1f1f1f' : '1px solid #E0E0E0', // Match price predictor exact
          boxShadow: muiTheme.palette.mode === 'dark' 
            ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              color: mode === 'dark' ? '#F5D300' : '#FFFFFF',
            }}
          >
            KGF Gold TradeX - Admin Portal
          </Typography>

          {/* Theme Toggle */}
          <IconButton
            onClick={toggleTheme}
            sx={{
              color: mode === 'dark' ? '#F5D300' : '#FFFFFF',
              mr: 2,
            }}
            aria-label="toggle theme"
          >
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                color: mode === 'dark' ? '#FFFFFF' : '#FFFFFF',
                mr: 1,
              }}
            >
              {user?.name || 'Admin'}
            </Typography>
            <IconButton
              onClick={handleMenuOpen}
              sx={{ 
                color: mode === 'dark' ? '#F5D300' : '#FFFFFF',
                '&:hover': {
                  backgroundColor: mode === 'dark' 
                    ? 'rgba(245, 211, 0, 0.1)' 
                    : 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <AccountCircle sx={{ fontSize: 32 }} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: {
                  backgroundColor: muiTheme.palette.mode === 'dark' ? '#121212' : '#FFFFFF', // Match price predictor sidebar exact
                  border: muiTheme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E0E0E0', // Match price predictor exact
                  boxShadow: muiTheme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(0, 0, 0, 0.5)'
                    : '0 4px 20px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <MenuItem 
                onClick={handleMenuClose}
                sx={{
                  color: muiTheme.palette.mode === 'dark' ? '#FFFFFF' : '#111827', // Match price predictor exact
                  '&:hover': {
                    backgroundColor: muiTheme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <AccountCircle sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <Divider 
                sx={{
                  borderColor: muiTheme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : '#E0E0E0', // Match price predictor exact
                }}
              />
              <MenuItem 
                onClick={handleLogout}
                sx={{
                  color: muiTheme.palette.mode === 'dark' ? '#FFFFFF' : '#111827', // Match price predictor exact
                  '&:hover': {
                    backgroundColor: muiTheme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: muiTheme.palette.mode === 'dark' ? '#121212' : '#FFFFFF', // Match price predictor sidebar exact
            borderRight: muiTheme.palette.mode === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid #E0E0E0', // Match price predictor exact
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar
          sx={{
            backgroundColor: muiTheme.palette.mode === 'dark' ? '#121212' : '#FFFFFF', // Match price predictor sidebar exact
            background: mode === 'dark'
              ? '#121212'
              : 'linear-gradient(135deg, #d4af37 0%, #c28800 100%)',
            color: mode === 'dark' ? '#FFFFFF' : '#000000', // Match price predictor exact
            minHeight: '64px !important',
          }}
        >
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            Admin Portal
          </Typography>
        </Toolbar>
        <Divider 
          sx={{
            borderColor: muiTheme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : '#E0E0E0', // Match price predictor exact
          }}
        />
        <List sx={{ pt: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: '8px',
                  mb: 0.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path
                      ? mode === 'dark' ? '#F5D300' : '#d4af37'
                      : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    color: location.pathname === item.path
                      ? mode === 'dark' ? '#F5D300' : '#d4af37'
                      : (mode === 'dark' ? '#FFFFFF' : '#111827'), // Match price predictor exact
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Container maxWidth="xl">{children}</Container>
      </Box>
    </Box>
  );
};

export default Layout;

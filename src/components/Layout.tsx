import React, { useState } from 'react';
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
  Badge,
  Avatar,
  Tooltip,
  useMediaQuery,
  useTheme as useMUITheme,
} from '@mui/material';
import {
  Dashboard,
  People,
  ReceiptLong,
  PendingActions,
  Logout,
  AccountCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu as MenuIcon,
  Inventory2,
  Storefront,
  LocalShipping,
  Gavel,
  EmojiEvents,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import { applyGlassEffect } from '../theme/glassmorphism';
import ThemeToggle from './ThemeToggle';
import { MerchantChatLauncher } from './chat/MerchantChatLauncher';
import { MerchantChatSidebar } from './chat/MerchantChatSidebar';

const drawerWidth = 260;
const collapsedDrawerWidth = 72;

interface LayoutProps {
  children: React.ReactNode;
  variant?: 'admin' | 'merchant';
}

const Layout: React.FC<LayoutProps> = ({ children, variant = 'admin' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const { mode } = useTheme();
  const muiTheme = useMUITheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const glassEffect = applyGlassEffect(mode, 'elevated');

  const handleLogout = async () => {
    handleMenuClose();
    await authService.logout();
    // Full navigation to login on this app’s origin (e.g. http://localhost:4001/login in dev).
    window.location.replace(`${window.location.origin}/login`);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const adminMenuItems = [
    { text: 'Transactions', icon: <ReceiptLong />, path: '/transactions', badge: null },
    { text: 'Withdrawals', icon: <PendingActions />, path: '/withdrawals', badge: 3 },
  ];

  const merchantMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/merchant', badge: null },
    { text: 'Products', icon: <Inventory2 />, path: '/merchant/products', badge: null },
    { text: 'Order management', icon: <LocalShipping />, path: '/merchant/orders', badge: null },
    { text: 'Auctions', icon: <Gavel />, path: '/merchant/auctions', badge: null },
    { text: 'Auction management', icon: <EmojiEvents />, path: '/merchant/auctions/management', badge: null },
  ];

  const menuItems = variant === 'merchant' ? merchantMenuItems : adminMenuItems;

  const getPageTitle = () => {
    if (variant === 'merchant') {
      const currentItem = menuItems.find((item) => item.path === location.pathname);
      return currentItem?.text || 'Dashboard';
    }
    if (location.pathname === '/dashboard') return 'Dashboard';
    if (location.pathname === '/users') return 'User management';
    if (location.pathname === '/merchants') return 'Merchants';
    const currentItem = adminMenuItems.find((item) => item.path === location.pathname);
    return currentItem?.text || 'Dashboard';
  };

  const handleMobileMenuItemClick = (path: string) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  const drawerContent = (
    <>
      {/* Sidebar Header */}
      <Toolbar
        sx={{
          minHeight: '70px !important',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
        }}
      >
        {!sidebarCollapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '& img': {
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                },
              }}
            >
              <img src="/src/assets/kgf_logo.svg" alt="KGF Logo" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>
              {variant === 'merchant' ? 'Merchant' : 'Admin'}
            </Typography>
          </Box>
        )}
        {sidebarCollapsed && (
          <Box
            sx={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& img': {
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              },
            }}
          >
            <img src="/src/assets/kgf_logo.svg" alt="KGF Logo" />
          </Box>
        )}
        {!isMobile && (
          <Tooltip title={sidebarCollapsed ? 'Expand' : 'Collapse'}>
            <IconButton
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              sx={{
                background: mode === 'dark'
                  ? 'rgba(245, 211, 0, 0.1)'
                  : 'rgba(230, 194, 0, 0.1)',
                '&:hover': {
                  background: mode === 'dark'
                    ? 'rgba(245, 211, 0, 0.2)'
                    : 'rgba(230, 194, 0, 0.2)',
                },
              }}
            >
              {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>

      <Divider
        sx={{
          borderColor: mode === 'dark'
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.08)',
        }}
      />

      {/* Navigation Menu */}
      <List sx={{ pt: 2, px: 1.5 }} component="nav" aria-label="Main navigation">
        {variant === 'merchant' ? (
          menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={sidebarCollapsed && !isMobile ? item.text : ''} placement="right">
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => (isMobile ? handleMobileMenuItemClick(item.path) : navigate(item.path))}
                  sx={{
                    borderRadius: '12px',
                    py: 1.5,
                    px: sidebarCollapsed && !isMobile ? 2 : 2,
                    justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'flex-start',
                    minHeight: 48,
                    transition: 'all 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                    '&.Mui-selected': {
                      ...glassEffect,
                      background: mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(245, 211, 0, 0.15) 0%, rgba(245, 211, 0, 0.08) 100%)'
                        : 'linear-gradient(135deg, rgba(230, 194, 0, 0.15) 0%, rgba(230, 194, 0, 0.08) 100%)',
                      borderLeft: `4px solid ${mode === 'dark' ? '#F5D300' : '#E6C200'}`,
                      '&:hover': {
                        background: mode === 'dark'
                          ? 'rgba(245, 211, 0, 0.18)'
                          : 'rgba(230, 194, 0, 0.15)',
                      },
                    },
                    '&:hover': {
                      background: mode === 'dark' ? '#1a1a1a' : '#F5F5F5',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: sidebarCollapsed && !isMobile ? 'auto' : 40,
                      color:
                        location.pathname === item.path
                          ? mode === 'dark'
                            ? '#F5D300'
                            : '#E6C200'
                          : mode === 'dark'
                            ? '#cccccc'
                            : '#666',
                    }}
                  >
                    {item.badge ? (
                      <Badge badgeContent={item.badge} color="error">
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  {(!sidebarCollapsed || isMobile) && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.9375rem',
                        fontWeight: location.pathname === item.path ? 600 : 500,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))
        ) : (
          <>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={sidebarCollapsed && !isMobile ? 'Dashboard' : ''} placement="right">
                <ListItemButton
                  selected={location.pathname === '/dashboard'}
                  onClick={() => (isMobile ? handleMobileMenuItemClick('/dashboard') : navigate('/dashboard'))}
                  sx={{
                    borderRadius: '12px',
                    py: 1.5,
                    minHeight: 48,
                    justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'flex-start',
                    transition: 'all 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                    '&.Mui-selected': {
                      ...glassEffect,
                      background: mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(245, 211, 0, 0.15) 0%, rgba(245, 211, 0, 0.08) 100%)'
                        : 'linear-gradient(135deg, rgba(230, 194, 0, 0.15) 0%, rgba(230, 194, 0, 0.08) 100%)',
                      borderLeft: `4px solid ${mode === 'dark' ? '#F5D300' : '#E6C200'}`,
                      '&:hover': {
                        background: mode === 'dark'
                          ? 'rgba(245, 211, 0, 0.18)'
                          : 'rgba(230, 194, 0, 0.15)',
                      },
                    },
                    '&:hover': { background: mode === 'dark' ? '#1a1a1a' : '#F5F5F5' },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: sidebarCollapsed && !isMobile ? 'auto' : 40,
                      color:
                        location.pathname === '/dashboard'
                          ? mode === 'dark'
                            ? '#F5D300'
                            : '#E6C200'
                          : mode === 'dark'
                            ? '#cccccc'
                            : '#666',
                    }}
                  >
                    <Dashboard />
                  </ListItemIcon>
                  {(!sidebarCollapsed || isMobile) && (
                    <ListItemText
                      primary="Dashboard"
                      primaryTypographyProps={{
                        fontSize: '0.9375rem',
                        fontWeight: location.pathname === '/dashboard' ? 600 : 500,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>

            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={sidebarCollapsed && !isMobile ? 'User management' : ''} placement="right">
                <ListItemButton
                  selected={location.pathname === '/users'}
                  onClick={() => (isMobile ? handleMobileMenuItemClick('/users') : navigate('/users'))}
                  sx={{
                    borderRadius: '12px',
                    py: 1.5,
                    minHeight: 48,
                    justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'flex-start',
                    transition: 'all 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                    '&.Mui-selected': {
                      ...glassEffect,
                      background: mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(245, 211, 0, 0.15) 0%, rgba(245, 211, 0, 0.08) 100%)'
                        : 'linear-gradient(135deg, rgba(230, 194, 0, 0.15) 0%, rgba(230, 194, 0, 0.08) 100%)',
                      borderLeft: `4px solid ${mode === 'dark' ? '#F5D300' : '#E6C200'}`,
                      '&:hover': {
                        background: mode === 'dark'
                          ? 'rgba(245, 211, 0, 0.18)'
                          : 'rgba(230, 194, 0, 0.15)',
                      },
                    },
                    '&:hover': { background: mode === 'dark' ? '#1a1a1a' : '#F5F5F5' },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: sidebarCollapsed && !isMobile ? 'auto' : 40,
                      color:
                        location.pathname === '/users'
                          ? mode === 'dark'
                            ? '#F5D300'
                            : '#E6C200'
                          : mode === 'dark'
                            ? '#cccccc'
                            : '#666',
                    }}
                  >
                    <People />
                  </ListItemIcon>
                  {(!sidebarCollapsed || isMobile) && (
                    <ListItemText
                      primary="User management"
                      primaryTypographyProps={{
                        fontSize: '0.9375rem',
                        fontWeight: location.pathname === '/users' ? 600 : 500,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>

            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={sidebarCollapsed && !isMobile ? 'Merchants' : ''} placement="right">
                <ListItemButton
                  selected={location.pathname === '/merchants'}
                  onClick={() => (isMobile ? handleMobileMenuItemClick('/merchants') : navigate('/merchants'))}
                  sx={{
                    borderRadius: '12px',
                    py: 1.5,
                    minHeight: 48,
                    justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'flex-start',
                    transition: 'all 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                    '&.Mui-selected': {
                      ...glassEffect,
                      background: mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(245, 211, 0, 0.15) 0%, rgba(245, 211, 0, 0.08) 100%)'
                        : 'linear-gradient(135deg, rgba(230, 194, 0, 0.15) 0%, rgba(230, 194, 0, 0.08) 100%)',
                      borderLeft: `4px solid ${mode === 'dark' ? '#F5D300' : '#E6C200'}`,
                      '&:hover': {
                        background: mode === 'dark'
                          ? 'rgba(245, 211, 0, 0.18)'
                          : 'rgba(230, 194, 0, 0.15)',
                      },
                    },
                    '&:hover': { background: mode === 'dark' ? '#1a1a1a' : '#F5F5F5' },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: sidebarCollapsed && !isMobile ? 'auto' : 40,
                      color:
                        location.pathname === '/merchants'
                          ? mode === 'dark'
                            ? '#F5D300'
                            : '#E6C200'
                          : mode === 'dark'
                            ? '#cccccc'
                            : '#666',
                    }}
                  >
                    <Storefront />
                  </ListItemIcon>
                  {(!sidebarCollapsed || isMobile) && (
                    <ListItemText
                      primary="Merchants"
                      primaryTypographyProps={{
                        fontSize: '0.9375rem',
                        fontWeight: location.pathname === '/merchants' ? 600 : 500,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>

            {adminMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={sidebarCollapsed && !isMobile ? item.text : ''} placement="right">
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => (isMobile ? handleMobileMenuItemClick(item.path) : navigate(item.path))}
                    sx={{
                      borderRadius: '12px',
                      py: 1.5,
                      px: sidebarCollapsed && !isMobile ? 2 : 2,
                      justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'flex-start',
                      minHeight: 48,
                      transition: 'all 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                      '&.Mui-selected': {
                        ...glassEffect,
                        background: mode === 'dark'
                          ? 'linear-gradient(135deg, rgba(245, 211, 0, 0.15) 0%, rgba(245, 211, 0, 0.08) 100%)'
                          : 'linear-gradient(135deg, rgba(230, 194, 0, 0.15) 0%, rgba(230, 194, 0, 0.08) 100%)',
                        borderLeft: `4px solid ${mode === 'dark' ? '#F5D300' : '#E6C200'}`,
                        '&:hover': {
                          background: mode === 'dark'
                            ? 'rgba(245, 211, 0, 0.18)'
                            : 'rgba(230, 194, 0, 0.15)',
                        },
                      },
                      '&:hover': {
                        background: mode === 'dark' ? '#1a1a1a' : '#F5F5F5',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: sidebarCollapsed && !isMobile ? 'auto' : 40,
                        color:
                          location.pathname === item.path
                            ? mode === 'dark'
                              ? '#F5D300'
                              : '#E6C200'
                            : mode === 'dark'
                              ? '#cccccc'
                              : '#666',
                      }}
                    >
                      {item.badge ? (
                        <Badge badgeContent={item.badge} color="error">
                          {item.icon}
                        </Badge>
                      ) : (
                        item.icon
                      )}
                    </ListItemIcon>
                    {(!sidebarCollapsed || isMobile) && (
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: '0.9375rem',
                          fontWeight: location.pathname === item.path ? 600 : 500,
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </>
        )}
      </List>
    </>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: mode === 'dark' ? '#000000' : '#FFFFFF',
      }}
    >
      {/* Glass AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: isMobile ? '100%' : `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)`,
          ml: isMobile ? 0 : `${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px`,
          transition: 'width 750ms cubic-bezier(0.25, 0.1, 0.25, 1), margin-left 750ms cubic-bezier(0.25, 0.1, 0.25, 1)',
          backgroundColor: mode === 'dark' ? 'rgba(17, 17, 17, 0.92)' : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          borderBottom: mode === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.08)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: 'none',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: '64px', sm: '70px' }, px: { xs: 2, sm: 3 } }}>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              sx={{
                mr: 2,
                color: mode === 'dark' ? '#F5D300' : '#E6C200',
                background: 'transparent',
                '&:hover': {
                  background: mode === 'dark' ? '#1a1a1a' : '#F5F5F5',
                },
              }}
              aria-label="open drawer"
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Page Title */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, #F5D300 0%, #FFE55C 100%)'
                  : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {getPageTitle()}
            </Typography>
          </Box>

          {/* Theme Toggle */}
          <ThemeToggle disableHoverAnimation sx={{ mr: { xs: 1, sm: 2 } }} />

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            {!isMobile && (
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-end' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: '0.875rem' }}>
                  {user?.name || 'Admin User'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: mode === 'dark' ? '#cccccc' : '#666',
                    textTransform: 'uppercase',
                    fontSize: '0.6875rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  {variant === 'merchant'
                    ? user?.merchantVerified
                      ? 'Verified seller'
                      : 'Verification pending'
                    : 'Super Admin'}
                </Typography>
              </Box>
            )}
            <Tooltip title="Account">
              <IconButton
                onClick={handleMenuOpen}
                sx={{
                  p: 0,
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                  transition: 'transform 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 36, sm: 40 },
                    height: { xs: 36, sm: 40 },
                    background: mode === 'dark'
                      ? 'linear-gradient(135deg, #F5D300 0%, #FF8F00 100%)'
                      : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
                    border: mode === 'dark'
                      ? '2px solid rgba(245, 211, 0, 0.3)'
                      : '2px solid rgba(230, 194, 0, 0.3)',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 700,
                    color: mode === 'dark' ? '#000' : '#FFF',
                  }}
                >
                  {user?.name?.charAt(0) || 'A'}
                </Avatar>
              </IconButton>
            </Tooltip>
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
              sx={{
                '& .MuiPaper-root': {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: '12px',
                  ...glassEffect,
                },
              }}
            >
              <MenuItem
                onClick={handleMenuClose}
                sx={{
                  borderRadius: '8px',
                  m: 0.5,
                  py: 1.5,
                }}
              >
                <AccountCircle sx={{ mr: 1.5 }} />
                Profile
              </MenuItem>
              <MenuItem
                onClick={handleMenuClose}
                sx={{
                  borderRadius: '8px',
                  m: 0.5,
                  py: 1.5,
                }}
              >
                <Settings sx={{ mr: 1.5 }} />
                Settings
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                onClick={handleLogout}
                sx={{
                  borderRadius: '8px',
                  m: 0.5,
                  py: 1.5,
                  color: '#ef4444',
                  '&:hover': {
                    background: 'rgba(239, 68, 68, 0.1)',
                  },
                }}
              >
                <Logout sx={{ mr: 1.5 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          sx={{
            width: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: sidebarCollapsed ? collapsedDrawerWidth : drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: mode === 'dark' ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(40px) saturate(160%)',
              WebkitBackdropFilter: 'blur(40px) saturate(160%)',
              border: 'none',
              borderRight: mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.08)'
                : '1px solid rgba(0, 0, 0, 0.1)',
              transition: 'width 750ms cubic-bezier(0.25, 0.1, 0.25, 1)',
              overflowX: 'hidden',
            },
          }}
          variant="permanent"
          anchor="left"
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              backgroundColor: mode === 'dark' ? 'rgba(18, 18, 18, 0.98)' : 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(40px) saturate(160%)',
              WebkitBackdropFilter: 'blur(40px) saturate(160%)',
              border: 'none',
              borderRight: mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.08)'
                : '1px solid rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: isMobile ? '100%' : `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)`,
          minHeight: '100vh',
          mt: { xs: '64px', sm: '70px' },
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            maxWidth: { xl: '1600px' },
            px: { xs: 0, sm: 2 },
          }}
        >
          {children}
        </Container>
      </Box>

      {variant === 'merchant' && (
        <>
          <MerchantChatLauncher />
          <MerchantChatSidebar />
        </>
      )}
    </Box>
  );
};

export default Layout;

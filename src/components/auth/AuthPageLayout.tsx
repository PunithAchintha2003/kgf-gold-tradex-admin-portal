import React from 'react';
import {
  Box,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Tooltip,
} from '@mui/material';
import { CheckCircleOutline, Security, ArrowBack } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../ThemeToggle';

export interface AuthPageLayoutProps {
  brandHeading: string;
  brandDescription: string;
  features: string[];
  noticeTitle: string;
  noticeDescription: string;
  onBack: () => void;
  children: React.ReactNode;
}

export const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({
  brandHeading,
  brandDescription,
  features,
  noticeTitle,
  noticeDescription,
  onBack,
  children,
}) => {
  const { mode } = useTheme();
  const muted = mode === 'dark' ? '#cccccc' : '#5F6368';
  const surfaceMuted = mode === 'dark' ? '#cccccc' : '#3C4043';

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        position: 'relative',
        overflow: 'auto',
        backgroundColor: mode === 'dark' ? '#000000' : '#FFFFFF',
      }}
    >
      <Tooltip title="Back to sign in">
        <Button
          type="button"
          onClick={onBack}
          startIcon={<ArrowBack />}
          sx={{
            position: 'absolute',
            top: { xs: 16, sm: 24 },
            left: { xs: 16, sm: 24 },
            zIndex: 10,
            minHeight: 44,
            px: 1.5,
            color: mode === 'dark' ? '#F5D300' : '#B8860B',
            background: mode === 'dark' ? 'rgba(245, 211, 0, 0.1)' : 'rgba(230, 194, 0, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border:
              mode === 'dark'
                ? '1px solid rgba(245, 211, 0, 0.2)'
                : '1px solid rgba(230, 194, 0, 0.2)',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              background: mode === 'dark' ? 'rgba(245, 211, 0, 0.2)' : 'rgba(230, 194, 0, 0.2)',
            },
          }}
          aria-label="Back to sign in"
        >
          Back
        </Button>
      </Tooltip>

      <ThemeToggle
        disableHoverAnimation
        sx={{
          position: 'absolute',
          top: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: 10,
        }}
      />

      <Box
        component="section"
        aria-labelledby="auth-brand-heading"
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: { md: '1 1 46%' },
          maxWidth: { md: 520 },
          px: { xs: 3, sm: 4, md: 6, lg: 8 },
          py: { xs: 4, md: 8 },
          pt: { xs: 10, md: 8 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          borderRight: {
            md: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)'}`,
          },
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: { xs: 72, sm: 80 },
              height: { xs: 72, sm: 80 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& img': { width: '100%', height: '100%', objectFit: 'contain' },
            }}
          >
            <img src="/src/assets/kgf_logo.svg" alt="KGF Gold TradeX logo" />
          </Box>
        </Box>

        <Stack spacing={3} sx={{ width: '100%', maxWidth: 440, mx: 'auto' }}>
          <Box sx={{ width: '100%' }}>
            <Typography
              id="auth-brand-heading"
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                lineHeight: 1.25,
                mb: 1,
                letterSpacing: '-0.02em',
                color: mode === 'dark' ? '#F0F0F0' : '#1A1A1A',
              }}
            >
              {brandHeading}
            </Typography>
            <Typography
              component="p"
              variant="body2"
              sx={{ color: muted, lineHeight: 1.6, fontWeight: 500 }}
            >
              {brandDescription}
            </Typography>
          </Box>

          <Typography variant="subtitle2" sx={{ color: surfaceMuted, fontWeight: 600 }}>
            What you can do here
          </Typography>
          <List dense disablePadding sx={{ py: 0 }}>
            {features.map((text) => (
              <ListItem key={text} disableGutters sx={{ py: 0.5, alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}>
                  <CheckCircleOutline
                    sx={{ fontSize: 20, color: mode === 'dark' ? '#F5D300' : '#B8860B' }}
                    aria-hidden
                  />
                </ListItemIcon>
                <ListItemText
                  primary={text}
                  primaryTypographyProps={{
                    variant: 'body2',
                    sx: { color: mode === 'dark' ? '#D0D0D0' : '#424242', lineHeight: 1.6 },
                  }}
                />
              </ListItem>
            ))}
          </List>

          <Box
            role="region"
            aria-label="Account notice"
            sx={{
              p: 2,
              borderRadius: 2,
              background: mode === 'dark' ? 'rgba(245, 211, 0, 0.06)' : 'rgba(230, 194, 0, 0.08)',
              border: `1px solid ${mode === 'dark' ? 'rgba(245, 211, 0, 0.18)' : 'rgba(230, 194, 0, 0.22)'}`,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Security
                sx={{
                  fontSize: 22,
                  color: mode === 'dark' ? '#F5D300' : '#B8860B',
                  mt: 0.125,
                  flexShrink: 0,
                }}
                aria-hidden
              />
              <Box>
                <Typography
                  variant="subtitle2"
                  component="p"
                  sx={{
                    fontWeight: 700,
                    color: mode === 'dark' ? '#F5D300' : '#7A5C00',
                    mb: 0.5,
                  }}
                >
                  {noticeTitle}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: mode === 'dark' ? '#B8B8B8' : '#4A4A4A',
                    lineHeight: 1.65,
                  }}
                >
                  {noticeDescription}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box
        component="section"
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: { md: '1 1 54%' },
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'center',
          px: { xs: 3, sm: 4, md: 6 },
          py: { xs: 3, md: 8 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

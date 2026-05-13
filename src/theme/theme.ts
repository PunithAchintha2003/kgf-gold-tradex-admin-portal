import { createTheme, ThemeOptions } from '@mui/material/styles';
import { applyGlassEffect, glassGradients, glassButtonStates, glassFocusRing } from './glassmorphism';

// Brand colors — exactly matched to kgf-gold-tradex-frontend Gold Price Prediction page
const brandColors = {
  gold: {
    300: '#FFE55C',
    400: '#FFE033',
    500: '#F5D300', // Primary (light mode) — frontend: palette.primary.main light
    600: '#E6C200', // Dark variant — frontend: palette.primary.dark light
    700: '#B8A000',
  },
  amber: {
    300: '#FFE55C',
    400: '#FFE033',
    500: '#F5D300', // Primary (dark mode) — frontend: palette.primary.main dark
    600: '#E6C200',
    700: '#B8A000',
  },
  teal: {
    main: '#26d4b4',   // frontend secondary dark
    light: '#5DF2D9',
    dark: '#00A693',
    light2: '#00BFA5', // frontend secondary light
  },
};

export const createAppTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';
  const glass = applyGlassEffect(mode, 'primary');
  const glassElevated = applyGlassEffect(mode, 'elevated');
  const glassSubtle = applyGlassEffect(mode, 'subtle');

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: isDark ? brandColors.amber[500] : brandColors.gold[500],
        light: isDark ? brandColors.amber[300] : brandColors.gold[300],
        dark: isDark ? brandColors.amber[600] : brandColors.gold[600],
        contrastText: '#000000',
      },
      secondary: {
        // Teal accent — matches frontend secondary exactly
        main: isDark ? brandColors.teal.main : brandColors.teal.light2,
        light: isDark ? brandColors.teal.light : brandColors.teal.main,
        dark: brandColors.teal.dark,
        contrastText: '#000000',
      },
      background: {
        // Matches frontend exactly: #000000 default, #111111 paper
        default: isDark ? '#000000' : '#FFFFFF',
        paper: isDark ? '#111111' : '#F5F5F5',
      },
      text: {
        primary: isDark ? '#FFFFFF' : '#000000',
        secondary: isDark ? '#cccccc' : '#666666', // matches frontend exactly
      },
      divider: isDark ? '#1f1f1f' : '#E0E0E0', // matches frontend exactly
      success: { main: '#10b981', light: '#34d399', dark: '#059669' },
      error:   { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
      warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
      info:    { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
    },
    typography: {
      fontFamily: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: 16,
      h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
      h2: { fontSize: '2rem',   fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3 },
      h3: { fontSize: '1.75rem',fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3 },
      h4: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '0em',     lineHeight: 1.4 },
      h5: { fontSize: '1.25rem',fontWeight: 600, letterSpacing: '0em',     lineHeight: 1.4 },
      h6: { fontSize: '1.125rem',fontWeight: 600, letterSpacing: '0em',    lineHeight: 1.4 },
      body1: { fontSize: '1rem',     lineHeight: 1.5,  letterSpacing: '0em' },
      body2: { fontSize: '0.875rem', lineHeight: 1.43, letterSpacing: '0em' },
      button:  { textTransform: 'none', fontWeight: 500, letterSpacing: '0.02em' },
      caption: { fontSize: '0.75rem', lineHeight: 1.33, letterSpacing: '0.03em' },
      overline:{ fontSize: '0.75rem', fontWeight: 600,  letterSpacing: '0.08em', lineHeight: 2.66, textTransform: 'uppercase' },
    },
    spacing: 8,
    shape: { borderRadius: 12 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: { scrollBehavior: 'smooth' },
          body: {
            // Pure #000000 background — matches frontend exactly
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
            background: isDark ? '#000000' : '#FFFFFF',
            color: isDark ? '#FFFFFF' : '#000000',
            transition: 'background 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
            '&::-webkit-scrollbar': { width: '8px', height: '8px' },
            '&::-webkit-scrollbar-track': {
              background: isDark ? '#111111' : 'rgba(0,0,0,0.05)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: isDark
                ? `linear-gradient(180deg, ${brandColors.amber[500]} 0%, ${brandColors.amber[700]} 100%)`
                : `linear-gradient(180deg, ${brandColors.gold[400]} 0%, ${brandColors.gold[600]} 100%)`,
              borderRadius: '4px',
            },
          },
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: isDark
              ? `${brandColors.amber[500]} #111111`
              : `${brandColors.gold[500]} rgba(0,0,0,0.05)`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            // Glass surface on top of #000000 page bg
            // Background matches frontend card: #111111 family with blur
            ...glassElevated,
            borderRadius: '16px',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            ...glass,
            borderRadius: '12px',
            transition: 'background 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          },
          elevation1: { ...glassSubtle },
          elevation2: { ...glass },
          elevation4: { ...glassElevated },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 500,
            padding: '10px 24px',
            fontSize: '0.9375rem',
            transition: 'transform 100ms cubic-bezier(0.25, 0.1, 0.25, 1), background 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
            '&:focus-visible': isDark ? glassFocusRing.dark : glassFocusRing.light,
          },
          contained: {
            '&:hover': { ...glassButtonStates[mode].hover },
            '&:active': { ...glassButtonStates[mode].active },
          },
          containedPrimary: {
            background: isDark
              ? `linear-gradient(135deg, ${brandColors.amber[500]} 0%, ${brandColors.amber[600]} 100%)`
              : `linear-gradient(135deg, ${brandColors.gold[500]} 0%, ${brandColors.gold[600]} 100%)`,
            color: '#000000',
            fontWeight: 600,
            border: isDark
              ? '1px solid rgba(245, 211, 0, 0.5)'
              : '1px solid rgba(230, 194, 0, 0.5)',
            '&:hover': {
              background: isDark
                ? `linear-gradient(135deg, ${brandColors.amber[400]} 0%, ${brandColors.amber[500]} 100%)`
                : `linear-gradient(135deg, ${brandColors.gold[400]} 0%, ${brandColors.gold[500]} 100%)`,
              transform: 'translateY(-1px)',
            },
          },
          outlined: {
            border: isDark
              ? '1px solid rgba(245, 211, 0, 0.4)'
              : '1px solid rgba(230, 194, 0, 0.4)',
            '&:hover': {
              border: isDark
                ? '1px solid rgba(245, 211, 0, 0.7)'
                : '1px solid rgba(230, 194, 0, 0.7)',
              background: isDark
                ? 'rgba(245, 211, 0, 0.06)'
                : 'rgba(230, 194, 0, 0.06)',
            },
          },
          text: {
            '&:hover': {
              background: isDark
                ? 'rgba(245, 211, 0, 0.06)'
                : 'rgba(230, 194, 0, 0.06)',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: isDark ? '#FFFFFF' : '#000000',
            transition: 'background 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
            '&:hover': {
              background: isDark ? '#1a1a1a' : '#F5F5F5',
            },
            '&:focus-visible': isDark ? glassFocusRing.dark : glassFocusRing.light,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            // Sidebar: glass surface on #000000 bg — matches frontend #121212 sidebar
            backgroundColor: isDark ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(40px) saturate(160%)',
            WebkitBackdropFilter: 'blur(40px) saturate(160%)',
            border: 'none',
            borderRight: isDark
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            transition: 'width 750ms cubic-bezier(0.25, 0.1, 0.25, 1)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            // Navbar: glass surface — matches frontend #111111 navbar
            backgroundColor: isDark ? 'rgba(17, 17, 17, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: 'none',
            borderBottom: isDark
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: 'none',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: '10px',
            margin: '2px 8px',
            padding: '10px 16px',
            transition: 'all 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
            '&.Mui-selected': {
              background: isDark
                ? 'rgba(245, 211, 0, 0.12)'
                : 'rgba(230, 194, 0, 0.1)',
              color: isDark ? brandColors.amber[500] : brandColors.gold[600],
              fontWeight: 600,
              borderLeft: `3px solid ${isDark ? brandColors.amber[500] : brandColors.gold[500]}`,
              '&:hover': {
                background: isDark
                  ? 'rgba(245, 211, 0, 0.18)'
                  : 'rgba(230, 194, 0, 0.15)',
              },
            },
            '&:hover': {
              background: isDark ? '#1a1a1a' : '#F5F5F5',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              ...glassSubtle,
              borderRadius: '10px',
              transition: 'all 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
              '& fieldset': {
                borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                transition: 'border-color 150ms',
              },
              '&:hover fieldset': {
                borderColor: isDark ? 'rgba(245, 211, 0, 0.5)' : 'rgba(230, 194, 0, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: isDark ? brandColors.amber[500] : brandColors.gold[500],
                borderWidth: '2px',
              },
              '&.Mui-focused': isDark ? glassFocusRing.dark : glassFocusRing.light,
            },
            '& .MuiInputLabel-root': {
              color: isDark ? '#cccccc' : '#6b7280',
              '&.Mui-focused': {
                color: isDark ? brandColors.amber[500] : brandColors.gold[600],
                fontWeight: 500,
              },
            },
            '& .MuiInputBase-input': {
              color: isDark ? '#FFFFFF' : '#000000',
            },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              backgroundColor: isDark ? 'rgba(17, 17, 17, 0.95)' : 'rgba(249, 250, 251, 0.95)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              color: isDark ? '#cccccc' : '#6b7280',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: isDark
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid #E0E0E0',
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
            '&:hover': {
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            },
            '&:nth-of-type(even)': {
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            color: isDark ? '#FFFFFF' : '#000000',
            borderBottom: isDark
              ? '1px solid rgba(255, 255, 255, 0.06)'
              : '1px solid #E0E0E0',
            padding: '16px',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            ...glassElevated,
            borderRadius: '16px',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.12)'
              : '1px solid rgba(0, 0, 0, 0.12)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            ...glassSubtle,
            borderRadius: '8px',
            fontWeight: 500,
            transition: 'all 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          },
          colorPrimary: {
            background: isDark
              ? 'rgba(245, 211, 0, 0.12)'
              : 'rgba(230, 194, 0, 0.1)',
            border: isDark
              ? '1px solid rgba(245, 211, 0, 0.35)'
              : '1px solid rgba(230, 194, 0, 0.35)',
            color: isDark ? brandColors.amber[500] : brandColors.gold[600],
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            ...glass,
            borderRadius: '12px',
            fontWeight: 500,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
            color: isDark ? '#FFFFFF' : '#000000',
            fontSize: '0.8125rem',
            borderRadius: '8px',
            padding: '6px 10px',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            margin: '2px 4px',
            transition: 'all 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
            '&:hover': {
              background: isDark ? '#1a1a1a' : '#F5F5F5',
            },
            '&.Mui-selected': {
              background: isDark
                ? 'rgba(245, 211, 0, 0.12)'
                : 'rgba(230, 194, 0, 0.1)',
              '&:hover': {
                background: isDark
                  ? 'rgba(245, 211, 0, 0.18)'
                  : 'rgba(230, 194, 0, 0.15)',
              },
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: '4px',
            height: '4px',
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          },
          bar: {
            borderRadius: '4px',
            background: isDark
              ? `linear-gradient(90deg, ${brandColors.amber[500]} 0%, ${brandColors.amber[300]} 100%)`
              : `linear-gradient(90deg, ${brandColors.gold[500]} 0%, ${brandColors.gold[300]} 100%)`,
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            background: isDark
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(0,0,0,0.06)',
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};

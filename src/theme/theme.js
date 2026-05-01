import { createTheme } from '@mui/material/styles';
export const createAppTheme = (mode) => {
    const isDark = mode === 'dark';
    const themeOptions = {
        palette: {
            mode,
            primary: {
                main: isDark ? '#F5D300' : '#E6C200', // Gold color
                light: isDark ? '#FFE55C' : '#F5D300',
                dark: isDark ? '#E6C200' : '#B8A000',
                contrastText: isDark ? '#000000' : '#FFFFFF',
            },
            secondary: {
                main: isDark ? '#26d4b4' : '#00BFA5', // Prediction green
                light: isDark ? '#5DF2D9' : '#26d4b4',
                dark: isDark ? '#00A693' : '#00A693',
                contrastText: isDark ? '#000000' : '#FFFFFF',
            },
            background: {
                default: isDark ? '#000000' : '#FFFFFF', // Match price predictor exact
                paper: isDark ? '#111111' : '#F5F5F5', // Match price predictor exact
            },
            text: {
                primary: isDark ? '#FFFFFF' : '#000000', // Match price predictor exact
                secondary: isDark ? '#cccccc' : '#666666', // Match price predictor exact
            },
            divider: isDark ? '#1f1f1f' : '#E0E0E0', // Match price predictor exact
        },
        typography: {
            fontFamily: "'Segoe UI', Roboto, sans-serif",
            h1: {
                fontSize: '2.8rem',
                fontWeight: 700,
            },
            h2: {
                fontSize: '2.2rem',
                fontWeight: 600,
            },
            h3: {
                fontSize: '1.8rem',
                fontWeight: 600,
            },
            h4: {
                fontSize: '1.4rem',
                fontWeight: 500,
            },
            h5: {
                fontSize: '1.2rem',
                fontWeight: 500,
            },
            h6: {
                fontSize: '1rem',
                fontWeight: 500,
            },
            body1: {
                fontSize: '1rem',
                lineHeight: 1.5,
            },
            body2: {
                fontSize: '0.875rem',
                lineHeight: 1.43,
            },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor: isDark ? '#000000' : '#FFFFFF',
                        color: isDark ? '#FFFFFF' : '#000000',
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f1f1',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: isDark ? 'rgba(255, 255, 255, 0.3)' : '#888',
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            background: isDark ? 'rgba(255, 255, 255, 0.5)' : '#666',
                        },
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundColor: isDark ? '#1a1a1a' : '#f9fafb', // Match price predictor card exact
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e5e7eb', // Match price predictor exact
                        borderRadius: '12px',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 500,
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        color: isDark ? '#FFFFFF' : '#000000',
                    },
                },
            },
            MuiSvgIcon: {
                styleOverrides: {
                    root: {
                        color: isDark ? '#FFFFFF' : '#000000',
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundColor: isDark ? '#121212' : '#FFFFFF', // Match price predictor sidebar exact
                        borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E0E0E0', // Match price predictor exact
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: isDark ? '#111111' : '#FFFFFF', // Match price predictor exact
                        boxShadow: isDark
                            ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                            : '0 2px 8px rgba(0, 0, 0, 0.1)',
                    },
                },
            },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        borderRadius: '8px',
                        margin: '4px 8px',
                        '&.Mui-selected': {
                            backgroundColor: isDark ? 'rgba(245, 211, 0, 0.2)' : 'rgba(212, 175, 55, 0.1)',
                            color: isDark ? '#F5D300' : '#d4af37',
                            '&:hover': {
                                backgroundColor: isDark ? 'rgba(245, 211, 0, 0.3)' : 'rgba(212, 175, 55, 0.15)',
                            },
                        },
                        '&:hover': {
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                        },
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF',
                            '& fieldset': {
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb',
                            },
                            '&:hover fieldset': {
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: isDark ? '#F5D300' : '#E6C200',
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: isDark ? '#9ca3af' : '#6b7280',
                            '&.Mui-focused': {
                                color: isDark ? '#F5D300' : '#E6C200',
                            },
                        },
                        '& .MuiInputBase-input': {
                            color: isDark ? '#FFFFFF' : '#111827',
                        },
                    },
                },
            },
            MuiTableHead: {
                styleOverrides: {
                    root: {
                        '& .MuiTableCell-root': {
                            backgroundColor: isDark ? 'rgba(26, 26, 26, 0.95)' : 'rgba(249, 250, 251, 0.95)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            color: isDark ? '#d1d5db' : '#6b7280',
                            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e5e7eb',
                        },
                    },
                },
            },
            MuiTableRow: {
                styleOverrides: {
                    root: {
                        '&:hover': {
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                        },
                    },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        color: isDark ? '#FFFFFF' : '#111827',
                        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e5e7eb',
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        backgroundColor: isDark ? '#121212' : '#FFFFFF',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E0E0E0',
                        boxShadow: isDark
                            ? '0 8px 32px rgba(0, 0, 0, 0.5)'
                            : '0 8px 32px rgba(0, 0, 0, 0.15)',
                    },
                },
            },
            MuiDialogTitle: {
                styleOverrides: {
                    root: {
                        color: isDark ? '#FFFFFF' : '#111827',
                        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E0E0E0',
                    },
                },
            },
            MuiDialogContent: {
                styleOverrides: {
                    root: {
                        color: isDark ? '#FFFFFF' : '#111827',
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e5e7eb',
                    },
                    colorPrimary: {
                        backgroundColor: isDark ? 'rgba(245, 211, 0, 0.1)' : 'rgba(245, 211, 0, 0.05)',
                        border: isDark ? '1px solid rgba(245, 211, 0, 0.3)' : '1px solid rgba(245, 211, 0, 0.2)',
                        color: isDark ? '#F5D300' : '#E6C200',
                    },
                    colorSuccess: {
                        backgroundColor: isDark ? 'rgba(38, 212, 180, 0.1)' : 'rgba(38, 212, 180, 0.05)',
                        border: isDark ? '1px solid rgba(38, 212, 180, 0.3)' : '1px solid rgba(38, 212, 180, 0.2)',
                        color: isDark ? '#26d4b4' : '#00BFA5',
                    },
                    colorError: {
                        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                        border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(239, 68, 68, 0.2)',
                        color: isDark ? '#fca5a5' : '#ef4444',
                    },
                },
            },
            MuiAlert: {
                styleOverrides: {
                    root: {
                        backgroundColor: isDark ? '#1a1a1a' : '#f9fafb',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e5e7eb',
                        color: isDark ? '#FFFFFF' : '#111827',
                    },
                    standardError: {
                        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                        border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(239, 68, 68, 0.2)',
                        color: isDark ? '#fca5a5' : '#ef4444',
                    },
                },
            },
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        color: isDark ? '#FFFFFF' : '#111827',
                        '&:hover': {
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                        },
                    },
                },
            },
            MuiTablePagination: {
                styleOverrides: {
                    root: {
                        color: isDark ? '#FFFFFF' : '#111827',
                        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e5e7eb',
                    },
                },
            },
            MuiSelect: {
                styleOverrides: {
                    root: {
                        color: isDark ? '#FFFFFF' : '#111827',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? '#F5D300' : '#E6C200',
                        },
                    },
                },
            },
        },
    };
    return createTheme(themeOptions);
};

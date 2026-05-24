import React from 'react';
import {
  Drawer,
  Box,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme as useMUITheme,
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface RightSidebarProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
  width?: number;
  footer?: React.ReactNode;
}

/**
 * Right-anchored drawer sidebar — matches kgf-gold-tradex-frontend chat sidebar layout.
 */
const RightSidebar: React.FC<RightSidebarProps> = ({
  open,
  onClose,
  children,
  title = 'Sidebar',
  width = 420,
  footer,
}) => {
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const border = isDark ? 'rgba(255, 255, 255, 0.1)' : '#E0E0E0';
  const bg = isDark ? '#121212' : '#FFFFFF';
  const text = isDark ? '#FFFFFF' : '#000000';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: '85%', md: width },
          maxWidth: { xs: '100vw', sm: '90vw', md: width },
          backgroundColor: bg,
          borderLeft: `1px solid ${border}`,
          boxShadow: isDark ? '-4px 0 20px rgba(0, 0, 0, 0.5)' : '-4px 0 20px rgba(0, 0, 0, 0.1)',
        },
      }}
      transitionDuration={300}
      ModalProps={{ keepMounted: true }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            borderBottom: `1px solid ${border}`,
            minHeight: { xs: 56, sm: 64 },
            backgroundColor: bg,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: text,
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              flex: 1,
              pr: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            aria-label="Close sidebar"
            sx={{
              color: text,
              minWidth: { xs: 48, sm: 56 },
              minHeight: { xs: 48, sm: 56 },
              '&:hover': { backgroundColor: isDark ? '#1a1a1a' : '#F5F5F5' },
            }}
          >
            <Close fontSize={isMobile ? 'medium' : 'large'} />
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3 },
            backgroundColor: bg,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </Box>

        {footer != null ? (
          <Box
            sx={{
              flexShrink: 0,
              borderTop: `1px solid ${border}`,
              px: { xs: 2, sm: 3 },
              py: { xs: 2, sm: 3 },
              backgroundColor: bg,
            }}
          >
            {footer}
          </Box>
        ) : null}
      </Box>
    </Drawer>
  );
};

export default RightSidebar;

import React from 'react';
import { IconButton, Tooltip, useTheme as useMUITheme } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  sx?: object;
  /** When true, no rotate / long transition on hover (e.g. login page). */
  disableHoverAnimation?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ sx, disableHoverAnimation = false }) => {
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMUITheme();

  const hoverBg = {
    background:
      mode === 'dark' ? 'rgba(245, 211, 0, 0.2)' : 'rgba(230, 194, 0, 0.2)',
  };

  return (
    <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
      <IconButton
        onClick={toggleTheme}
        disableRipple={disableHoverAnimation}
        sx={[
          {
            background:
              mode === 'dark' ? 'rgba(245, 211, 0, 0.1)' : 'rgba(230, 194, 0, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border:
              mode === 'dark'
                ? '1px solid rgba(245, 211, 0, 0.2)'
                : '1px solid rgba(230, 194, 0, 0.2)',
            color:
              mode === 'dark'
                ? muiTheme.palette.primary.main
                : muiTheme.palette.primary.main,
          },
          ...(disableHoverAnimation
            ? [
                {
                  transition: 'none',
                  transform: 'none',
                  '&&:hover': {
                    ...hoverBg,
                    transform: 'none',
                  },
                  '&&:active': {
                    transform: 'none',
                  },
                  '& .MuiSvgIcon-root': {
                    transition: 'none',
                  },
                },
              ]
            : [
                {
                  transition:
                    'all 300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                  '&:hover': {
                    ...hoverBg,
                    transform: 'rotate(180deg)',
                  },
                },
              ]),
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
        aria-label="toggle theme"
      >
        {mode === 'dark' ? <LightMode /> : <DarkMode />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;

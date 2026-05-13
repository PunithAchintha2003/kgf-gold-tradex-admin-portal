import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { useTheme as useMUITheme } from '@mui/material/styles';
import { applyGlassEffect, glassButtonStates, glassFocusRing } from '../../theme/glassmorphism';

export interface GlassButtonProps extends ButtonProps {
  glassVariant?: 'primary' | 'secondary' | 'subtle';
}

/**
 * Glass Button Component
 * Modern glassmorphism button with hover effects and accessibility
 */
export const GlassButton: React.FC<GlassButtonProps> = ({
  glassVariant = 'primary',
  children,
  sx,
  ...props
}) => {
  const theme = useMUITheme();
  const mode = theme.palette.mode;
  const glassEffect = applyGlassEffect(mode, glassVariant);
  const hoverState = glassButtonStates[mode].hover;
  const activeState = glassButtonStates[mode].active;
  const focusRing = glassFocusRing[mode];

  return (
    <Button
      {...props}
      sx={{
        ...glassEffect,
        borderRadius: '10px',
        padding: '10px 24px',
        fontWeight: 500,
        fontSize: '0.9375rem',
        textTransform: 'none',
        transition:
          'transform 100ms cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow 150ms cubic-bezier(0.4, 0.0, 0.2, 1), background 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
        '&:hover': {
          ...hoverState,
        },
        '&:active': {
          ...activeState,
        },
        '&:focus-visible': {
          ...focusRing,
        },
        ...sx,
      }}
    >
      {children}
    </Button>
  );
};

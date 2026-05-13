import React from 'react';
import { Dialog, DialogProps, Backdrop } from '@mui/material';
import { useTheme as useMUITheme } from '@mui/material/styles';
import { applyGlassEffect } from '../../theme/glassmorphism';

export interface GlassModalProps extends DialogProps {
  glassVariant?: 'primary' | 'secondary' | 'elevated' | 'subtle';
}

/**
 * Glass Modal Component
 * Modern glassmorphism modal with blur backdrop and slide-up animation
 */
export const GlassModal: React.FC<GlassModalProps> = ({
  glassVariant = 'elevated',
  children,
  PaperProps,
  BackdropProps,
  ...props
}) => {
  const theme = useMUITheme();
  const mode = theme.palette.mode;
  const glassEffect = applyGlassEffect(mode, glassVariant);

  return (
    <Dialog
      {...props}
      PaperProps={{
        ...PaperProps,
        sx: {
          ...glassEffect,
          borderRadius: '20px',
          border:
            mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.12)'
              : '1px solid rgba(0, 0, 0, 0.1)',
          ...PaperProps?.sx,
        },
      }}
      BackdropComponent={Backdrop}
      BackdropProps={{
        ...BackdropProps,
        sx: {
          backdropFilter: 'blur(8px) saturate(150%)',
          WebkitBackdropFilter: 'blur(8px) saturate(150%)',
          backgroundColor:
            mode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)',
          ...BackdropProps?.sx,
        },
      }}
      TransitionProps={{
        timeout: {
          enter: 300,
          exit: 200,
        },
      }}
    >
      {children}
    </Dialog>
  );
};

import React from 'react';
import { Card, CardProps } from '@mui/material';
import { useTheme as useMUITheme } from '@mui/material/styles';
import { applyGlassEffect } from '../../theme/glassmorphism';

export interface GlassCardProps extends Omit<CardProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'elevated' | 'subtle';
  glassHover?: boolean;
}

/**
 * Glass Card Component
 * Industry-standard glassmorphism card with theme-aware styling
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'elevated',
  glassHover = true,
  children,
  sx,
  ...props
}) => {
  const theme = useMUITheme();
  const glassEffect = applyGlassEffect(theme.palette.mode, variant);

  return (
    <Card
      {...props}
      sx={{
        ...glassEffect,
        borderRadius: '16px',
        transition: glassHover
          ? 'transform 150ms cubic-bezier(0.25, 0.1, 0.25, 1), border 200ms cubic-bezier(0.4, 0.0, 0.2, 1)'
          : 'none',
        ...(glassHover && {
          '&:hover': {
            transform: 'translateY(-2px)',
            border:
              theme.palette.mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.2)'
                : '1px solid rgba(0, 0, 0, 0.15)',
          },
        }),
        ...(!glassHover && {
          transition: 'none',
        }),
        ...sx,
      }}
    >
      {children}
    </Card>
  );
};

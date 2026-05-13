import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { useTheme as useMUITheme } from '@mui/material/styles';
import { applyGlassEffect, glassFocusRing } from '../../theme/glassmorphism';

export interface GlassInputProps extends Omit<TextFieldProps, 'variant'> {
  glassVariant?: 'primary' | 'secondary' | 'subtle';
}

/**
 * Glass Input Component
 * Modern glassmorphism text input with floating labels and focus effects
 */
export const GlassInput: React.FC<GlassInputProps> = ({
  glassVariant = 'subtle',
  sx,
  InputProps,
  ...props
}) => {
  const theme = useMUITheme();
  const mode = theme.palette.mode;
  const glassEffect = applyGlassEffect(mode, glassVariant);
  const focusRing = glassFocusRing[mode];
  const brandColor = mode === 'dark' ? '#F5D300' : '#E6C200';

  return (
    <TextField
      {...props}
      variant="outlined"
      InputProps={{
        ...InputProps,
        sx: {
          ...glassEffect,
          borderRadius: '10px',
          transition: 'all 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          '& fieldset': {
            borderColor:
              mode === 'dark'
                ? 'rgba(255, 255, 255, 0.15)'
                : 'rgba(0, 0, 0, 0.15)',
            transition:
              'border-color 150ms cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          },
          '&:hover fieldset': {
            borderColor:
              mode === 'dark'
                ? 'rgba(245, 211, 0, 0.5)'
                : 'rgba(230, 194, 0, 0.5)',
          },
          '&.Mui-focused fieldset': {
            borderColor: brandColor,
            borderWidth: '2px',
          },
          '&.Mui-focused': {
            ...focusRing,
          },
          ...InputProps?.sx,
        },
      }}
      InputLabelProps={{
        sx: {
          color: mode === 'dark' ? '#9ca3af' : '#6b7280',
          '&.Mui-focused': {
            color: brandColor,
            fontWeight: 500,
          },
        },
      }}
      sx={{
        ...sx,
      }}
    />
  );
};

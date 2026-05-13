import React from 'react';
import {
  TableContainer,
  Table,
  TableContainerProps,
  TableProps,
} from '@mui/material';
import { useTheme as useMUITheme } from '@mui/material/styles';
import { applyGlassEffect } from '../../theme/glassmorphism';

export interface GlassTableProps {
  tableContainerProps?: TableContainerProps;
  tableProps?: TableProps;
  glassVariant?: 'primary' | 'secondary' | 'elevated' | 'subtle';
  children: React.ReactNode;
}

/**
 * Glass Table Component
 * Modern glassmorphism table with sticky header and smooth scrolling
 */
export const GlassTable: React.FC<GlassTableProps> = ({
  glassVariant = 'elevated',
  tableContainerProps,
  tableProps,
  children,
}) => {
  const theme = useMUITheme();
  const mode = theme.palette.mode;
  const glassEffect = applyGlassEffect(mode, glassVariant);

  return (
    <TableContainer
      {...tableContainerProps}
      sx={{
        ...glassEffect,
        borderRadius: { xs: '12px', sm: '16px' },
        maxHeight: { xs: 'calc(100vh - 200px)', sm: 'calc(100vh - 250px)' },
        overflowX: 'auto',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
        '&::-webkit-scrollbar': {
          width: '10px',
          height: '10px',
        },
        '&::-webkit-scrollbar-track': {
          background:
            mode === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.05)',
          borderRadius: '5px',
        },
        '&::-webkit-scrollbar-thumb': {
          background:
            mode === 'dark'
              ? 'linear-gradient(180deg, #F5D300 0%, #B8A000 100%)'
              : 'linear-gradient(180deg, #FFE55C 0%, #B8A000 100%)',
          borderRadius: '5px',
          '&:hover': {
            background: mode === 'dark' ? '#FFE55C' : '#E6C200',
          },
        },
        ...tableContainerProps?.sx,
      }}
    >
      <Table
        {...tableProps}
        stickyHeader
        sx={{
          minWidth: { xs: 650, sm: 750, md: 900 },
          ...tableProps?.sx,
        }}
      >
        {children}
      </Table>
    </TableContainer>
  );
};

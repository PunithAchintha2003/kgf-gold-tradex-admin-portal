import React from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useTheme as useMUITheme,
} from '@mui/material';
import {
  Backup,
  CheckCircleOutline,
  FolderZip,
  Gavel,
  Security,
  ShoppingCart,
  Storage,
  Storefront,
} from '@mui/icons-material';
import { GlassButton, GlassCard } from '../Glass';
import { BackupScope } from '../../services/backupService';
import { useDataBackup } from '../../hooks/useDataBackup';

export interface DataBackupSectionProps {
  scope?: BackupScope;
}

const SCOPE_COPY: Record<
  BackupScope,
  { title: string; subtitle: string; bullets: { icon: React.ReactNode; text: string }[] }
> = {
  platform: {
    title: 'Data backup',
    subtitle: 'Export all platform data for disaster recovery and compliance.',
    bullets: [
      { icon: <Storage fontSize="small" />, text: 'Users, marketplace, auctions, orders, and messages' },
      {
        icon: <FolderZip fontSize="small" />,
        text: 'Wallet balances, trades, and withdrawals (spot trading)',
      },
      { icon: <Security fontSize="small" />, text: 'Passwords and tokens are never included' },
      { icon: <CheckCircleOutline fontSize="small" />, text: 'ZIP with manifest.json and SHA-256 checksums' },
    ],
  },
  merchant: {
    title: 'Data backup',
    subtitle: 'Export your merchant workspace for records, migration, and disaster recovery.',
    bullets: [
      { icon: <Storefront fontSize="small" />, text: 'Your profile, product catalog, and customer reviews' },
      { icon: <ShoppingCart fontSize="small" />, text: 'Paid orders and line items for your shop only' },
      { icon: <Gavel fontSize="small" />, text: 'Auctions, bids, and winner chat conversations' },
      { icon: <CheckCircleOutline fontSize="small" />, text: 'ZIP with manifest.json and SHA-256 checksums; secrets excluded' },
    ],
  },
};

export const DataBackupSection: React.FC<DataBackupSectionProps> = ({ scope = 'platform' }) => {
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const muted = isDark ? '#cccccc' : '#666';
  const accent = isDark ? '#F5D300' : '#E6C200';
  const { backingUp, runBackup } = useDataBackup(scope);
  const copy = SCOPE_COPY[scope];

  return (
    <GlassCard glassHover={false} sx={{ p: { xs: 2.5, sm: 3 } }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Backup sx={{ color: accent, fontSize: 28 }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {copy.title}
          </Typography>
          <Typography variant="body2" sx={{ color: muted }}>
            {copy.subtitle}
          </Typography>
        </Box>
      </Stack>

      <List dense disablePadding sx={{ mb: 2 }}>
        {copy.bullets.map((item) => (
          <ListItem key={item.text} disableGutters sx={{ py: 0.35 }}>
            <ListItemIcon sx={{ minWidth: 32, color: accent }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{ variant: 'body2', sx: { color: muted } }}
            />
          </ListItem>
        ))}
      </List>

      <Alert severity="info" sx={{ mb: 2, borderRadius: '10px' }}>
        Large exports may take a minute. Limit: 5 backups per hour. Keep backups encrypted at rest.
      </Alert>

      <GlassButton
        variant="contained"
        disabled={backingUp}
        onClick={() => void runBackup()}
        startIcon={backingUp ? <CircularProgress size={18} color="inherit" /> : <Backup />}
        sx={{
          background: isDark
            ? 'linear-gradient(135deg, #F5D300 0%, #B8A000 100%)'
            : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
          color: isDark ? '#000' : '#FFF',
          border: isDark ? '1px solid rgba(245, 211, 0, 0.5)' : '1px solid rgba(230, 194, 0, 0.5)',
          '&:hover': {
            background: isDark
              ? 'linear-gradient(135deg, #FFE55C 0%, #F5D300 100%)'
              : 'linear-gradient(135deg, #FFE55C 0%, #E6C200 100%)',
            color: '#000',
            transform: 'translateY(-1px)',
          },
        }}
      >
        {backingUp ? 'Preparing backup…' : 'Download full backup'}
      </GlassButton>
    </GlassCard>
  );
};

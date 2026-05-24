import React from 'react';
import { CircularProgress, Tooltip, useTheme as useMUITheme } from '@mui/material';
import { Backup } from '@mui/icons-material';
import { GlassButton } from '../Glass';
import { BackupScope } from '../../services/backupService';
import { useDataBackup } from '../../hooks/useDataBackup';

export interface DownloadBackupButtonProps {
  disabled?: boolean;
  scope?: BackupScope;
}

const TOOLTIPS: Record<BackupScope, string> = {
  platform:
    'Download full platform backup (ZIP with manifest, all platform data, secrets excluded)',
  merchant:
    'Download your merchant data backup (products, orders, auctions, messages)',
};

export const DownloadBackupButton: React.FC<DownloadBackupButtonProps> = ({
  disabled = false,
  scope = 'platform',
}) => {
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const { backingUp, runBackup } = useDataBackup(scope);

  return (
    <Tooltip title={TOOLTIPS[scope]}>
      <span>
        <GlassButton
          size="small"
          variant="contained"
          disabled={disabled || backingUp}
          onClick={() => void runBackup()}
          startIcon={backingUp ? <CircularProgress size={16} color="inherit" /> : <Backup />}
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
            },
          }}
        >
          {backingUp ? 'Preparing…' : 'Download backup'}
        </GlassButton>
      </span>
    </Tooltip>
  );
};

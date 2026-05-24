import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useTheme as useMUITheme } from '@mui/material/styles';
import { User } from '../services/adminService';
import { GlassModal, GlassInput, GlassButton } from './Glass';

export interface UserEditDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => Promise<void>;
  /** Merchants directory: hide role field (always MERCHANT) */
  merchantDirectory?: boolean;
}

export const UserEditDialog: React.FC<UserEditDialogProps> = ({
  open,
  user,
  onClose,
  onSave,
  merchantDirectory = false,
}) => {
  const [role, setRole] = useState<'SUPER_ADMIN' | 'USER' | 'MERCHANT'>('USER');
  const [isActive, setIsActive] = useState(true);
  const [merchantVerified, setMerchantVerified] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';

  const isMerchantAccount =
    merchantDirectory || user?.role === 'MERCHANT' || role === 'MERCHANT';

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setIsActive(user.isActive ?? true);
      setMerchantVerified(Boolean(user.merchantVerified));
      setError('');
    } else {
      setRole('USER');
      setIsActive(true);
      setMerchantVerified(false);
      setError('');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setError('');
    setSaving(true);
    try {
      await onSave({
        ...user,
        role: merchantDirectory ? 'MERCHANT' : role,
        isActive,
        ...(isMerchantAccount ? { merchantVerified } : {}),
      });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; message?: string } }; message?: string };
      setError(
        axiosErr.response?.data?.error ||
          axiosErr.response?.data?.message ||
          (err instanceof Error ? err.message : 'Failed to update user')
      );
    } finally {
      setSaving(false);
    }
  };

  const emailHelperText = isMerchantAccount
    ? 'Merchant email cannot be changed by administrators.'
    : 'Cannot be changed by super admin';

  return (
    <GlassModal open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          borderBottom: isDark ? '1px solid rgba(245, 211, 0, 0.1)' : '1px solid rgba(230, 194, 0, 0.1)',
        }}
      >
        {isMerchantAccount ? 'Edit merchant' : 'Edit user'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2, mt: 2, borderRadius: '10px' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <GlassInput
            fullWidth
            label="Name"
            value={user?.name || ''}
            disabled
            helperText="Cannot be changed by super admin"
          />
          <GlassInput
            fullWidth
            label="Email"
            type="email"
            value={user?.email || ''}
            disabled
            helperText={emailHelperText}
          />
          <GlassInput
            fullWidth
            label="Phone"
            value={user?.phone || ''}
            disabled
            helperText="Cannot be changed by super admin"
          />
          <GlassInput
            fullWidth
            label="Address"
            value={user?.address || ''}
            multiline
            rows={3}
            disabled
            helperText="Cannot be changed by super admin"
          />
          {!merchantDirectory && (
            <GlassInput
              fullWidth
              select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'SUPER_ADMIN' | 'USER' | 'MERCHANT')}
            >
              <MenuItem value="USER">USER</MenuItem>
              <MenuItem value="MERCHANT">MERCHANT</MenuItem>
              <MenuItem value="SUPER_ADMIN">SUPER_ADMIN</MenuItem>
            </GlassInput>
          )}
          {isMerchantAccount && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.08)',
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={merchantVerified}
                    onChange={(e) => setMerchantVerified(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: isDark ? '#F5D300' : '#E6C200' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: isDark ? 'rgba(245, 211, 0, 0.35)' : 'rgba(230, 194, 0, 0.45)',
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Verified seller
                    </Typography>
                    <Typography variant="caption" sx={{ color: isDark ? '#9ca3af' : '#6b7280', display: 'block' }}>
                      Verified merchants can publish live product listings from the merchant dashboard.
                    </Typography>
                  </Box>
                }
              />
            </Box>
          )}
          <Box>
            <Typography variant="body2" gutterBottom sx={{ color: isDark ? '#9ca3af' : '#6b7280', mb: 1.5 }}>
              Status
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <GlassButton
                variant={isActive ? 'contained' : 'outlined'}
                onClick={() => setIsActive(true)}
                sx={{
                  flex: 1,
                  ...(isActive
                    ? { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#FFF' }
                    : { borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981' }),
                }}
              >
                Active
              </GlassButton>
              <GlassButton
                variant={!isActive ? 'contained' : 'outlined'}
                onClick={() => setIsActive(false)}
                sx={{
                  flex: 1,
                  ...(!isActive
                    ? { background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#FFF' }
                    : { borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }),
                }}
              >
                Inactive
              </GlassButton>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
          Cancel
        </Button>
        <GlassButton
          onClick={() => void handleSave()}
          variant="contained"
          disabled={saving}
          sx={{
            background: isDark
              ? 'linear-gradient(135deg, #F5D300 0%, #B8A000 100%)'
              : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
            color: isDark ? '#000' : '#FFF',
          }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </GlassButton>
      </DialogActions>
    </GlassModal>
  );
};

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
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTheme as useMUITheme } from '@mui/material/styles';
import { adminService, CreateUserPayload } from '../services/adminService';
import { GlassModal, GlassInput, GlassButton } from './Glass';

export interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** When set, the new account is always a merchant (Merchants page). */
  forcedRole?: 'MERCHANT';
}

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  onClose,
  onSuccess,
  forcedRole,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<'SUPER_ADMIN' | 'USER' | 'MERCHANT'>('USER');
  const [merchantVerified, setMerchantVerified] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const effectiveRole = forcedRole ?? role;
  const isMerchantForm = effectiveRole === 'MERCHANT';

  useEffect(() => {
    if (!open) return;
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setAddress('');
    setRole('USER');
    setMerchantVerified(false);
    setIsActive(true);
    setError('');
    setSubmitting(false);
    setShowPassword(false);
  }, [open, forcedRole]);

  const handleSubmit = async () => {
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    const payload: CreateUserPayload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      address: address.trim(),
      role: effectiveRole,
      isActive,
      ...(isMerchantForm ? { merchantVerified } : {}),
    };
    setSubmitting(true);
    try {
      await adminService.createUser(payload);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string; message?: string; errors?: { message?: string }[] } } };
      const data = ax.response?.data;
      if (data?.errors?.length) {
        setError(data.errors.map((e) => e.message).filter(Boolean).join(' ') || 'Validation failed');
      } else {
        setError(data?.error || data?.message || (err instanceof Error ? err.message : 'Failed to create account'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const title = forcedRole === 'MERCHANT' ? 'Add merchant' : 'Add user';

  return (
    <GlassModal
      open={open}
      onClose={() => {
        if (submitting) return;
        onClose();
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          borderBottom: isDark ? '1px solid rgba(245, 211, 0, 0.1)' : '1px solid rgba(230, 194, 0, 0.1)',
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              mt: 2,
              borderRadius: '10px',
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <GlassInput fullWidth label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <GlassInput
            fullWidth
            label="Email"
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <GlassInput fullWidth label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <GlassInput
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="At least 8 characters"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                    size="medium"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    sx={{
                      color: isDark ? '#F5D300' : '#E6C200',
                      minWidth: 44,
                      minHeight: 44,
                      '&:hover': {
                        background: isDark ? 'rgba(245, 211, 0, 0.1)' : 'rgba(230, 194, 0, 0.1)',
                      },
                    }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <GlassInput
            fullWidth
            label="Address"
            multiline
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          {!forcedRole && (
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
          {isMerchantForm && (
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
            <Typography
              variant="body2"
              gutterBottom
              sx={{
                color: isDark ? '#9ca3af' : '#6b7280',
                mb: 1.5,
              }}
            >
              Status
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <GlassButton
                variant={isActive ? 'contained' : 'outlined'}
                onClick={() => setIsActive(true)}
                sx={{
                  flex: 1,
                  ...(isActive
                    ? {
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#FFF',
                      }
                    : {
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        color: '#10b981',
                      }),
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
                    ? {
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: '#FFF',
                      }
                    : {
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                      }),
                }}
              >
                Inactive
              </GlassButton>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} disabled={submitting} sx={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
          Cancel
        </Button>
        <GlassButton
          onClick={() => void handleSubmit()}
          variant="contained"
          disabled={submitting}
          sx={{
            background: isDark
              ? 'linear-gradient(135deg, #F5D300 0%, #B8A000 100%)'
              : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
            color: isDark ? '#000' : '#FFF',
            minWidth: 120,
          }}
        >
          {submitting ? <CircularProgress size={22} sx={{ color: 'inherit' }} /> : 'Create'}
        </GlassButton>
      </DialogActions>
    </GlassModal>
  );
};

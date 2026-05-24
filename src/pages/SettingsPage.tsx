import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
  useTheme as useMUITheme,
} from '@mui/material';
import {
  DarkMode,
  Email,
  LightMode,
  Lock,
  Palette,
  Security,
  Shield,
  VerifiedUser,
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { authService, type User } from '../services/authService';
import { userService } from '../services/userService';
import { SecurityChangeDialog } from '../components/profile/SecurityChangeDialog';
import { formatDate, formatDateTime, roleLabel } from '../utils/accountFormat';
import { GlassCard, GlassButton } from '../components/Glass';
import ThemeToggle from '../components/ThemeToggle';
import { DataBackupSection } from '../components/admin/DataBackupSection';

export interface SettingsPageProps {
  portalRole: 'admin' | 'merchant';
}

interface AccountDetails {
  email: string;
  role?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  merchantVerified?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ portalRole }) => {
  const { mode, setMode } = useTheme();
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const muted = isDark ? '#cccccc' : '#666';
  const accent = isDark ? '#F5D300' : '#E6C200';

  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const portalLabel = portalRole === 'merchant' ? 'Merchant portal' : 'Admin portal';

  const loadAccount = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getMe();
      if (!response.success || !response.data.user) {
        throw new Error('Could not load account settings');
      }
      const data = response.data.user;
      setAccount({
        email: data.email,
        role: data.role,
        isActive: data.isActive,
        emailVerified: data.emailVerified,
        merchantVerified: data.merchantVerified,
        lastLogin: data.lastLogin,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  const syncStoredUser = (patch: Partial<User>) => {
    const stored = authService.getCurrentUser();
    if (stored) {
      authService.updateStoredUser({ ...stored, ...patch });
    }
  };

  if (loading && !account) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: accent }} />
      </Box>
    );
  }

  const displayEmail = account?.email ?? authService.getCurrentUser()?.email ?? '';

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body1" sx={{ color: muted }}>
          Customize your {portalLabel.toLowerCase()} experience and manage account security.
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: '12px' }}
          action={
            <Button color="inherit" size="small" onClick={() => void loadAccount()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Appearance */}
        <GlassCard glassHover={false} sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <Palette sx={{ color: accent }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Appearance
              </Typography>
              <Typography variant="body2" sx={{ color: muted }}>
                Choose how the portal looks on your device.
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SettingOptionCard
                selected={mode === 'light'}
                title="Light mode"
                description="Bright interface for well-lit environments."
                icon={<LightMode />}
                onClick={() => setMode('light')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SettingOptionCard
                selected={mode === 'dark'}
                title="Dark mode"
                description="Reduced glare for extended use."
                icon={<DarkMode />}
                onClick={() => setMode('dark')}
              />
            </Grid>
          </Grid>

          <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 2.5 }}>
            <Typography variant="body2" sx={{ color: muted }}>
              Quick toggle
            </Typography>
            <ThemeToggle />
          </Stack>
        </GlassCard>

        {/* Security */}
        <GlassCard glassHover={false} sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <Security sx={{ color: accent }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Security
              </Typography>
              <Typography variant="body2" sx={{ color: muted }}>
                Changes require a 6-digit verification code sent to your email.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <GlassButton
              variant="outlined"
              startIcon={<Email />}
              onClick={() => setEmailDialogOpen(true)}
            >
              Change email
            </GlassButton>
            <GlassButton
              variant="outlined"
              startIcon={<Lock />}
              onClick={() => setPasswordDialogOpen(true)}
            >
              Change password
            </GlassButton>
          </Stack>

          <Alert severity="info" sx={{ borderRadius: '10px' }}>
            For your security, email and password updates are confirmed with a one-time code. Codes
            expire after a short period.
          </Alert>

          <SecurityChangeDialog
            type="email"
            open={emailDialogOpen}
            onClose={() => setEmailDialogOpen(false)}
            currentEmail={displayEmail}
            onRequest={async (values) => {
              if (!('newEmail' in values)) throw new Error('Missing new email');
              const res = await userService.requestEmailChange(values.newEmail);
              if (!res.data?.email) throw new Error('Could not start email change');
              return { email: res.data.email };
            }}
            onConfirm={async (code) => {
              const res = await userService.confirmEmailChange(code);
              if (!res.success || !res.data.user) throw new Error('Email update failed');
              const data = res.data.user;
              setAccount((prev) =>
                prev ? { ...prev, email: data.email, updatedAt: data.updatedAt } : null
              );
              syncStoredUser({ email: data.email, updatedAt: data.updatedAt });
            }}
            onResend={async () => {
              const res = await userService.resendCredentialOtp();
              if (!res.data?.email) throw new Error('Could not resend code');
              return { email: res.data.email };
            }}
          />

          <SecurityChangeDialog
            type="password"
            open={passwordDialogOpen}
            onClose={() => setPasswordDialogOpen(false)}
            currentEmail={displayEmail}
            onRequest={async (values) => {
              if (!('currentPassword' in values) || !('newPassword' in values)) {
                throw new Error('Missing password values');
              }
              const res = await userService.requestPasswordChange({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
              });
              if (!res.data?.email) throw new Error('Could not start password change');
              return { email: res.data.email };
            }}
            onConfirm={async (code) => {
              await userService.confirmPasswordChange(code);
            }}
            onResend={async () => {
              const res = await userService.resendCredentialOtp();
              if (!res.data?.email) throw new Error('Could not resend code');
              return { email: res.data.email };
            }}
          />
        </GlassCard>

        {/* Account */}
        <GlassCard glassHover={false} sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <Shield sx={{ color: accent }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Account
              </Typography>
              <Typography variant="body2" sx={{ color: muted }}>
                Portal access and verification status for {portalLabel}.
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <AccountField label="Sign-in email" value={displayEmail} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <AccountField label="Role" value={roleLabel(account?.role)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <AccountField
                label="Account status"
                value={account?.isActive !== false ? 'Active' : 'Inactive'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <AccountField
                label="Email verified"
                value={account?.emailVerified ? 'Yes' : 'Pending verification'}
              />
            </Grid>
            {account?.role === 'MERCHANT' && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <AccountField
                  label="Merchant verification"
                  value={account.merchantVerified ? 'Verified' : 'Not verified'}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
              <AccountField label="Member since" value={formatDate(account?.createdAt)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <AccountField label="Last sign-in" value={formatDateTime(account?.lastLogin)} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2.5 }} />

          <Stack direction="row" flexWrap="wrap" gap={1}>
            {account?.isActive !== false && (
              <Chip
                size="small"
                icon={<VerifiedUser sx={{ fontSize: 16 }} />}
                label="Active account"
                color="success"
                variant="outlined"
              />
            )}
            <Chip size="small" label={portalLabel} variant="outlined" />
            {account?.role === 'MERCHANT' && account.merchantVerified && (
              <Chip size="small" label="Verified merchant" color="primary" variant="outlined" />
            )}
          </Stack>
        </GlassCard>

        {(portalRole === 'admin' || portalRole === 'merchant') && (
          <DataBackupSection scope={portalRole === 'merchant' ? 'merchant' : 'platform'} />
        )}
      </Stack>
    </Box>
  );
};

function SettingOptionCard({
  selected,
  title,
  description,
  icon,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const accent = isDark ? '#F5D300' : '#E6C200';

  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        width: '100%',
        textAlign: 'left',
        p: 2,
        borderRadius: '12px',
        border: selected
          ? `2px solid ${accent}`
          : `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
        background: selected
          ? isDark
            ? 'rgba(245, 211, 0, 0.08)'
            : 'rgba(230, 194, 0, 0.08)'
          : isDark
            ? 'rgba(255,255,255,0.03)'
            : 'rgba(0,0,0,0.02)',
        cursor: 'pointer',
        transition: 'border-color 150ms ease, background-color 150ms ease',
        '&:hover': {
          borderColor: accent,
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box sx={{ color: accent, mt: 0.25 }}>{icon}</Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ color: isDark ? '#999' : '#666', display: 'block', mt: 0.5 }}>
            {description}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function AccountField({ label, value }: { label: string; value: string }) {
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: '10px',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
      }}
    >
      <Typography variant="caption" sx={{ color: isDark ? '#999' : '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.75, wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  );
}

export default SettingsPage;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  useTheme as useMUITheme,
} from '@mui/material';
import {
  CalendarToday,
  CheckCircle,
  Edit,
  LocationOn,
  Person,
  Phone,
  Save,
  Settings,
  Verified,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { ApiRequestError } from '../utils/apiError';
import {
  formatDate,
  formatDateTime,
  getInitials,
  profileCompletionScore,
  roleLabel,
} from '../utils/accountFormat';
import { GlassCard, GlassInput, GlassButton } from '../components/Glass';

interface ProfileForm {
  name: string;
  phone: string;
  address: string;
}

interface ProfileDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role?: string;
  merchantVerified?: boolean;
  isActive?: boolean;
  emailVerified?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfilePageProps {
  portalRole: 'admin' | 'merchant';
}

const ProfilePage: React.FC<ProfilePageProps> = ({ portalRole }) => {
  const navigate = useNavigate();
  const { mode } = useTheme();
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';
  const { showSuccess, showError } = useToast();
  const settingsPath = portalRole === 'merchant' ? '/merchant/settings' : '/settings';
  const accent = mode === 'dark' ? '#F5D300' : '#E6C200';
  const muted = isDark ? '#cccccc' : '#666';

  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [form, setForm] = useState<ProfileForm>({ name: '', phone: '', address: '' });
  const [savedForm, setSavedForm] = useState<ProfileForm>({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const isDirty = useMemo(
    () =>
      form.name !== savedForm.name ||
      form.phone !== savedForm.phone ||
      form.address !== savedForm.address,
    [form, savedForm]
  );

  const displayName = profile?.name ?? authService.getCurrentUser()?.name ?? 'Account';
  const displayEmail = profile?.email ?? authService.getCurrentUser()?.email ?? '';
  const completion = profileCompletionScore({ ...form, email: displayEmail });

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getMe();
      if (!response.success || !response.data.user) {
        throw new Error('Could not load profile');
      }
      const data = response.data.user;
      const next: ProfileDetails = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        role: data.role,
        merchantVerified: data.merchantVerified,
        isActive: data.isActive,
        emailVerified: data.emailVerified,
        lastLogin: data.lastLogin,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
      setProfile(next);
      const formValues = { name: data.name, phone: data.phone, address: data.address };
      setForm(formValues);
      setSavedForm(formValues);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleCancel = () => {
    setForm(savedForm);
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await userService.updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      });
      if (!response.success || !response.data.user) {
        throw new Error('Profile update failed');
      }
      const data = response.data.user;
      const updated: ProfileDetails = {
        ...(profile ?? { id: data.id, email: displayEmail }),
        name: data.name,
        phone: data.phone,
        address: data.address,
        updatedAt: data.updatedAt,
      };
      setProfile(updated);
      const formValues = { name: data.name, phone: data.phone, address: data.address };
      setForm(formValues);
      setSavedForm(formValues);
      setIsEditing(false);

      const stored = authService.getCurrentUser();
      if (stored) {
        authService.updateStoredUser({
          ...stored,
          name: data.name,
          phone: data.phone,
          address: data.address,
          updatedAt: data.updatedAt ?? stored.updatedAt,
        });
      }

      showSuccess('Profile saved', { description: 'Your personal details are up to date.' });
    } catch (e) {
      const message =
        e instanceof ApiRequestError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Could not save profile. Please try again.';
      setError(message);
      showError('Update failed', { description: message });
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: accent }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Profile
        </Typography>
        <Typography variant="body1" sx={{ color: muted }}>
          Manage your personal information and how you appear in the portal.
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: '12px' }}
          action={
            <Button color="inherit" size="small" onClick={() => void loadProfile()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <GlassCard glassHover={false} sx={{ mb: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            height: 4,
            background: isDark
              ? 'linear-gradient(90deg, #F5D300 0%, #FF8F00 100%)'
              : 'linear-gradient(90deg, #E6C200 0%, #B8A000 100%)',
          }}
        />
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack direction="row" spacing={2.5} alignItems="center">
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    background: isDark
                      ? 'linear-gradient(135deg, #F5D300 0%, #FF8F00 100%)'
                      : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
                    color: isDark ? '#000' : '#fff',
                  }}
                >
                  {getInitials(displayName)}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {displayName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: muted, mt: 0.5 }}>
                    {displayEmail}
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
                    <Chip
                      size="small"
                      icon={<CheckCircle sx={{ fontSize: 16 }} />}
                      label={profile?.isActive !== false ? 'Active account' : 'Inactive'}
                      color={profile?.isActive !== false ? 'success' : 'default'}
                      variant="outlined"
                    />
                    <Chip size="small" label={roleLabel(profile?.role)} variant="outlined" />
                    {profile?.role === 'MERCHANT' && profile.merchantVerified && (
                      <Chip
                        size="small"
                        icon={<Verified sx={{ fontSize: 16 }} />}
                        label="Verified merchant"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {profile?.createdAt && (
                      <Chip
                        size="small"
                        icon={<CalendarToday sx={{ fontSize: 16 }} />}
                        label={`Since ${formatDate(profile.createdAt)}`}
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Profile completeness
              </Typography>
              <LinearProgress
                variant="determinate"
                value={completion}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mb: 1,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: isDark
                      ? 'linear-gradient(90deg, #F5D300 0%, #FF8F00 100%)'
                      : 'linear-gradient(90deg, #E6C200 0%, #B8A000 100%)',
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: muted }}>
                {completion === 100
                  ? 'Your profile is fully complete.'
                  : 'Complete your details for a better portal experience.'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </GlassCard>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <GlassCard glassHover={false} sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
              sx={{ mb: 3 }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Personal details
                </Typography>
                <Typography variant="body2" sx={{ color: muted, mt: 0.5 }}>
                  Used for account identification and communications.
                </Typography>
              </Box>
              {!isEditing ? (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                  sx={{ borderRadius: '10px' }}
                >
                  Edit details
                </Button>
              ) : (
                <Chip label="Editing" size="small" color="primary" variant="outlined" />
              )}
            </Stack>

            {isEditing ? (
              <Box component="form" onSubmit={handleSave}>
                {isDirty && (
                  <Alert severity="warning" sx={{ mb: 2, borderRadius: '10px' }}>
                    You have unsaved changes. Save or cancel before leaving this page.
                  </Alert>
                )}
                <Stack spacing={2.5}>
                  <GlassInput
                    label="Full name"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    fullWidth
                    disabled={saving}
                    inputProps={{ minLength: 2, maxLength: 100 }}
                  />
                  <GlassInput
                    label="Phone number"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    required
                    fullWidth
                    disabled={saving}
                    helperText="Include country code, e.g. +94…"
                  />
                  <GlassInput
                    label="Address"
                    value={form.address}
                    onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                    required
                    fullWidth
                    multiline
                    minRows={2}
                    disabled={saving}
                  />
                </Stack>
                <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
                  <GlassButton variant="outlined" onClick={handleCancel} disabled={saving}>
                    Cancel
                  </GlassButton>
                  <GlassButton type="submit" disabled={saving || !isDirty}>
                    {saving ? <CircularProgress size={22} color="inherit" /> : <><Save sx={{ mr: 1, fontSize: 18 }} /> Save</>}
                  </GlassButton>
                </Stack>
              </Box>
            ) : (
              <Stack divider={<Divider flexItem />} spacing={0}>
                <InfoRow icon={<Person />} label="Full name" value={savedForm.name} />
                <InfoRow icon={<Phone />} label="Phone number" value={savedForm.phone} />
                <InfoRow icon={<LocationOn />} label="Address" value={savedForm.address} />
              </Stack>
            )}
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <GlassCard glassHover={false} sx={{ p: { xs: 2.5, sm: 3 }, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Account overview
            </Typography>
            <Typography variant="body2" sx={{ color: muted, mb: 2 }}>
              Read-only account information. Security settings are managed separately.
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" sx={{ color: muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Last sign-in
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {formatDateTime(profile?.lastLogin)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Profile last updated
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {formatDateTime(profile?.updatedAt)}
                </Typography>
              </Box>
            </Stack>
            <Divider sx={{ my: 2.5 }} />
            <GlassButton
              fullWidth
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => navigate(settingsPath)}
            >
              Open settings
            </GlassButton>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
};

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const muiTheme = useMUITheme();
  const isDark = muiTheme.palette.mode === 'dark';

  return (
    <Stack direction="row" spacing={2} sx={{ py: 2 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          color: isDark ? '#F5D300' : '#B8A000',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: isDark ? '#999' : '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5, wordBreak: 'break-word' }}>
          {value || '—'}
        </Typography>
      </Box>
    </Stack>
  );
}

export default ProfilePage;

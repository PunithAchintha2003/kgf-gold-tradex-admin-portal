import React, { useEffect, useId, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { MarkEmailRead } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { ApiRequestError, authService } from '../../services/authService';
import { EmailOtpInput } from './EmailOtpInput';
import { GlassButton } from '../Glass';

const RESEND_COOLDOWN_SEC = 60;
const PENDING_LOGIN_EMAIL_KEY = 'admin-pending-login-email';
const PENDING_LOGIN_SESSION_KEY = 'admin-pending-login-session';

interface LoginOtpVerificationStepProps {
  email: string;
  loginSessionToken: string;
  onVerified: (role: 'SUPER_ADMIN' | 'MERCHANT') => void;
  onBack: () => void;
  onSessionTokenChange: (token: string) => void;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const visible = local.length <= 2 ? local[0] : `${local.slice(0, 2)}***`;
  return `${visible}@${domain}`;
}

export const LoginOtpVerificationStep: React.FC<LoginOtpVerificationStepProps> = ({
  email,
  loginSessionToken,
  onVerified,
  onBack,
  onSessionTokenChange,
}) => {
  const { mode } = useTheme();
  const { showSuccess, showError } = useToast();
  const titleId = useId();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SEC);

  const muted = mode === 'dark' ? '#cccccc' : '#5F6368';

  useEffect(() => {
    try {
      sessionStorage.setItem(PENDING_LOGIN_EMAIL_KEY, email);
      sessionStorage.setItem(PENDING_LOGIN_SESSION_KEY, loginSessionToken);
    } catch {
      /* ignore */
    }
  }, [email, loginSessionToken]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from your email.');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await authService.verifyLogin({ email, code, loginSessionToken });
      if (!response.success || !response.data.user) {
        throw new Error('Verification failed');
      }

      const role = response.data.user.role;
      if (role !== 'SUPER_ADMIN' && role !== 'MERCHANT') {
        await authService.logout();
        setError(
          'This portal is only for administrators and merchants. Please use the customer site for standard accounts.'
        );
        return;
      }

      clearPendingLoginSession();
      showSuccess('Welcome back!', { description: 'You have successfully signed in.' });
      onVerified(role);
    } catch (err: unknown) {
      let message = 'Verification failed. Please try again.';
      if (err instanceof ApiRequestError) {
        message = err.message;
        if (err.code === 'LOGIN_SESSION_EXPIRED') {
          clearPendingLoginSession();
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      showError('Verification failed', { description: message });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setError('');
    setIsResending(true);
    try {
      const response = await authService.resendLoginCode({ email, loginSessionToken });
      if (response.data?.loginSessionToken) {
        onSessionTokenChange(response.data.loginSessionToken);
      }
      setResendCooldown(RESEND_COOLDOWN_SEC);
      showSuccess('Code sent', {
        description: `A new verification code was sent to ${maskEmail(email)}.`,
      });
    } catch (err: unknown) {
      const message =
        err instanceof ApiRequestError ? err.message : 'Could not resend code. Try again later.';
      setError(message);
      showError('Resend failed', { description: message });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Stack spacing={2.5} aria-labelledby={titleId}>
      <Box sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            mx: 'auto',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              mode === 'dark'
                ? 'linear-gradient(135deg, rgba(245,211,0,0.2) 0%, rgba(184,160,0,0.15) 100%)'
                : 'linear-gradient(135deg, rgba(230,194,0,0.25) 0%, rgba(184,160,0,0.15) 100%)',
          }}
        >
          <MarkEmailRead
            sx={{ fontSize: 36, color: mode === 'dark' ? '#F5D300' : '#B8860B' }}
            aria-hidden
          />
        </Box>
        <Typography
          id={titleId}
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 700,
            fontSize: '1.375rem',
            color: mode === 'dark' ? '#F5F5F5' : '#1A1A1A',
          }}
        >
          Verify sign-in
        </Typography>
        <Typography variant="body2" sx={{ color: muted, mt: 1, lineHeight: 1.6 }}>
          We sent a 6-digit code to{' '}
          <Box component="span" sx={{ fontWeight: 600, color: mode === 'dark' ? '#F5F5F5' : '#1A1A1A' }}>
            {maskEmail(email)}
          </Box>
          . Enter it below to complete sign-in.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" role="alert" aria-live="assertive" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleVerify}>
        <Stack spacing={2.5}>
          <EmailOtpInput
            value={code}
            onChange={setCode}
            disabled={isVerifying}
            error={Boolean(error)}
            autoFocus
          />

          <Typography variant="caption" sx={{ textAlign: 'center', color: muted, display: 'block' }}>
            Code expires in 15 minutes. Check spam if you do not see the email.
          </Typography>

          <GlassButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={isVerifying || code.length !== 6}
            sx={{
              minHeight: 48,
              fontWeight: 600,
              background:
                mode === 'dark'
                  ? 'linear-gradient(135deg, #F5D300 0%, #B8A000 100%)'
                  : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
              color: mode === 'dark' ? '#000' : '#fff',
            }}
          >
            {isVerifying ? (
              <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                <CircularProgress size={22} thickness={5} sx={{ color: 'inherit' }} aria-hidden />
                <span>Verifying…</span>
              </Stack>
            ) : (
              'Verify and sign in'
            )}
          </GlassButton>
        </Stack>
      </Box>

      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" flexWrap="wrap">
        <Typography variant="body2" sx={{ color: muted, m: 0 }}>
          Did not receive the code?
        </Typography>
        <Button
          type="button"
          variant="text"
          disabled={resendCooldown > 0 || isResending}
          onClick={() => void handleResend()}
          sx={{
            minWidth: 0,
            p: 0,
            color: mode === 'dark' ? '#F5D300' : '#B8860B',
            fontWeight: 600,
            textTransform: 'none',
            '&:disabled': { color: muted },
          }}
        >
          {isResending
            ? 'Sending…'
            : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : 'Resend code'}
        </Button>
      </Stack>

      <Typography variant="body2" sx={{ textAlign: 'center', color: muted, m: 0 }}>
        Wrong account?{' '}
        <Button
          type="button"
          variant="text"
          onClick={onBack}
          sx={{
            p: 0,
            minWidth: 0,
            color: mode === 'dark' ? '#F5D300' : '#B8860B',
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          Go back
        </Button>
      </Typography>
    </Stack>
  );
};

export const getPendingLoginSession = (): { email: string; loginSessionToken: string } | null => {
  try {
    const email = sessionStorage.getItem(PENDING_LOGIN_EMAIL_KEY);
    const loginSessionToken = sessionStorage.getItem(PENDING_LOGIN_SESSION_KEY);
    if (email && loginSessionToken) {
      return { email, loginSessionToken };
    }
    return null;
  } catch {
    return null;
  }
};

export const clearPendingLoginSession = (): void => {
  try {
    sessionStorage.removeItem(PENDING_LOGIN_EMAIL_KEY);
    sessionStorage.removeItem(PENDING_LOGIN_SESSION_KEY);
  } catch {
    /* ignore */
  }
};

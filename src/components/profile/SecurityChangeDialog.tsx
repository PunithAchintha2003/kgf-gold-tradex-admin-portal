import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowBack, Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { ApiRequestError } from '../../utils/apiError';
import { EmailOtpInput } from '../auth/EmailOtpInput';
import { PasswordRequirements } from '../auth/PasswordRequirements';
import {
  isPasswordValid,
  validatePasswordChangeForm,
} from '../auth/passwordValidation';
import { GlassButton, GlassInput, GlassModal } from '../Glass';

const RESEND_COOLDOWN_SEC = 60;

type ChangeType = 'email' | 'password';

export type SecurityChangeRequestValues =
  | { newEmail: string }
  | { currentPassword: string; newPassword: string };

interface SecurityChangeDialogProps {
  type: ChangeType;
  open: boolean;
  onClose: () => void;
  currentEmail: string;
  onRequest: (values: SecurityChangeRequestValues) => Promise<{ email: string }>;
  onConfirm: (code: string) => Promise<void>;
  onResend: () => Promise<{ email: string }>;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const visible = local.length <= 2 ? local[0] : `${local.slice(0, 2)}***`;
  return `${visible}@${domain}`;
}

export const SecurityChangeDialog: React.FC<SecurityChangeDialogProps> = ({
  type,
  open,
  onClose,
  currentEmail,
  onRequest,
  onConfirm,
  onResend,
}) => {
  const { mode } = useTheme();
  const { showSuccess } = useToast();
  const muted = mode === 'dark' ? '#cccccc' : '#5F6368';

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const resetState = () => {
    setStep('form');
    setNewEmail('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setOtpEmail('');
    setCode('');
    setError('');
    setIsSubmitting(false);
    setIsResending(false);
    setResendCooldown(0);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  useEffect(() => {
    if (!open) resetState();
  }, [open]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (type === 'email') {
      const trimmed = newEmail.trim().toLowerCase();
      if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        setError('Enter a valid email address.');
        return;
      }
      if (trimmed === currentEmail.toLowerCase()) {
        setError('New email must be different from your current email.');
        return;
      }
    } else {
      const validationError = validatePasswordChangeForm({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const values: SecurityChangeRequestValues =
        type === 'email'
          ? { newEmail: newEmail.trim() }
          : { currentPassword, newPassword };
      const result = await onRequest(values);
      setOtpEmail(result.email);
      setStep('otp');
      setResendCooldown(RESEND_COOLDOWN_SEC);
      showSuccess('Verification code sent', {
        description: `Check ${maskEmail(result.email)} for your 6-digit code.`,
      });
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : 'Could not send verification code.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from your email.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(code);
      showSuccess(type === 'email' ? 'Email updated' : 'Password updated', {
        description:
          type === 'email'
            ? 'Your sign-in email has been changed.'
            : 'Your password has been changed successfully.',
      });
      handleClose();
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Verification failed.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setError('');
    setIsResending(true);
    try {
      const result = await onResend();
      setOtpEmail(result.email);
      setResendCooldown(RESEND_COOLDOWN_SEC);
      showSuccess('Code sent', { description: `A new code was sent to ${maskEmail(result.email)}.` });
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Could not resend code.';
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  const title = type === 'email' ? 'Change email address' : 'Change password';
  const description =
    step === 'form'
      ? type === 'email'
        ? 'Enter your new email. We will send a 6-digit verification code to confirm the change.'
        : 'Enter your current and new password. We will send a 6-digit verification code to your email.'
      : `Enter the 6-digit code sent to ${maskEmail(otpEmail)}.`;

  const isPasswordFormValid =
    type === 'password' &&
    currentPassword.trim() !== '' &&
    isPasswordValid(newPassword) &&
    newPassword !== currentPassword &&
    confirmPassword !== '' &&
    newPassword === confirmPassword;

  const isFormSubmitDisabled =
    isSubmitting || (type === 'password' && step === 'form' && !isPasswordFormValid);

  const passwordAdornment = (show: boolean, toggle: () => void) => (
    <InputAdornment position="end">
      <IconButton onClick={toggle} edge="end" aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <GlassModal open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        {type === 'email' ? <Email color="primary" /> : <Lock color="primary" />}
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: muted, mb: 2 }}>
          {description}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {step === 'form' ? (
          <Box component="form" id="security-change-form" onSubmit={handleRequest}>
            {type === 'email' ? (
              <Stack spacing={2}>
                <GlassInput
                  label="New email address"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                  required
                  fullWidth
                />
                <Typography variant="caption" sx={{ color: muted }}>
                  Current email: {currentEmail}
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={2}>
                <GlassInput
                  label="Current password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  required
                  fullWidth
                  InputProps={{
                    endAdornment: passwordAdornment(showCurrentPassword, () =>
                      setShowCurrentPassword((v) => !v)
                    ),
                  }}
                />
                <GlassInput
                  label="New password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  required
                  fullWidth
                  InputProps={{
                    endAdornment: passwordAdornment(showNewPassword, () =>
                      setShowNewPassword((v) => !v)
                    ),
                  }}
                />
                <PasswordRequirements
                  password={newPassword}
                  confirmPassword={confirmPassword}
                  showMatchHint
                />
                <GlassInput
                  label="Confirm new password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  required
                  fullWidth
                  InputProps={{
                    endAdornment: passwordAdornment(showConfirmPassword, () =>
                      setShowConfirmPassword((v) => !v)
                    ),
                  }}
                />
              </Stack>
            )}
          </Box>
        ) : (
          <Box component="form" id="security-otp-form" onSubmit={handleConfirm}>
            <Stack spacing={2} alignItems="center">
              <EmailOtpInput
                value={code}
                onChange={setCode}
                disabled={isSubmitting}
                autoFocus
              />
              <Button
                type="button"
                variant="text"
                size="small"
                disabled={resendCooldown > 0 || isResending}
                onClick={() => void handleResend()}
              >
                {isResending
                  ? 'Sending…'
                  : resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : 'Resend code'}
              </Button>
            </Stack>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        {step === 'otp' && (
          <Button
            startIcon={<ArrowBack />}
            onClick={() => {
              setStep('form');
              setCode('');
              setError('');
            }}
            disabled={isSubmitting}
          >
            Back
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <GlassButton variant="outlined" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </GlassButton>
        <GlassButton
          type="submit"
          form={step === 'form' ? 'security-change-form' : 'security-otp-form'}
          disabled={isFormSubmitDisabled || (step === 'otp' && (isSubmitting || code.length !== 6))}
        >
          {isSubmitting ? (
            <CircularProgress size={22} color="inherit" />
          ) : step === 'form' ? (
            'Send code'
          ) : (
            'Verify & save'
          )}
        </GlassButton>
      </DialogActions>
    </GlassModal>
  );
};

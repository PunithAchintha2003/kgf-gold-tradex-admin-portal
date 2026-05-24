import React, { useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  CardContent,
  Typography,
  InputAdornment,
  Stack,
  Divider,
  Button,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Email,
  ArrowBack,
  LockReset,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { ApiRequestError, authService } from '../services/authService';
import { AuthPageLayout } from '../components/auth/AuthPageLayout';
import { EmailOtpInput } from '../components/auth/EmailOtpInput';
import { PasswordRequirements } from '../components/auth/PasswordRequirements';
import { isPasswordValid } from '../components/auth/passwordValidation';
import { GlassCard, GlassButton, GlassInput } from '../components/Glass';

type ForgotPasswordStep = 'email' | 'verify' | 'password';

const RESET_EMAIL_KEY = 'admin-pending-reset-email';
const RESET_SESSION_KEY = 'admin-pending-reset-session';

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const visible = local.length <= 2 ? local[0] : `${local.slice(0, 2)}***`;
  return `${visible}@${domain}`;
}

function codeSentDescription(maskedEmail: string) {
  return (
    <>
      We sent a 6-digit code to{' '}
      <span className="kgf-toast-email">{maskedEmail}</span>.
    </>
  );
}

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useTheme();
  const { showSuccess, showError } = useToast();
  const formTitleId = useId();
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const [resetSessionToken, setResetSessionToken] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const muted = mode === 'dark' ? '#cccccc' : '#5F6368';
  const accent = mode === 'dark' ? '#F5D300' : '#E6C200';

  const submitButtonSx = {
    minHeight: 48,
    fontWeight: 600,
    background: mode === 'dark'
      ? 'linear-gradient(135deg, #F5D300 0%, #B8A000 100%)'
      : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
    color: mode === 'dark' ? '#000' : '#fff',
    border: 'none',
    '&:hover': {
      background: mode === 'dark'
        ? 'linear-gradient(135deg, #FFE55C 0%, #F5D300 100%)'
        : 'linear-gradient(135deg, #E8D89B 0%, #E6C200 100%)',
    },
    '&:disabled': {
      background: mode === 'dark' ? 'rgba(245, 211, 0, 0.25)' : 'rgba(230, 194, 0, 0.25)',
      color: mode === 'dark' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.7)',
    },
  };

  useEffect(() => {
    try {
      const savedEmail = sessionStorage.getItem(RESET_EMAIL_KEY);
      const savedSession = sessionStorage.getItem(RESET_SESSION_KEY);
      if (savedEmail && savedSession) {
        setEmail(savedEmail);
        setResetSessionToken(savedSession);
        setStep('verify');
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const persistSession = (nextEmail: string, token: string) => {
    try {
      sessionStorage.setItem(RESET_EMAIL_KEY, nextEmail);
      sessionStorage.setItem(RESET_SESSION_KEY, token);
    } catch {
      /* ignore */
    }
  };

  const clearSession = () => {
    try {
      sessionStorage.removeItem(RESET_EMAIL_KEY);
      sessionStorage.removeItem(RESET_SESSION_KEY);
    } catch {
      /* ignore */
    }
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      showError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(trimmed);
      if (response.data?.resetSessionToken && response.data.email) {
        setEmail(response.data.email);
        setResetSessionToken(response.data.resetSessionToken);
        persistSession(response.data.email, response.data.resetSessionToken);
        setStep('verify');
        setResendCooldown(60);
        showSuccess('Check your email', {
          description: codeSentDescription(maskEmail(response.data.email)),
          duration: 6000,
        });
      } else {
        showSuccess('Check your email', {
          description:
            'If an account exists for this email, you will receive a verification code.',
          duration: 6000,
        });
      }
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : 'Could not send verification code.';
      showError('Could not send code', { description: message, duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from your email.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyForgotPasswordCode({ email, code, resetSessionToken });
      setStep('password');
      setCode('');
      showSuccess('Code verified', {
        description: 'You can now set a new password.',
      });
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Verification failed.';
      setError(message);
      if (err instanceof ApiRequestError && err.code === 'RESET_SESSION_EXPIRED') {
        clearSession();
        setStep('email');
      }
      showError('Verification failed', { description: message, duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setError('');
    setIsResending(true);
    try {
      const response = await authService.resendForgotPasswordCode({ email, resetSessionToken });
      if (response.data?.resetSessionToken) {
        setResetSessionToken(response.data.resetSessionToken);
        persistSession(email, response.data.resetSessionToken);
      }
      setResendCooldown(60);
      showSuccess('Code sent', {
        description: (
          <>
            A new code was sent to <span className="kgf-toast-email">{maskEmail(email)}</span>.
          </>
        ),
      });
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Could not resend code.';
      setError(message);
      showError('Resend failed', { description: message, duration: 5000 });
    } finally {
      setIsResending(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid(newPassword)) {
      setError('New password does not meet all requirements.');
      return;
    }
    if (!confirmPassword) {
      setError('Please confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetForgottenPassword({ email, newPassword, resetSessionToken });
      clearSession();
      showSuccess('Password updated', {
        description: 'You can now sign in with your new password.',
      });
      navigate('/login');
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Could not reset password.';
      setError(message);
      showError('Reset failed', { description: message, duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    clearSession();
    setStep('email');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setResetSessionToken('');
    setError('');
  };

  const noticeTitle =
    step === 'email'
      ? 'Reset your password'
      : step === 'verify'
        ? 'Verify your email'
        : 'Create new password';

  const noticeDescription =
    step === 'email'
      ? 'Enter the email address for your administrator or merchant account. We will send a 6-digit verification code.'
      : step === 'verify'
        ? 'Enter the code from your email to continue resetting your password.'
        : 'Choose a strong new password for your portal account.';

  const isPasswordFormValid =
    isPasswordValid(newPassword) && confirmPassword !== '' && newPassword === confirmPassword;

  const passwordVisibilityButton = (
    visible: boolean,
    onToggle: () => void,
    label: string
  ) => (
    <InputAdornment position="end">
      <IconButton
        onClick={onToggle}
        edge="end"
        size="medium"
        aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        aria-pressed={visible}
        sx={{
          color: accent,
          minWidth: 44,
          minHeight: 44,
          '&:hover': {
            background: mode === 'dark' ? 'rgba(245, 211, 0, 0.1)' : 'rgba(230, 194, 0, 0.1)',
          },
        }}
      >
        {visible ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <AuthPageLayout
      onBack={() => navigate('/login')}
      brandHeading="KGF Gold TradeX"
      brandDescription="Recover access to your administrator or merchant account securely with email verification."
      features={[
        'A 6-digit code is sent to your registered email address',
        'Your new password must meet our security requirements',
        'All active sessions are signed out after a password reset',
      ]}
      noticeTitle={noticeTitle}
      noticeDescription={noticeDescription}
    >
      <GlassCard
        variant="elevated"
        glassHover={false}
        sx={{
          width: '100%',
          maxWidth: 420,
          border: mode === 'dark'
            ? '1px solid rgba(245, 211, 0, 0.5)'
            : '1px solid rgba(230, 194, 0, 0.5)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2.5}>
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  mx: 'auto',
                  mb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    mode === 'dark'
                      ? 'linear-gradient(135deg, rgba(245,211,0,0.2) 0%, rgba(184,160,0,0.15) 100%)'
                      : 'linear-gradient(135deg, rgba(230,194,0,0.25) 0%, rgba(184,160,0,0.15) 100%)',
                }}
              >
                <LockReset sx={{ fontSize: 32, color: mode === 'dark' ? '#F5D300' : '#B8860B' }} aria-hidden />
              </Box>
              <Typography
                id={formTitleId}
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.375rem',
                  color: mode === 'dark' ? '#F5F5F5' : '#1A1A1A',
                }}
              >
                {step === 'email' && 'Forgot password?'}
                {step === 'verify' && 'Enter verification code'}
                {step === 'password' && 'Set new password'}
              </Typography>
              <Typography variant="body2" sx={{ color: muted, mt: 0.75, lineHeight: 1.6 }}>
                {step === 'email' && 'We will email you a code to reset your password.'}
                {step === 'verify' && (
                  <>
                    Code sent to{' '}
                    <Box
                      component="span"
                      sx={{ fontWeight: 600, color: mode === 'dark' ? '#F5F5F5' : '#1A1A1A' }}
                    >
                      {maskEmail(email)}
                    </Box>
                  </>
                )}
                {step === 'password' && 'Create a new password for your account.'}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />

            {error && (
              <Alert severity="error" role="alert" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {step === 'email' && (
              <Box component="form" onSubmit={handleRequestCode}>
                <Stack spacing={2.5}>
                  <GlassInput
                    fullWidth
                    id="forgot-email"
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: accent }} aria-hidden />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <GlassButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    sx={submitButtonSx}
                  >
                    {isLoading ? (
                      <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                        <CircularProgress size={22} thickness={5} sx={{ color: 'inherit' }} aria-hidden />
                        <span>Sending code…</span>
                      </Stack>
                    ) : (
                      'Send verification code'
                    )}
                  </GlassButton>
                </Stack>
              </Box>
            )}

            {step === 'verify' && (
              <Box component="form" onSubmit={handleVerifyCode}>
                <Stack spacing={2.5}>
                  <EmailOtpInput
                    value={code}
                    onChange={setCode}
                    disabled={isLoading}
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
                    disabled={isLoading || code.length !== 6}
                    sx={submitButtonSx}
                  >
                    {isLoading ? (
                      <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                        <CircularProgress size={22} thickness={5} sx={{ color: 'inherit' }} aria-hidden />
                        <span>Verifying…</span>
                      </Stack>
                    ) : (
                      'Verify code'
                    )}
                  </GlassButton>
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
                      }}
                    >
                      {isResending
                        ? 'Sending…'
                        : resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : 'Resend code'}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            )}

            {step === 'password' && (
              <Box component="form" onSubmit={handleResetPassword}>
                <Stack spacing={2.5}>
                  <GlassInput
                    fullWidth
                    id="forgot-new-password"
                    label="New password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError('');
                    }}
                    autoComplete="new-password"
                    disabled={isLoading}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: accent }} aria-hidden />
                        </InputAdornment>
                      ),
                      endAdornment: passwordVisibilityButton(
                        showNewPassword,
                        () => setShowNewPassword((v) => !v),
                        'new password'
                      ),
                    }}
                  />
                  <GlassInput
                    fullWidth
                    id="forgot-confirm-password"
                    label="Confirm new password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    autoComplete="new-password"
                    disabled={isLoading}
                    required
                    error={confirmPassword.length > 0 && newPassword !== confirmPassword}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: accent }} aria-hidden />
                        </InputAdornment>
                      ),
                      endAdornment: passwordVisibilityButton(
                        showConfirmPassword,
                        () => setShowConfirmPassword((v) => !v),
                        'confirm password'
                      ),
                    }}
                  />
                  <PasswordRequirements
                    password={newPassword}
                    confirmPassword={confirmPassword}
                    showMatchHint
                  />
                  <GlassButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading || !isPasswordFormValid}
                    sx={submitButtonSx}
                  >
                    {isLoading ? (
                      <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                        <CircularProgress size={22} thickness={5} sx={{ color: 'inherit' }} aria-hidden />
                        <span>Updating…</span>
                      </Stack>
                    ) : (
                      'Reset password'
                    )}
                  </GlassButton>
                </Stack>
              </Box>
            )}

            <Typography variant="body2" sx={{ textAlign: 'center', color: muted, m: 0 }}>
              <Button
                type="button"
                variant="text"
                startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
                onClick={step === 'email' ? () => navigate('/login') : handleBackToEmail}
                sx={{
                  color: mode === 'dark' ? '#F5D300' : '#B8860B',
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                {step === 'email' ? 'Back to sign in' : 'Start over'}
              </Button>
            </Typography>
          </Stack>
        </CardContent>
      </GlassCard>
    </AuthPageLayout>
  );
};

export default ForgotPasswordPage;

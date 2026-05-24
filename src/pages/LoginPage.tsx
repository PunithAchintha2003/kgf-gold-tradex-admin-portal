import React, { useState, useId, useEffect } from 'react';
import {
  Box,
  CardContent,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Checkbox,
  FormControlLabel,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Security,
  CheckCircleOutline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService, ApiRequestError } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import {
  LoginOtpVerificationStep,
  getPendingLoginSession,
  clearPendingLoginSession,
} from '../components/auth/LoginOtpVerificationStep';
import { GlassCard, GlassButton, GlassInput } from '../components/Glass';
import ThemeToggle from '../components/ThemeToggle';

type LoginStep = 'form' | 'verify-login';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useTheme();
  const { showSuccess } = useToast();
  const formTitleId = useId();
  const formDescriptionId = useId();
  const rememberId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [step, setStep] = useState<LoginStep>('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [loginSessionToken, setLoginSessionToken] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_login_email');
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    } catch {
      /* private mode / blocked storage */
    }

    const pendingLogin = getPendingLoginSession();
    if (pendingLogin) {
      setPendingEmail(pendingLogin.email);
      setLoginSessionToken(pendingLogin.loginSessionToken);
      setStep('verify-login');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setShake(false);

    try {
      if (rememberMe) {
        localStorage.setItem('admin_login_email', email.trim());
      } else {
        localStorage.removeItem('admin_login_email');
      }
    } catch {
      /* ignore */
    }

    try {
      const response = await authService.login({ email, password });

      if (!response?.success) {
        setError(response?.message || 'Login failed. Please try again.');
        setShake(true);
        return;
      }

      const data = response.data ?? {};

      if (data.requiresEmailVerification) {
        setError(
          'Please verify your email before signing in. Check your inbox for the 6-digit code, then try again.'
        );
        setShake(true);
        return;
      }

      if (data.requiresLoginOtp && data.loginSessionToken && data.email) {
        setPendingEmail(data.email);
        setLoginSessionToken(data.loginSessionToken);
        setStep('verify-login');
        showSuccess('Check your email', {
          description: `We sent a 6-digit sign-in code to ${data.email}.`,
        });
        return;
      }

      const role = data.user?.role;
      if (!role) {
        setError('Login response was invalid. Please try again.');
        setShake(true);
        await authService.logout();
        return;
      }

      if (role === 'SUPER_ADMIN') {
        navigate('/dashboard');
        return;
      }
      if (role === 'MERCHANT') {
        navigate('/merchant');
        return;
      }

      setError(
        'This portal is only for administrators and merchants. Please use the customer site for standard accounts.'
      );
      setShake(true);
      await authService.logout();
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Login failed. Please check your credentials.';
      setError(message);
      setShake(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOtpVerified = (role: 'SUPER_ADMIN' | 'MERCHANT') => {
    if (role === 'SUPER_ADMIN') {
      navigate('/dashboard');
      return;
    }
    navigate('/merchant');
  };

  const handleBackToForm = () => {
    clearPendingLoginSession();
    setStep('form');
    setPendingEmail('');
    setLoginSessionToken('');
    setError('');
  };

  const muted = mode === 'dark' ? '#cccccc' : '#5F6368';
  const surfaceMuted = mode === 'dark' ? '#cccccc' : '#3C4043';

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        position: 'relative',
        overflow: 'auto',
        backgroundColor: mode === 'dark' ? '#000000' : '#FFFFFF',
      }}
    >
      <ThemeToggle
        disableHoverAnimation
        sx={{
          position: 'absolute',
          top: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: 10,
        }}
      />

      {/* Left: branding — scannable summary (chunking, proximity) */}
      <Box
        component="section"
        aria-labelledby="login-brand-heading"
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: { md: '1 1 46%' },
          maxWidth: { md: 520 },
          px: { xs: 3, sm: 4, md: 6, lg: 8 },
          py: { xs: 4, md: 8 },
          pt: { xs: 10, md: 8 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          borderRight: { md: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)'}` },
        }}
      >
        {/* Logo: centered in full width of this column (not only the 440px text block) */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: { xs: 72, sm: 80 },
              height: { xs: 72, sm: 80 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& img': {
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              },
            }}
          >
            <img src="/src/assets/kgf_logo.svg" alt="KGF Gold TradeX logo" />
          </Box>
        </Box>

        <Stack spacing={3} sx={{ width: '100%', maxWidth: 440, mx: 'auto' }}>
          <Box sx={{ width: '100%' }}>
            <Typography
              id="login-brand-heading"
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                lineHeight: 1.25,
                mb: 1,
                letterSpacing: '-0.02em',
                color: mode === 'dark' ? '#F0F0F0' : '#1A1A1A',
              }}
            >
              KGF Gold TradeX
            </Typography>
            <Typography
              component="p"
              variant="body2"
              sx={{
                color: muted,
                lineHeight: 1.6,
                fontWeight: 500,
              }}
            >
              Secure sign-in for administrators and verified merchants — email and password, then a 6-digit
              verification code to complete access.
            </Typography>
          </Box>

          <Typography variant="subtitle2" sx={{ color: surfaceMuted, fontWeight: 600 }}>
            What you can do here
          </Typography>
          <List dense disablePadding sx={{ py: 0 }}>
            {[
              'Administrators: manage users, money movement, and operational controls',
              'Merchants: manage your product catalog, inventory, and publishing status',
              'Two-step sign-in: credentials first, then a one-time code sent to your work email',
            ].map((text) => (
              <ListItem key={text} disableGutters sx={{ py: 0.5, alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}>
                  <CheckCircleOutline
                    sx={{ fontSize: 20, color: mode === 'dark' ? '#F5D300' : '#B8860B' }}
                    aria-hidden
                  />
                </ListItemIcon>
                <ListItemText
                  primary={text}
                  primaryTypographyProps={{
                    variant: 'body2',
                    sx: { color: mode === 'dark' ? '#D0D0D0' : '#424242', lineHeight: 1.6 },
                  }}
                />
              </ListItem>
            ))}
          </List>

          <Box
            role="region"
            aria-label="Access restriction notice"
            sx={{
              p: 2,
              borderRadius: 2,
              background: mode === 'dark' ? 'rgba(245, 211, 0, 0.06)' : 'rgba(230, 194, 0, 0.08)',
              border: `1px solid ${mode === 'dark' ? 'rgba(245, 211, 0, 0.18)' : 'rgba(230, 194, 0, 0.22)'}`,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Security
                sx={{
                  fontSize: 22,
                  color: mode === 'dark' ? '#F5D300' : '#B8860B',
                  mt: 0.125,
                  flexShrink: 0,
                }}
                aria-hidden
              />
              <Box>
                <Typography
                  variant="subtitle2"
                  component="p"
                  sx={{
                    fontWeight: 700,
                    color: mode === 'dark' ? '#F5D300' : '#7A5C00',
                    mb: 0.5,
                  }}
                >
                  Administrators & merchants
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: mode === 'dark' ? '#B8B8B8' : '#4A4A4A',
                    lineHeight: 1.65,
                  }}
                >
                  Only designated administrators and merchant accounts can continue. If you are unsure which access
                  you should use, stop and contact your platform owner.
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Right: sign-in — single task focus, clear labels, touch targets */}
      <Box
        component="section"
        aria-labelledby={formTitleId}
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: { md: '1 1 54%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, sm: 4, md: 6 },
          py: { xs: 3, md: 8 },
        }}
      >
        <GlassCard
          variant="elevated"
          glassHover={false}
          sx={{
            width: '100%',
            maxWidth: 420,
            animation: shake ? 'shake 400ms cubic-bezier(0.4, 0.0, 0.2, 1)' : 'none',
            '@keyframes shake': {
              '0%, 100%': { transform: 'translateX(0)' },
              '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
              '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
            },
            border: mode === 'dark'
              ? '1px solid rgba(245, 211, 0, 0.5)'
              : '1px solid rgba(230, 194, 0, 0.5)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {step === 'verify-login' ? (
              <LoginOtpVerificationStep
                email={pendingEmail}
                loginSessionToken={loginSessionToken}
                onVerified={handleLoginOtpVerified}
                onBack={handleBackToForm}
                onSessionTokenChange={setLoginSessionToken}
              />
            ) : (
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  id={formTitleId}
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.375rem',
                    letterSpacing: '-0.01em',
                    color: mode === 'dark' ? '#F5F5F5' : '#1A1A1A',
                  }}
                >
                  Sign in
                </Typography>
                <Typography
                  id={formDescriptionId}
                  variant="body2"
                  component="p"
                  sx={{
                    color: muted,
                    mt: 0.75,
                    lineHeight: 1.6,
                  }}
                >
                  Enter your email and password. We will send a 6-digit code to your inbox to complete sign-in.
                </Typography>
              </Box>

              <Divider
                sx={{
                  borderColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                }}
              />

              {error && (
                <Alert
                  severity="error"
                  role="alert"
                  aria-live="assertive"
                  sx={{
                    borderRadius: 2,
                    '& .MuiAlert-message': { width: '100%' },
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={handleSubmit}
                aria-describedby={formDescriptionId}
              >
                <Stack spacing={2.5}>
                  <GlassInput
                    fullWidth
                    id="login-email"
                    label="Work email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                    inputProps={{
                      'aria-required': true,
                      inputMode: 'email',
                      autoCapitalize: 'none',
                      autoCorrect: 'off',
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: mode === 'dark' ? '#F5D300' : '#E6C200' }} aria-hidden />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <GlassInput
                    fullWidth
                    id="login-password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    inputProps={{
                      'aria-required': true,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: mode === 'dark' ? '#F5D300' : '#E6C200' }} aria-hidden />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="medium"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            aria-pressed={showPassword}
                            sx={{
                              color: mode === 'dark' ? '#F5D300' : '#E6C200',
                              minWidth: 44,
                              minHeight: 44,
                              '&:hover': {
                                background: mode === 'dark'
                                  ? 'rgba(245, 211, 0, 0.1)'
                                  : 'rgba(230, 194, 0, 0.1)',
                              },
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    justifyContent="space-between"
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          id={rememberId}
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          sx={{
                            color: mode === 'dark' ? '#F5D300' : '#E6C200',
                            '&.Mui-checked': {
                              color: mode === 'dark' ? '#F5D300' : '#E6C200',
                            },
                          }}
                        />
                      }
                      label="Remember my email on this device"
                      sx={{
                        margin: 0,
                        alignItems: 'flex-start',
                        '& .MuiFormControlLabel-label': {
                          fontSize: '0.875rem',
                          color: muted,
                          lineHeight: 1.5,
                          pt: 0.5,
                        },
                      }}
                    />
                    <Tooltip title="Reset your password via email verification.">
                      <span>
                        <Button
                          type="button"
                          variant="text"
                          size="small"
                          onClick={() => navigate('/forgot-password')}
                          sx={{
                            minHeight: 44,
                            px: 1,
                            color: mode === 'dark' ? '#F5D300' : '#B8860B',
                            textTransform: 'none',
                            fontWeight: 600,
                            alignSelf: { xs: 'flex-start', sm: 'center' },
                          }}
                        >
                          Forgot password?
                        </Button>
                      </span>
                    </Tooltip>
                  </Stack>

                  <GlassButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      minHeight: 48,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      background: mode === 'dark'
                        ? 'linear-gradient(135deg, #F5D300 0%, #B8A000 100%)'
                        : 'linear-gradient(135deg, #E6C200 0%, #B8A000 100%)',
                      color: mode === 'dark' ? '#000000' : '#FFFFFF',
                      border: 'none',
                      '&:hover': {
                        background: mode === 'dark'
                          ? 'linear-gradient(135deg, #FFE55C 0%, #F5D300 100%)'
                          : 'linear-gradient(135deg, #E8D89B 0%, #E6C200 100%)',
                      },
                      '&:disabled': {
                        background: mode === 'dark'
                          ? 'rgba(245, 211, 0, 0.25)'
                          : 'rgba(230, 194, 0, 0.25)',
                        color: mode === 'dark' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.7)',
                      },
                    }}
                  >
                    {loading ? (
                      <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                        <CircularProgress size={22} thickness={5} sx={{ color: 'inherit' }} aria-hidden />
                        <span>Signing in…</span>
                      </Stack>
                    ) : (
                      'Sign in'
                    )}
                  </GlassButton>
                </Stack>
              </Box>

              <Typography
                variant="caption"
                component="p"
                sx={{
                  textAlign: 'center',
                  color: mode === 'dark' ? '#757575' : '#9E9E9E',
                  lineHeight: 1.5,
                  m: 0,
                }}
              >
                © {new Date().getFullYear()} KGF Gold TradeX. All rights reserved.
              </Typography>
            </Stack>
            )}
          </CardContent>
        </GlassCard>
      </Box>
    </Box>
  );
};

export default LoginPage;


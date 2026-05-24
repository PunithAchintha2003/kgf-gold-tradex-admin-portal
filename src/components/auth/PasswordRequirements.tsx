import React from 'react';
import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { NEW_PASSWORD_RULES, getPasswordStrength } from './passwordValidation';

interface PasswordRequirementsProps {
  password: string;
  confirmPassword?: string;
  showMatchHint?: boolean;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  confirmPassword = '',
  showMatchHint = false,
}) => {
  const { mode } = useTheme();

  if (!password && !confirmPassword) return null;

  const strength = getPasswordStrength(password);
  const strengthPercent = (strength.score / 5) * 100;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const muted = mode === 'dark' ? '#B8B8B8' : '#5F6368';
  const success = mode === 'dark' ? '#81c784' : '#2e7d32';
  const error = mode === 'dark' ? '#ef5350' : '#c62828';
  const warn = mode === 'dark' ? '#ffb74d' : '#ed6c02';

  const strengthColor =
    strength.score <= 2 ? error : strength.score <= 4 ? warn : success;

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        background: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
        px: 2,
        py: 1.5,
      }}
    >
      {password && (
        <Stack spacing={1.5}>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
              <Typography variant="caption" sx={{ color: muted }}>
                Password strength
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: strengthColor }}>
                {strength.label}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={strengthPercent}
              aria-label={`Password strength: ${strength.label}`}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  backgroundColor: strengthColor,
                },
              }}
            />
          </Box>

          <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }} aria-label="Password requirements">
            {NEW_PASSWORD_RULES.map((rule) => {
              const met = rule.test(password);
              return (
                <Box
                  component="li"
                  key={rule.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 0.25,
                    color: met ? success : muted,
                    fontSize: '0.75rem',
                  }}
                >
                  {met ? (
                    <Check sx={{ fontSize: 16 }} aria-hidden />
                  ) : (
                    <Close sx={{ fontSize: 16, opacity: 0.6 }} aria-hidden />
                  )}
                  {rule.label}
                </Box>
              );
            })}
          </Box>
        </Stack>
      )}

      {showMatchHint && confirmPassword.length > 0 && (
        <Typography
          variant="caption"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            mt: password ? 1.5 : 0,
            color: passwordsMatch ? success : passwordsMismatch ? error : muted,
          }}
        >
          {passwordsMatch ? (
            <>
              <Check sx={{ fontSize: 16 }} aria-hidden />
              Passwords match
            </>
          ) : (
            <>
              <Close sx={{ fontSize: 16 }} aria-hidden />
              Passwords do not match
            </>
          )}
        </Typography>
      )}
    </Box>
  );
};

import React, { useRef, useId, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react';
import { Box, TextField } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

const OTP_LENGTH = 6;

interface EmailOtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

export const EmailOtpInput: React.FC<EmailOtpInputProps> = ({
  value,
  onChange,
  disabled = false,
  error = false,
  autoFocus = false,
}) => {
  const { mode } = useTheme();
  const groupId = useId();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(OTP_LENGTH, ' ').slice(0, OTP_LENGTH).split('');

  const updateValue = (nextDigits: string[]) => {
    onChange(nextDigits.join('').replace(/\s/g, '').slice(0, OTP_LENGTH));
  };

  const focusIndex = (index: number) => {
    const el = inputRefs.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      const next = [...digits];
      next[index] = ' ';
      updateValue(next);
      return;
    }

    const next = [...digits];
    let cursor = index;

    for (const char of raw) {
      if (cursor >= OTP_LENGTH) break;
      next[cursor] = char;
      cursor += 1;
    }

    updateValue(next);
    if (cursor < OTP_LENGTH) {
      focusIndex(cursor);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...digits];
      if (digits[index]?.trim()) {
        next[index] = ' ';
        updateValue(next);
        focusIndex(index);
      } else if (index > 0) {
        next[index - 1] = ' ';
        updateValue(next);
        focusIndex(index - 1);
      }
      return;
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
    }

    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      e.preventDefault();
      focusIndex(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = pasted.padEnd(OTP_LENGTH, ' ').split('');
    updateValue(next);
    focusIndex(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const accent = mode === 'dark' ? '#F5D300' : '#E6C200';

  return (
    <Box
      role="group"
      aria-labelledby={`${groupId}-label`}
      sx={{
        display: 'flex',
        gap: { xs: 1, sm: 1.25 },
        justifyContent: 'center',
      }}
    >
      <Box
        component="span"
        id={`${groupId}-label`}
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        6-digit verification code
      </Box>
      {digits.map((digit, index) => (
        <TextField
          key={index}
          inputRef={(el) => {
            inputRefs.current[index] = el;
          }}
          value={digit.trim()}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
          inputProps={{
            maxLength: OTP_LENGTH,
            style: {
              textAlign: 'center',
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              padding: '12px 0',
            },
          }}
          sx={{
            width: { xs: 44, sm: 52 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)',
              '& fieldset': {
                borderColor: error
                  ? mode === 'dark'
                    ? '#ef4444'
                    : '#dc2626'
                  : mode === 'dark'
                    ? 'rgba(245, 211, 0, 0.35)'
                    : 'rgba(230, 194, 0, 0.45)',
              },
              '&:hover fieldset': {
                borderColor: accent,
              },
              '&.Mui-focused fieldset': {
                borderColor: accent,
                borderWidth: 2,
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

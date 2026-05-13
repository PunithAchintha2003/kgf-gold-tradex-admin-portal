/**
 * Glassmorphism Design Tokens
 * Color palette and surface treatment matched exactly to
 * kgf-gold-tradex-frontend Gold Price Prediction page.
 *
 * Frontend surface hierarchy (dark mode):
 *   page bg:     #000000
 *   column bg:   #121212
 *   card shell:  #1a1a1a  +  1px solid rgba(255,255,255,0.1)
 *   inner tile:  rgba(26,26,26,0.8) glass + tinted borders for accents
 *
 * We apply backdrop-filter blur to all glass surfaces so the admin portal
 * achieves 100% glassmorphism on top of that same color palette.
 */

export interface GlassmorphismTokens {
  background: string;
  backdropFilter: string;
  WebkitBackdropFilter: string;
  border: string;
  boxShadow: string;
}

/**
 * Light Theme Glass Tokens
 */
export const glassLight = {
  primary: {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: 'none',
  },
  secondary: {
    background: 'rgba(255, 255, 255, 0.55)',
    backdropFilter: 'blur(16px) saturate(140%)',
    WebkitBackdropFilter: 'blur(16px) saturate(140%)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: 'none',
  },
  elevated: {
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    boxShadow: 'none',
  },
  subtle: {
    background: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(12px) saturate(120%)',
    WebkitBackdropFilter: 'blur(12px) saturate(120%)',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: 'none',
  },
};

/**
 * Dark Theme Glass Tokens
 * Backgrounds are rgba versions of frontend's #1a1a1a / #121212 surfaces,
 * with backdrop-filter blur to achieve glass effect.
 * Borders use rgba(255,255,255,0.1) matching the frontend exactly.
 */
export const glassDark = {
  primary: {
    background: 'rgba(26, 26, 26, 0.75)',
    backdropFilter: 'blur(20px) saturate(160%)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: 'none',
  },
  secondary: {
    background: 'rgba(18, 18, 18, 0.65)',
    backdropFilter: 'blur(16px) saturate(140%)',
    WebkitBackdropFilter: 'blur(16px) saturate(140%)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    boxShadow: 'none',
  },
  elevated: {
    background: 'rgba(26, 26, 26, 0.85)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: 'none',
  },
  subtle: {
    background: 'rgba(18, 18, 18, 0.5)',
    backdropFilter: 'blur(12px) saturate(120%)',
    WebkitBackdropFilter: 'blur(12px) saturate(120%)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    boxShadow: 'none',
  },
};

/**
 * Gold accent glass — used for selected/active states and gold-tinted tiles
 * Matches frontend inner tile style with gold fill
 */
export const glassDarkGold = {
  background: 'rgba(245, 211, 0, 0.08)',
  backdropFilter: 'blur(12px) saturate(160%)',
  WebkitBackdropFilter: 'blur(12px) saturate(160%)',
  border: '1px solid rgba(245, 211, 0, 0.3)',
  boxShadow: 'none',
};

export const glassLightGold = {
  background: 'rgba(230, 194, 0, 0.06)',
  backdropFilter: 'blur(12px) saturate(160%)',
  WebkitBackdropFilter: 'blur(12px) saturate(160%)',
  border: '1px solid rgba(230, 194, 0, 0.3)',
  boxShadow: 'none',
};

/**
 * Helper function to apply glass effect to any component
 */
export const applyGlassEffect = (
  mode: 'light' | 'dark',
  variant: 'primary' | 'secondary' | 'elevated' | 'subtle' = 'primary'
): GlassmorphismTokens => {
  return mode === 'light' ? glassLight[variant] : glassDark[variant];
};

/**
 * Gradient backgrounds — matched exactly to frontend
 * Dark mode: #000000 base (frontend palette.background.default)
 */
export const glassGradients = {
  light: {
    primary: '#FFFFFF',
    accent: 'linear-gradient(135deg, #FFFDE7 0%, #FFF9C4 100%)',
    subtle: '#F5F5F5',
  },
  dark: {
    primary: '#000000',
    accent: 'linear-gradient(135deg, #0a0a00 0%, #111100 100%)',
    subtle: '#000000',
  },
};

/**
 * Glass button states
 */
export const glassButtonStates = {
  light: {
    hover: {
      background: 'rgba(255, 255, 255, 0.9)',
      boxShadow: 'none',
      transform: 'translateY(-1px)',
    },
    active: {
      background: 'rgba(255, 255, 255, 0.95)',
      boxShadow: 'none',
      transform: 'translateY(0px)',
    },
  },
  dark: {
    hover: {
      background: 'rgba(26, 26, 26, 0.85)',
      boxShadow: 'none',
      transform: 'translateY(-1px)',
    },
    active: {
      background: 'rgba(26, 26, 26, 0.95)',
      boxShadow: 'none',
      transform: 'translateY(0px)',
    },
  },
};

/**
 * Focus ring for accessibility
 */
export const glassFocusRing = {
  light: {
    boxShadow: 'none',
    outline: '2px solid rgba(230, 194, 0, 0.7)',
    outlineOffset: '2px',
  },
  dark: {
    boxShadow: 'none',
    outline: '2px solid rgba(245, 211, 0, 0.7)',
    outlineOffset: '2px',
  },
};

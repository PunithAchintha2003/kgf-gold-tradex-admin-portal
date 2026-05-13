/**
 * Animation Definitions
 * Industry-standard animations and transitions for modern HCI
 */

/**
 * Timing functions (easing)
 */
export const easings = {
  // Standard material design easing
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  // Accelerated easing for exits
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  // Decelerated easing for entrances
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  // Sharp easing for quick transitions
  sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  // Smooth easing for elegant animations
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  // Bounce easing for playful effects
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

/**
 * Duration values in milliseconds
 */
export const durations = {
  // Instant (no perceptible delay)
  instant: 0,
  // Very fast (barely perceptible)
  fastest: 75,
  // Fast micro-interactions
  faster: 100,
  // Default micro-interactions
  fast: 150,
  // Default transitions
  normal: 200,
  // Slower transitions
  slow: 300,
  // Complex animations
  slower: 400,
  // Page transitions
  slowest: 500,
  // Large layout changes
  complex: 750,
};

/**
 * Keyframe animations
 */
export const keyframes = {
  // Fade in animation
  fadeIn: `
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `,
  
  // Fade out animation
  fadeOut: `
    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
  `,
  
  // Slide up animation
  slideUp: `
    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,
  
  // Slide down animation
  slideDown: `
    @keyframes slideDown {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,
  
  // Scale in animation
  scaleIn: `
    @keyframes scaleIn {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
  `,
  
  // Shimmer loading effect
  shimmer: `
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
  `,
  
  // Pulse animation
  pulse: `
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `,
  
  // Glow animation (gold/amber)
  glow: `
    @keyframes glow {
      0%, 100% {
        box-shadow: 0 0 5px rgba(212, 175, 55, 0.3);
      }
      50% {
        box-shadow: 0 0 20px rgba(212, 175, 55, 0.6);
      }
    }
  `,
  
  // Shake animation (for errors)
  shake: `
    @keyframes shake {
      0%, 100% {
        transform: translateX(0);
      }
      10%, 30%, 50%, 70%, 90% {
        transform: translateX(-4px);
      }
      20%, 40%, 60%, 80% {
        transform: translateX(4px);
      }
    }
  `,
  
  // Spin animation (for loaders)
  spin: `
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `,
  
  // Float animation (subtle hover effect)
  float: `
    @keyframes float {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-5px);
      }
    }
  `,
};

/**
 * Transition presets
 */
export const transitions = {
  // All properties
  all: {
    fast: `all ${durations.fast}ms ${easings.standard}`,
    normal: `all ${durations.normal}ms ${easings.standard}`,
    slow: `all ${durations.slow}ms ${easings.standard}`,
  },
  
  // Transform
  transform: {
    fast: `transform ${durations.fast}ms ${easings.smooth}`,
    normal: `transform ${durations.normal}ms ${easings.smooth}`,
    slow: `transform ${durations.slow}ms ${easings.smooth}`,
  },
  
  // Opacity
  opacity: {
    fast: `opacity ${durations.fast}ms ${easings.standard}`,
    normal: `opacity ${durations.normal}ms ${easings.standard}`,
    slow: `opacity ${durations.slow}ms ${easings.standard}`,
  },
  
  // Background
  background: {
    fast: `background ${durations.fast}ms ${easings.standard}`,
    normal: `background ${durations.normal}ms ${easings.standard}`,
    slow: `background ${durations.slow}ms ${easings.standard}`,
  },
  
  // Box shadow
  shadow: {
    fast: `box-shadow ${durations.fast}ms ${easings.standard}`,
    normal: `box-shadow ${durations.normal}ms ${easings.standard}`,
    slow: `box-shadow ${durations.slow}ms ${easings.standard}`,
  },
  
  // Color
  color: {
    fast: `color ${durations.fast}ms ${easings.standard}`,
    normal: `color ${durations.normal}ms ${easings.standard}`,
    slow: `color ${durations.slow}ms ${easings.standard}`,
  },
  
  // Border
  border: {
    fast: `border ${durations.fast}ms ${easings.standard}`,
    normal: `border ${durations.normal}ms ${easings.standard}`,
    slow: `border ${durations.slow}ms ${easings.standard}`,
  },
};

/**
 * Combined transitions for common use cases
 */
export const combinedTransitions = {
  // Glass card hover
  glassCard: `transform ${durations.fast}ms ${easings.smooth}, box-shadow ${durations.normal}ms ${easings.standard}`,
  
  // Button interactions
  button: `transform ${durations.faster}ms ${easings.smooth}, box-shadow ${durations.fast}ms ${easings.standard}, background ${durations.fast}ms ${easings.standard}`,
  
  // Input focus
  input: `border-color ${durations.fast}ms ${easings.standard}, box-shadow ${durations.fast}ms ${easings.standard}`,
  
  // Theme transition
  theme: `background ${durations.slow}ms ${easings.standard}, color ${durations.slow}ms ${easings.standard}, border-color ${durations.slow}ms ${easings.standard}`,
  
  // Modal entrance
  modal: `opacity ${durations.slow}ms ${easings.decelerate}, transform ${durations.slow}ms ${easings.decelerate}`,
  
  // Sidebar collapse
  sidebar: `width ${durations.complex}ms ${easings.smooth}, transform ${durations.complex}ms ${easings.smooth}`,
};

/**
 * Animation utility classes (to be used with sx prop or styled components)
 */
export const animationClasses = {
  fadeIn: {
    animation: `fadeIn ${durations.normal}ms ${easings.decelerate} forwards`,
  },
  slideUp: {
    animation: `slideUp ${durations.slow}ms ${easings.decelerate} forwards`,
  },
  scaleIn: {
    animation: `scaleIn ${durations.normal}ms ${easings.bounce} forwards`,
  },
  shimmer: {
    animation: `shimmer 2s linear infinite`,
  },
  pulse: {
    animation: `pulse 2s ${easings.standard} infinite`,
  },
  glow: {
    animation: `glow 2s ${easings.standard} infinite`,
  },
  shake: {
    animation: `shake ${durations.slower}ms ${easings.standard}`,
  },
  spin: {
    animation: `spin 1s linear infinite`,
  },
  float: {
    animation: `float 3s ${easings.standard} infinite`,
  },
};

/**
 * Inject keyframes into document
 */
export const injectKeyframes = () => {
  if (typeof document !== 'undefined') {
    const styleId = 'kgf-admin-keyframes';
    
    // Check if already injected
    if (document.getElementById(styleId)) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = Object.values(keyframes).join('\n');
    document.head.appendChild(style);
  }
};

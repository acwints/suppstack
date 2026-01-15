/**
 * Design System Tokens
 * Professional editorial theme inspired by NYT and Bloomberg
 */

// =============================================================================
// COLORS - Professional editorial palette
// =============================================================================

export const colors = {
  // Brand - Understated, professional
  brand: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#171717', // Primary black
    600: '#0a0a0a',
    700: '#000000',
    800: '#000000',
    900: '#000000',
  },

  // Accent - Subtle warm tone for highlights
  accent: {
    50: '#fef7f0',
    100: '#fdeee0',
    200: '#fad9bd',
    300: '#f6be8a',
    400: '#f09955',
    500: '#e87a2e', // Warm accent (used sparingly)
    600: '#d45f1a',
    700: '#b04816',
    800: '#8d3a19',
    900: '#723217',
  },

  // Neutral (Gray) - Editorial grays
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Semantic
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
  },

  // Social
  social: {
    twitter: '#1da1f2',
    instagram: '#e4405f',
    youtube: '#ff0000',
    facebook: '#1877f2',
  },
} as const;

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
} as const;

// =============================================================================
// TYPOGRAPHY - Editorial style
// =============================================================================

export const fontFamily = {
  serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
} as const;

export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
  base: ['1rem', { lineHeight: '1.625rem' }],   // 16px - slightly more line-height for readability
  lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
  '5xl': ['3rem', { lineHeight: '1.1' }],       // 48px
  '6xl': ['3.75rem', { lineHeight: '1.1' }],    // 60px
  '7xl': ['4.5rem', { lineHeight: '1' }],       // 72px
} as const;

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// =============================================================================
// BORDERS
// =============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',  // 2px - very subtle
  md: '0.25rem',   // 4px
  lg: '0.375rem',  // 6px
  xl: '0.5rem',    // 8px
  '2xl': '0.75rem', // 12px
  '3xl': '1rem',   // 16px
  full: '9999px',
} as const;

export const borderWidth = {
  0: '0',
  1: '1px',
  2: '2px',
  4: '4px',
} as const;

// =============================================================================
// SHADOWS - Subtle, professional
// =============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
  md: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
  lg: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
  xl: '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
  '2xl': '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
  inner: 'inset 0 1px 2px 0 rgb(0 0 0 / 0.03)',
} as const;

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// =============================================================================
// Z-INDEX
// =============================================================================

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  toast: 60,
  tooltip: 70,
} as const;

// =============================================================================
// TRANSITIONS
// =============================================================================

export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
  spring: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// =============================================================================
// COMPONENT-SPECIFIC TOKENS
// =============================================================================

export const components = {
  // Card variants
  card: {
    borderRadius: borderRadius.lg,
    padding: {
      sm: spacing[4],
      md: spacing[6],
      lg: spacing[8],
    },
    shadow: {
      default: shadows.none,
      elevated: shadows.sm,
      hover: shadows.md,
    },
  },

  // Button sizes
  button: {
    height: {
      sm: '2rem',      // 32px
      md: '2.5rem',    // 40px
      lg: '2.75rem',   // 44px
    },
    padding: {
      sm: `0 ${spacing[3]}`,
      md: `0 ${spacing[4]}`,
      lg: `0 ${spacing[6]}`,
    },
    fontSize: {
      sm: '0.75rem',
      md: '0.875rem',
      lg: '1rem',
    },
    borderRadius: borderRadius.md,
  },

  // Input sizes
  input: {
    height: {
      sm: '2rem',
      md: '2.5rem',
      lg: '2.75rem',
    },
    borderRadius: borderRadius.md,
  },

  // Avatar sizes
  avatar: {
    xs: '1.5rem',   // 24px
    sm: '2rem',     // 32px
    md: '2.5rem',   // 40px
    lg: '3rem',     // 48px
    xl: '4rem',     // 64px
    '2xl': '5rem',  // 80px
    '3xl': '7.5rem', // 120px
  },

  // Badge
  badge: {
    padding: {
      sm: `${spacing[0.5]} ${spacing[2]}`,
      md: `${spacing[1]} ${spacing[2.5]}`,
    },
    fontSize: {
      sm: '0.625rem', // 10px
      md: '0.75rem',  // 12px
    },
    borderRadius: borderRadius.sm,
  },

  // Modal
  modal: {
    width: {
      sm: '24rem',   // 384px
      md: '28rem',   // 448px
      lg: '32rem',   // 512px
      xl: '36rem',   // 576px
      full: '100%',
    },
    borderRadius: borderRadius.lg,
  },

  // Toast
  toast: {
    width: '22rem', // 352px
    borderRadius: borderRadius.md,
  },
} as const;

// =============================================================================
// TAILWIND CLASS MAPPINGS (for consistency)
// =============================================================================

export const tw = {
  // Commonly used class combinations
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2',
  focusRingInset: 'focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-inset',
  transition: 'transition-all duration-200 ease-in-out',
  transitionFast: 'transition-all duration-150 ease-in-out',
  truncate: 'overflow-hidden text-ellipsis whitespace-nowrap',
  srOnly: 'sr-only',
} as const;

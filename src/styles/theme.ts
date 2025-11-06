/**
 * 🎨 OMEGA WEB - DESIGN SYSTEM
 * Sistema de diseño unificado para toda la aplicación
 */

/** ============================================
 * COLOR PALETTE
 * ============================================ */
export const colors = {
  // Backgrounds
  bgPrimary: '#0a0e1a',
  bgSecondary: '#141824',
  bgCard: '#1a1f2e',
  bgOverlay: 'rgba(10, 14, 26, 0.9)',

  // Primary (Cyan)
  cyanPrimary: '#00d4ff',
  cyanGlow: 'rgba(0, 212, 255, 0.3)',
  cyanDark: '#0099cc',
  cyanLight: '#33ddff',

  // Accent (Yellow/Gold)
  yellowAccent: '#fbbf24',
  yellowGlow: 'rgba(251, 191, 36, 0.3)',
  goldDark: '#f59e0b',

  // Status
  greenBullish: '#10b981',
  redBearish: '#ef4444',

  // Text
  textPrimary: '#f9fafb',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',

  // Borders
  borderSubtle: 'rgba(255, 255, 255, 0.05)',
  borderPrimary: 'rgba(0, 212, 255, 0.3)',
  borderAccent: 'rgba(251, 191, 36, 0.3)',
};

/** ============================================
 * SPACING
 * ============================================ */
export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
};

/** ============================================
 * TYPOGRAPHY
 * ============================================ */
export const typography = {
  fontFamily: {
    sans: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    mono: 'ui-monospace, monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

/** ============================================
 * BORDER RADIUS
 * ============================================ */
export const borderRadius = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
};

/** ============================================
 * SHADOWS
 * ============================================ */
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  glow: {
    cyan: '0 0 20px rgba(0, 212, 255, 0.3)',
    cyanStrong: '0 0 30px rgba(0, 212, 255, 0.5)',
    yellow: '0 0 20px rgba(251, 191, 36, 0.3)',
    yellowStrong: '0 0 30px rgba(251, 191, 36, 0.5)',
  },
};

/** ============================================
 * ANIMATIONS
 * ============================================ */
export const animations = {
  transition: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

/** ============================================
 * TAILWIND CLASSES (ready to use)
 * ============================================ */
export const classes = {
  // Backgrounds
  bgPrimary: 'bg-[#0a0e1a]',
  bgSecondary: 'bg-[#141824]',
  bgCard: 'bg-[#1a1f2e]',

  // Text
  textPrimary: 'text-[#f9fafb]',
  textSecondary: 'text-[#9ca3af]',
  textCyan: 'text-[#00d4ff]',
  textYellow: 'text-[#fbbf24]',

  // Borders
  borderSubtle: 'border-[rgba(255,255,255,0.05)]',
  borderCyan: 'border-[#00d4ff]/30',
  borderYellow: 'border-[#fbbf24]/30',

  // Common components
  card: 'rounded-2xl border border-[#9ca3af]/20 bg-[#1a1f2e] p-6',
  button: {
    primary: 'rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#0099cc] px-6 py-2.5 font-semibold text-white shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]',
    secondary: 'rounded-lg border border-[#00d4ff]/50 bg-[#00d4ff]/10 px-6 py-2.5 font-medium text-[#00d4ff] transition-all hover:bg-[#00d4ff]/20',
    accent: 'rounded-lg bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] px-6 py-2.5 font-semibold text-[#0a0e1a] shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]',
  },
  input: 'w-full rounded-lg border border-[#9ca3af]/30 bg-[#141824] px-4 py-2.5 text-[#f9fafb] placeholder-[#9ca3af]/50 outline-none transition-all focus:border-[#00d4ff] focus:ring-2 focus:ring-[#00d4ff]/20',
};

export default {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  animations,
  classes,
};

export const Colors = {
  // Primary brand palette (from Framer site)
  primary: '#33a1dc',
  primaryLight: '#a2e5ff',
  primaryPale: '#daeaee',

  // Dark / text
  dark: '#37454f',
  darker: '#2d3033',

  // Neutral
  white: '#ffffff',
  offWhite: '#f5f9fb',
  border: '#e0edf3',

  // Performance zones
  green: '#4caf50',
  yellow: '#ffc107',
  red: '#f44336',

  // Semantic
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#33a1dc',

  // Text
  textPrimary: '#2d3033',
  textSecondary: '#37454f',
  textMuted: '#8a9daa',
  textInverse: '#ffffff',

  // Backgrounds
  bgApp: '#f5f9fb',
  bgCard: '#ffffff',
  bgOverlay: 'rgba(45, 48, 51, 0.7)',
} as const;

export const Typography = {
  fontFamily: {
    regular: 'System',     // Will be replaced by Google Sans / Inter after font loading
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
    display: 'System',     // Architects Daughter for hero/display text
  },
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 32,
    display: 40,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    loose: 1.8,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 80,
} as const;

export const Radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

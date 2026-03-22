export const colors = {
  primary: '#4F46E5',       // indigo
  primaryLight: '#818CF8',
  primaryDark: '#3730A3',

  success: '#10B981',       // green
  warning: '#F59E0B',       // amber
  danger: '#EF4444',        // red

  bg: '#0F0F1A',            // dark background
  bgCard: '#1A1A2E',
  bgInput: '#16213E',

  text: '#F1F5F9',
  textMuted: '#94A3B8',
  textLight: '#CBD5E1',

  border: '#2D2D44',
  borderLight: '#3D3D5A',

  protein: '#3B82F6',       // blue
  fat: '#F59E0B',           // amber
  carbs: '#10B981',         // green

  white: '#FFFFFF',
  black: '#000000',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyMd: { fontSize: 15, fontWeight: '500' as const },
  small: { fontSize: 13, fontWeight: '400' as const },
  label: { fontSize: 12, fontWeight: '500' as const },
} as const;

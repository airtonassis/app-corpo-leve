/**
 * Força Leve — Design Tokens
 * Paleta suave e acolhedora: verde oliva, areia, branco e grafite.
 */

export const colors = {
  background: '#FAF7F2',      // areia clara
  surface: '#FFFFFF',
  surfaceAlt: '#F2EEE6',
  primary: '#8A9A5B',         // verde oliva claro
  primaryDark: '#6B7A45',
  primaryLight: '#DDE4CC',
  accent: '#C9A98C',          // areia/terracota suave
  text: '#3A3A3A',            // grafite
  textMuted: '#7A7A7A',
  textInverse: '#FFFFFF',
  success: '#7BA05B',
  border: '#E7E1D6',
  overlay: 'rgba(58,58,58,0.4)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 18, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 16, fontWeight: '400' as const, color: colors.text },
  bodyMuted: { fontSize: 14, fontWeight: '400' as const, color: colors.textMuted },
  caption: { fontSize: 12, fontWeight: '500' as const, color: colors.textMuted },
  button: { fontSize: 16, fontWeight: '600' as const, color: colors.textInverse },
};

export const shadow = {
  card: {
    shadowColor: '#3A3A3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
};

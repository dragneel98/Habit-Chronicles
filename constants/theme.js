// Archivo central de constantes de diseño.
// Modificá acá los colores, tamaños de fuente, espaciados, etc.
// y se van a reflejar en toda la app.
// ============================================================

export const COLORS = {
  // Colores principales de marca
  primary: '#6C5CE7',
  primaryDark: '#5849C2',
  primaryLight: '#A29BFE',

  secondary: '#00CEC9',
  secondaryDark: '#00A8A3',

  // Fondos
  background: '#F7F7FC',
  surface: '#FFFFFF',
  surfaceAlt: '#F0EFFB',

  // Textos
  text: '#2D3436',
  textSecondary: '#636E72',
  textLight: '#B2BEC3',
  textOnPrimary: '#FFFFFF',

  // Estados
  success: '#00B894',
  danger: '#D63031',
  warning: '#FDCB6E',
  info: '#0984E3',

  // Utilidad
  border: '#E4E4F0',
  overlay: 'rgba(45, 52, 54, 0.5)',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Paleta de colores seleccionables para hábitos
  habitPalette: [
    '#6C5CE7', // violeta
    '#00CEC9', // turquesa
    '#00B894', // verde
    '#FDCB6E', // amarillo
    '#E17055', // naranja
    '#D63031', // rojo
    '#0984E3', // azul
    '#FD79A8', // rosa
    '#636E72', // gris
    '#00A8A3', // verde azulado
  ],

  // Colores retro RPG
  retro: {
    buttonGreen: '#7FD97F',
    buttonBorder: '#1A4D1A',
    background: '#D4C4A8',
    textDark: '#2D2D2D',
    shadow: '#000000',
  },
};

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 999,
};

export const SHADOW = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Iconos (emoji) sugeridos para elegir al crear un hábito
export const HABIT_ICONS = [
  '💧', '🏃', '📚', '🧘', '🥗', '😴', '💪', '🚭',
  '✍️', '🎯', '🎸', '🧹', '💰', '🌱', '☕', '🧠',
];

// Días de la semana (para hábitos con frecuencia personalizada)
export const WEEK_DAYS = [
  { key: 0, label: 'D' },
  { key: 1, label: 'L' },
  { key: 2, label: 'M' },
  { key: 3, label: 'X' },
  { key: 4, label: 'J' },
  { key: 5, label: 'V' },
  { key: 6, label: 'S' },
];

export default { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, RADIUS, SHADOW, HABIT_ICONS, WEEK_DAYS };

import { Platform } from 'react-native';

export const COLORS = {
  // Primary Colors
  primary: '#8BC34A',        // Main green
  primaryDark: '#4CAF50',    // Darker green for buttons/headers
  primaryLight: '#DCEDC8',   // Light green for backgrounds
  
  // Accent Colors
  accent: '#76FF03',         // Bright lime accent
  accentLight: '#B2FF59',    // Light accent
  
  // Functional Colors
  success: '#00C853',
  warning: '#FFC107',
  danger: '#FF5252',
  info: '#2196F3',
  
  // Neutral Colors
  text: '#333333',
  subtext: '#757575',
  background: '#FFFFFF',
  surface: '#F5F7FA',
  border: '#E2E8F0',
  cardBackground: '#FFFFFF',
  divider: '#E0E0E0',
  
  // States
  hover: 'rgba(139, 195, 74, 0.08)',
  pressed: 'rgba(139, 195, 74, 0.12)',
  disabled: '#BDBDBD',
  
  // Legacy/Alternative Colors (keeping for backward compatibility)
  bg: "#F3F5FA",      // Legacy - use 'background' instead
  card: "#FFFFFF",    // Legacy - use 'cardBackground' instead
  warn: "#F59E0B",    // Legacy - use 'warning' instead
  
  // Gradients
  gradients: {
    primary: ['#8BC34A', '#4CAF50'],
    accent: ['#76FF03', '#64DD17'],
    success: ['#00E676', '#00C853'],
  }
};

// Spacing System
export const SPACING = {
  xs: 6, 
  sm: 10, 
  md: 14, 
  lg: 18, 
  xl: 24, 
  xxl: 32,
  xxxl: 48,
};

// Typography
export const FONTS = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  families: {
    base: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
};

// Shadows
export const SHADOWS = {
  small: Platform.select({
    web: {
      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
  }),
  medium: Platform.select({
    web: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.15)',
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
  }),
  large: Platform.select({
    web: {
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
  }),
};

// Border Radius
export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
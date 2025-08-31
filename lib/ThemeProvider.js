import React, { createContext, useContext, useState } from 'react';
import { COLORS } from '../../lib/theme';

// Create a theme context
const ThemeContext = createContext();

// Theme provider component
export function ThemeProvider({ children }) {
  // You could extend this with dark mode support later
  const [theme, setTheme] = useState({
    colors: COLORS,
    isDark: false,
  });
  
  return (
    <ThemeContext.Provider value={{ ...theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
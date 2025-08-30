// lib/nb-theme.js
import { extendTheme } from "native-base";

// You already have lib/theme.js; we mirror the same palette here for NB components.

const config = {
  useSystemColorMode: true,
  initialColorMode: "light",
};

const colors = {
  primary: {
    50:  "#EEF2FF",
    500: "#4F46E5",   // main
    600: "#4338CA",
  },
  success: { 500: "#10B981" },
  warning: { 500: "#F59E0B" },
  danger:  { 500: "#EF4444" },
  coolGray: {
    400: "#9CA3AF",
    500: "#6B7280",
    700: "#374151",
    900: "#0F172A",
  },
  border: { 200: "#E9EAEE" },
  bg:     { 50:  "#F3F5FA" },
};

export const nbTheme = extendTheme({
  config,
  colors,
  components: {
    Container: { baseStyle: { px: 4, py: 6, maxW: "1280px" } },
    Input: {
      defaultProps: { size: "md", variant: "filled" },
    },
    IconButton: {
      defaultProps: { size: "md", variant: "subtle" },
    }
  }
});

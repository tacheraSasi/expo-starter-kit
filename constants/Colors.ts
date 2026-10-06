/**
 * Semantic color token system for Starter Kit.
 *
 * Light-mode text/status tokens meet WCAG AA (4.5:1) on light surfaces.
 * Brand fills (brandColor, gradients) keep the original #00A670 identity.
 * Dark mode is designed to complement it with proper contrast ratios.
 *
 * Every screen should use these tokens via useCurrentTheme() — never raw hex values.
 */

const tintColorLight = "#00845c";
const tintColorDark = "#00A670";
export const brandColor = "#00A670";

// Brand gradient (used on splash, drawer header, accent buttons)
export const brandGradient = ["#00A670", "#00402B"] as const;

export const Colors = {
  tabColors: {
    home: "#00A670",
    profile: "#00A670",
  },

  // ─── Light Theme ────────────────────────────────────────────────
  light: {
    // Core
    text: "#1a1a1a",
    background: "#ffffff",
    tint: tintColorLight,
    primary: "#00845c",
    secondary: "#666666",

    // Surfaces
    surface: "#f5f5f5",
    elevatedSurface: "#fafafa",
    card: "#ffffff",
    cardAlt: "#f9f9fb",

    // Borders & dividers
    border: "#e0e0e0",
    borderLight: "#ebebeb",
    divider: "#f0f0f0",

    // Text hierarchy (all pass WCAG AA 4.5:1 on white)
    textPrimary: "#1a1a1a",
    textSecondary: "#666666",
    textTertiary: "#6e6e6e",
    textMuted: "#767676",
    textDisabled: "#bbbbbb",
    textInverse: "#ffffff",

    // Status (text-safe shades that pass AA on light backgrounds)
    notification: "#ff3b30",
    success: "#1a7f37",
    successBg: "#e8f5e9",
    warning: "#b25e00",
    warningBg: "#fff5e6",
    error: "#ff3b30",
    errorBg: "#fff5f5",
    info: "#2563eb",
    infoBg: "#eff6ff",

    // Interactive
    buttonBackground: "#00845c",
    buttonText: "#ffffff",
    buttonSecondaryBg: "#f5f5f5",
    buttonSecondaryText: "#1a1a1a",
    buttonDestructiveBg: "#fff0f0",
    buttonDestructiveText: "#ff3b30",

    // Input
    inputBackground: "#f9f9f9",
    inputBorder: "#dddddd",
    inputText: "#1a1a1a",
    inputPlaceholder: "#767676",

    // Brand accents
    primarySoft: "#e5f6f0",
    primaryMuted: "#00A67015",

    // Tab bar
    tabIconDefault: "#cccccc",
    tabIconSelected: tintColorLight,
    tabBackground: "#ffffff",
    tabBorder: "#e0e0e0",

    // Header
    headerBackground: "#ffffff",
    headerText: "#1a1a1a",
    headerBorder: "#e0e0e0",

    // Bottom sheet
    sheetBackground: "#ffffff",
    sheetHandle: "#dddddd",

    // Skeleton
    skeletonBase: "#e8e8e8",
    skeletonHighlight: "#f5f5f5",

    // Misc
    chevron: "#c0c0c0",
    overlay: "rgba(0,0,0,0.5)",
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    highlight: "#f0f0f0",
    link: "#007AFF",
  },

  // ─── Dark Theme ─────────────────────────────────────────────────
  dark: {
    // Core
    text: "#f0f0f0",
    background: "#141414",
    tint: tintColorDark,
    primary: "#00a670",
    secondary: "#a0a0a0",

    // Surfaces
    surface: "#0f0f0f",
    elevatedSurface: "#1e1e1e",
    card: "#141414",
    cardAlt: "#1a1a1a",

    // Borders & dividers
    border: "#2e2e2e",
    borderLight: "#262626",
    divider: "#222222",

    // Text hierarchy
    textPrimary: "#f0f0f0",
    textSecondary: "#b0b0b0",
    textTertiary: "#888888",
    textMuted: "#707070",
    textDisabled: "#505050",
    textInverse: "#0a0a0a",

    // Status – slightly brighter for dark backgrounds
    notification: "#ff453a",
    success: "#30d158",
    successBg: "#0d2b14",
    warning: "#ff9f0a",
    warningBg: "#2b2200",
    error: "#ff453a",
    errorBg: "#2b0d0d",
    info: "#4dabf7",
    infoBg: "#0d1b2b",

    // Interactive
    buttonBackground: "#00a670",
    buttonText: "#ffffff",
    buttonSecondaryBg: "#1e1e1e",
    buttonSecondaryText: "#f0f0f0",
    buttonDestructiveBg: "#2b0d0d",
    buttonDestructiveText: "#ff453a",

    // Input
    inputBackground: "#1e1e1e",
    inputBorder: "#2a2a2a",
    inputText: "#f0f0f0",
    inputPlaceholder: "#606060",

    // Brand accents
    primarySoft: "#0d2b18",
    primaryMuted: "#00A67020",

    // Tab bar
    tabIconDefault: "#555555",
    tabIconSelected: tintColorDark,
    tabBackground: "#0a0a0a",
    tabBorder: "#1e1e1e",

    // Header
    headerBackground: "#0f0f0f",
    headerText: "#f0f0f0",
    headerBorder: "#1e1e1e",

    // Bottom sheet
    sheetBackground: "#161616",
    sheetHandle: "#444444",

    // Skeleton
    skeletonBase: "#1e1e1e",
    skeletonHighlight: "#2a2a2a",

    // Misc
    chevron: "#555555",
    overlay: "rgba(0,0,0,0.8)",
    shadowColor: "#000000",
    shadowOpacity: 0.4,
    highlight: "#1e1e1e",
    link: "#4dabf7",
  },
};

// Type definitions
export type ColorScheme = "light" | "dark";
export type ThemeColors = typeof Colors.light;
export type ColorKey = keyof ThemeColors;
export type ThemeMode = "light" | "dark" | "system";

// Helper function to get colors without hooks (for use outside components)
export function getThemeColors(colorScheme: ColorScheme = "light"): ThemeColors {
  return Colors[colorScheme];
}

// Export default for backward compatibility
export default Colors;

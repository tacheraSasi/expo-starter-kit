import { StatusBar } from "expo-status-bar";
import { useMemo, useRef } from "react";
import {
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  type ImageStyle,
} from "react-native";
import { useTheme } from "./ThemeProvider";
import type { ThemeColors, ColorScheme } from "../constants/Colors";

/**
 * The canonical theme hook for every screen and component.
 *
 * Returns all semantic tokens from Colors.ts plus convenience flags.
 * Usage:  const theme = useCurrentTheme();
 */
export function useCurrentTheme() {
  const { colors, colorScheme, isDark, isLight } = useTheme();

  return {
    // ── Theme state ───────────────────────────
    colorScheme,
    isDark,
    isLight,

    // ── Core ──────────────────────────────────
    text: colors.text,
    background: colors.background,
    primary: colors.primary,
    secondary: colors.secondary,
    tint: colors.tint,

    // ── Surfaces ──────────────────────────────
    surface: colors.surface,
    elevatedSurface: colors.elevatedSurface,
    card: colors.card,
    cardAlt: colors.cardAlt,

    // ── Borders & dividers ────────────────────
    border: colors.border,
    borderLight: colors.borderLight,
    divider: colors.divider,

    // ── Text hierarchy ────────────────────────
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    textTertiary: colors.textTertiary,
    textMuted: colors.textMuted,
    textDisabled: colors.textDisabled,
    textInverse: colors.textInverse,

    // ── Status ────────────────────────────────
    success: colors.success,
    successBg: colors.successBg,
    warning: colors.warning,
    warningBg: colors.warningBg,
    error: colors.error,
    errorBg: colors.errorBg,
    info: colors.info,
    infoBg: colors.infoBg,
    notification: colors.notification,

    // ── Interactive ───────────────────────────
    buttonBackground: colors.buttonBackground,
    buttonText: colors.buttonText,
    buttonSecondaryBg: colors.buttonSecondaryBg,
    buttonSecondaryText: colors.buttonSecondaryText,
    buttonDestructiveBg: colors.buttonDestructiveBg,
    buttonDestructiveText: colors.buttonDestructiveText,

    // ── Input ─────────────────────────────────
    inputBackground: colors.inputBackground,
    inputBorder: colors.inputBorder,
    inputText: colors.inputText,
    inputPlaceholder: colors.inputPlaceholder,

    // ── Brand accents ─────────────────────────
    primarySoft: colors.primarySoft,
    primaryMuted: colors.primaryMuted,

    // ── Tab bar ───────────────────────────────
    tabIconDefault: colors.tabIconDefault,
    tabIconSelected: colors.tabIconSelected,
    tabBackground: colors.tabBackground,
    tabBorder: colors.tabBorder,

    // ── Header ────────────────────────────────
    headerBackground: colors.headerBackground,
    headerText: colors.headerText,
    headerBorder: colors.headerBorder,

    // ── Bottom sheet ──────────────────────────
    sheetBackground: colors.sheetBackground,
    sheetHandle: colors.sheetHandle,

    // ── Skeleton ──────────────────────────────
    skeletonBase: colors.skeletonBase,
    skeletonHighlight: colors.skeletonHighlight,

    // ── Misc ──────────────────────────────────
    chevron: colors.chevron,
    overlay: colors.overlay,
    shadowColor: colors.shadowColor,
    shadowOpacity: colors.shadowOpacity,
    highlight: colors.highlight,
    link: colors.link,

    // ── Backward-compat aliases ───────────────
    // Screens that already used these names keep working.
    subtleText: colors.textSecondary,
    mutedText: colors.textMuted,
    cardBackground: colors.card,

    // ── Status bar ────────────────────────────
    statusBarStyle: isDark ? ("light" as const) : ("dark" as const),
  };
}

/** Return type so screens can type their style-creator parameter. */
export type AppTheme = ReturnType<typeof useCurrentTheme>;

// ─── useThemedStyles ──────────────────────────────────────────────
//
// Creates a memoized StyleSheet that re-computes only when the
// color scheme changes.
//
//   const useStyles = createStyles((theme) => ({
//     container: { flex: 1, backgroundColor: theme.background },
//     title:     { color: theme.text, fontSize: 18 },
//   }));
//
//   function MyScreen() {
//     const styles = useStyles();
//     ...
//   }
//

type NamedStyles<T> = {
  [P in keyof T]: ViewStyle | TextStyle | ImageStyle | string;
};

/**
 * Factory that returns a hook.  Call the hook inside your component
 * to get a theme-aware StyleSheet that updates reactively.
 */
export function createStyles<T extends NamedStyles<T>>(
  factory: (theme: AppTheme) => T,
) {
  return function useStyles(): T {
    const theme = useCurrentTheme();
    // Cache the StyleSheet by colorScheme so it's only rebuilt on actual theme change
    const cacheRef = useRef<{ scheme: string; styles: T } | null>(null);

    return useMemo(() => {
      if (cacheRef.current?.scheme === theme.colorScheme) {
        return cacheRef.current.styles;
      }
      const raw = factory(theme);
      const styles = StyleSheet.create(raw as any) as unknown as T;
      cacheRef.current = { scheme: theme.colorScheme, styles };
      return styles;
    }, [theme.colorScheme]);
  };
}

/**
 * Status Bar Component that automatically adapts to theme.
 */
export function ThemeStatusBar() {
  const theme = useCurrentTheme();

  return <StatusBar style={theme.statusBarStyle} />;
}

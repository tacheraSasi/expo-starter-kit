/**
 * Theme-aware primitive components.
 *
 * These automatically pick up colors from the active theme via useCurrentTheme().
 * Use them as drop-in replacements for RN's View / Text / ScrollView
 * when you want automatic background / text color.
 */

import React from "react";
import {
  Text as DefaultText,
  View as DefaultView,
  ScrollView as DefaultScrollView,
} from "react-native";
import { useCurrentTheme } from "@/context/CentralTheme";

// ── Props ──────────────────────────────────────────────────────────

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];
export type ScrollViewProps = ThemeProps & DefaultScrollView["props"];

// ── ThemedText ─────────────────────────────────────────────────────

export function ThemedText(props: TextProps) {
  const { style, lightColor, darkColor, ...rest } = props;
  const theme = useCurrentTheme();
  const color = (theme.isDark ? darkColor : lightColor) ?? theme.text;

  return <DefaultText style={[{ color }, style]} {...rest} />;
}

// ── ThemedView ─────────────────────────────────────────────────────

export function ThemedView(props: ViewProps) {
  const { style, lightColor, darkColor, ...rest } = props;
  const theme = useCurrentTheme();
  const backgroundColor =
    (theme.isDark ? darkColor : lightColor) ?? theme.background;

  return <DefaultView style={[{ backgroundColor }, style]} {...rest} />;
}

// ── ThemedCard ─────────────────────────────────────────────────────
// A surface with card background, border, and shadow.

export function ThemedCard(props: ViewProps) {
  const { style, ...rest } = props;
  const theme = useCurrentTheme();

  return (
    <DefaultView
      style={[
        {
          backgroundColor: theme.card,
          borderRadius: 14,
          borderWidth: theme.isDark ? 1 : 0,
          borderColor: theme.border,
          shadowColor: theme.shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.shadowOpacity,
          shadowRadius: 6,
          elevation: 2,
        },
        style,
      ]}
      {...rest}
    />
  );
}

// ── ThemedDivider ──────────────────────────────────────────────────

export function ThemedDivider({
  style,
  ...rest
}: Omit<DefaultView["props"], "children">) {
  const theme = useCurrentTheme();

  return (
    <DefaultView
      style={[
        {
          height: 1,
          backgroundColor: theme.divider,
        },
        style,
      ]}
      {...rest}
    />
  );
}

// ── ThemedScrollView ───────────────────────────────────────────────

export function ThemedScrollView(props: ScrollViewProps) {
  const { style, lightColor, darkColor, ...rest } = props;
  const theme = useCurrentTheme();
  const backgroundColor =
    (theme.isDark ? darkColor : lightColor) ?? theme.background;

  return (
    <DefaultScrollView
      style={[{ backgroundColor }, style]}
      showsVerticalScrollIndicator={false}
      {...rest}
    />
  );
}

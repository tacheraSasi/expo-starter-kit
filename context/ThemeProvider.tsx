import React, {
  createContext,
  useContext,
  useEffect,
  type PropsWithChildren,
} from "react";
import { Appearance, useColorScheme } from "react-native";
import {
  Colors,
  type ColorScheme,
  type ThemeColors,
} from "../constants/Colors";
import { useSettingsStore } from "../stores/settings";

// Theme context interface
interface ThemeContextType {
  colors: ThemeColors;
  colorScheme: ColorScheme;
  isDark: boolean;
  isLight: boolean;
}

// Create the theme context
const ThemeContext = createContext<ThemeContextType | null>(null);

/**
 * Resolves the effective color scheme from the user's preference.
 *  - "light" / "dark" → use that directly
 *  - "system"          → follow the device setting
 */
function resolveColorScheme(
  themeMode: "light" | "dark" | "system",
  systemScheme: ColorScheme,
): ColorScheme {
  if (themeMode === "system") return systemScheme;
  return themeMode;
}

// Theme Provider Component
export function ThemeProvider({ children }: PropsWithChildren) {
  const rawScheme = useColorScheme();
  const systemColorScheme: ColorScheme =
    rawScheme === "dark" ? "dark" : "light";

  // Read persisted theme preference from Zustand settings store
  const themeMode = useSettingsStore((s) => s.themeMode);
  const colorScheme = resolveColorScheme(themeMode, systemColorScheme);
  const colors = Colors[colorScheme];

  // Keep native surfaces (bottom sheets, alerts, pickers, keyboard) on the
  // in-app theme. Without this they follow the device theme, so choosing dark
  // inside the app still opened a light native sheet.
  useEffect(() => {
    Appearance.setColorScheme(
      themeMode === "system" ? "unspecified" : colorScheme,
    );
  }, [themeMode, colorScheme]);

  const contextValue: ThemeContextType = {
    colors,
    colorScheme,
    isDark: colorScheme === "dark",
    isLight: colorScheme === "light",
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Main hook to get theme context
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback if provider is not available (shouldn't happen in normal flow)
    return {
      colors: Colors.light,
      colorScheme: "light",
      isDark: false,
      isLight: true,
    };
  }
  return context;
}

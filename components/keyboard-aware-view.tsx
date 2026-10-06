import { createStyles } from "@/context/CentralTheme";
import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from "react-native";

interface KeyboardAwareViewProps {
  children: ReactNode;
  style?: ViewStyle;
  keyboardVerticalOffset?: number;
}

/**
 * A reusable wrapper component that handles keyboard avoidance
 * consistently across iOS and Android.
 *
 * - iOS: Uses "padding" behavior for smooth keyboard animation
 * - Android: Uses "height" which is the most reliable behavior for pushing
 *   content up above the keyboard. Requires `windowSoftInputMode="adjustResize"`
 *   in AndroidManifest.xml (configured via expo config plugin).
 */
export function KeyboardAwareView({
  children,
  style,
  keyboardVerticalOffset = 0,
}: KeyboardAwareViewProps) {
  const styles = getStyles();
  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.select({
        ios: "padding",
        android: "height",
      })}
      keyboardVerticalOffset={keyboardVerticalOffset}
      enabled={true}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

const getStyles = createStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
}));

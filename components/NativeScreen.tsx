import HapticTouchableOpacity from "@/components/HapticTouchableOpacity";
import { useCurrentTheme } from "@/context/CentralTheme";
import { Ionicons } from "@expo/vector-icons";
import { Host } from "@expo/ui";
import { useNavigation } from "expo-router";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface NativeScreenProps {
  title: string;
  children: ReactNode;
  /** Hide the header entirely (e.g. for a full-bleed native list). */
  hideHeader?: boolean;
}

/**
 * Shell for screens that render platform-native UI from `@expo/ui`.
 *
 * The `Host` dispatches to SwiftUI on iOS and Jetpack Compose on Android, so
 * everything inside it is a real native view. The small header stays in React
 * Native because it holds the drawer button and the app title.
 */
export default function NativeScreen({
  title,
  children,
  hideHeader = false,
}: NativeScreenProps) {
  const theme = useCurrentTheme();
  const navigation = useNavigation();

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {!hideHeader && (
        <View style={styles.header}>
          <HapticTouchableOpacity
            hapticType="light"
            style={[styles.menuButton, { backgroundColor: theme.card }]}
            onPress={() => (navigation as any)?.openDrawer?.()}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
          >
            <Ionicons name="menu" size={22} color={theme.text} />
          </HapticTouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        </View>
      )}

      <Host
        style={styles.host}
        // The host derives the native theme from these, so system controls
        // (picker menus, switches, refresh indicators) match the app.
        colorScheme={theme.isDark ? "dark" : "light"}
        seedColor={theme.primary}
      >
        {children}
      </Host>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  host: { flex: 1 },
});

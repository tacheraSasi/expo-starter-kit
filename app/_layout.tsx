import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
export { ErrorBoundary } from "@/components/ErrorBoundary";
import { LogBox } from "react-native";
import { Toaster, YoooProvider } from "yooo-native";
import { SessionProvider } from "../context/ctx";
import { ThemeProvider, useTheme } from "../context/ThemeProvider";
import { SplashScreenController } from "../components/splash";
import AppAlertProvider from "../components/AppAlertProvider";
import OfflineBanner from "../components/OfflineBanner";
import { useAppInit } from "@/hooks/_init/useAppInit";
import "../i18n";
import { ThemeStatusBar, useCurrentTheme } from "@/context/CentralTheme";
// Suppress known non-actionable warnings in React Native internals and
// third-party libraries that we cannot control.
LogBox.ignoreLogs([
  // React Native New Architecture: setLayoutAnimationEnabledExperimental is a no-op
  /setLayoutAnimationEnabledExperimental/,
  // Expo Router's useLinking fires a state update before the component mounts.
  /Can't perform a React state update on a component that hasn't mounted yet/,
]);

export default function Root() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ThemeStatusBar />
        <ThemedYoooShell>
          <SessionProvider>
            <AppAlertProvider>
              <SplashScreenController />
              <OfflineBanner />
              <RootNavigator />
            </AppAlertProvider>
          </SessionProvider>
          <ThemedToaster />
        </ThemedYoooShell>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function ThemedYoooShell({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useTheme();
  return <YoooProvider theme={colorScheme}>{children}</YoooProvider>;
}

function ThemedToaster() {
  return <Toaster position="top-center" closeButton />;
}

function RootNavigator() {
  const { isReady, error, session, isOnboarded } = useAppInit();
  const theme = useCurrentTheme();

  // On font load failure, render anyway so the app falls back to system
  // fonts instead of hanging on a blank screen.
  if (!isReady && !error) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(core)" />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Protected guard={!isOnboarded}>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

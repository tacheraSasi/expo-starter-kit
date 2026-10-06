import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useAuthSession } from "@/context/ctx";
import { useGlobalErrorHandler } from "@/hooks/useGlobalErrorHandler";
import {
  useNotificationBadgeSync,
  usePushNotifications,
} from "@/hooks/usePushNotifications";
import { useOTAUpdates } from "@/hooks/useOTAUpdates";
import { useAutoRefreshToken } from "@/hooks/useAutoRefreshToken";
import { i18nReady } from "@/i18n";
import logger from "@/lib/logger";

export interface AppInitResult {
  isReady: boolean;
  error: Error | null;
  session: string | null;
  isOnboarded: boolean;
  isOnboardingLoading: boolean;
}

/**
 * Composes every startup concern previously spread across the root layout:
 * fonts, global error handling, auth/session, push notifications, OTA
 * updates, token refresh, and i18n readiness.
 *
 * Must be mounted inside <SessionProvider /> because several child hooks
 * (useSession, useOTAUpdates) depend on auth context.
 */
export function useAppInit(): AppInitResult {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const { session, isOnboarded, isOnboardingLoading } = useAuthSession();

  useEffect(() => {
    if (fontError) {
      logger.warn("Font loading failed; falling back to system fonts:", fontError);
    }
  }, [fontError]);

  useGlobalErrorHandler();

  useAutoRefreshToken(session);

  // Gating for the device language: keep the splash up until the active
  // language resources are loaded so no screen ever paints raw keys.
  const [i18nLoaded, setI18nLoaded] = useState(false);
  useEffect(() => {
    let mounted = true;
    void i18nReady.then(() => {
      if (mounted) setI18nLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Initialize push notification listeners (runs globally)
  usePushNotifications();

  // Keep the unread-notification badge in sync with pushes + app foregrounds
  useNotificationBadgeSync();

  // Check for OTA updates
  useOTAUpdates();

  const isReady = fontsLoaded && !isOnboardingLoading && i18nLoaded;

  return {
    isReady,
    error: fontError,
    session,
    isOnboarded,
    isOnboardingLoading,
  };
}

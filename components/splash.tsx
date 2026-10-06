import { useEffect } from "react";
import { SplashScreen } from "expo-router";
import { useAuthSession } from "../context/ctx";

SplashScreen.preventAutoHideAsync();

/**
 * Keeps the native splash screen visible until the session has been
 * restored. The root `useAppInit()` gate (fonts, i18n, onboarding state)
 * handles the remaining readiness before the navigator mounts.
 *
 * This component renders NO visible UI of its own. It only controls when
 * the native splash screen is hidden. Done in an effect (not during render)
 * so it fires after the frame commits; SplashScreen.hide() is idempotent.
 */
export function SplashScreenController() {
  const { isLoading } = useAuthSession();

  useEffect(() => {
    if (!isLoading) {
      void SplashScreen.hide();
    }
  }, [isLoading]);

  // Always return null — this component has NO visual output.
  return null;
}

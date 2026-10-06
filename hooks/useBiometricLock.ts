import { useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { useSettingsStore } from "@/stores/settings";
import logger from "@/lib/logger";

/**
 * Guards the (core) routes with biometric/passcode authentication.
 * Only activates when `biometricLockEnabled` is true in settings.
 * Prompts when the app comes back to foreground.
 */
export function useBiometricLock() {
  const biometricLockEnabled = useSettingsStore(
    (s) => s.biometricLockEnabled,
  );
  const [isLocked, setIsLocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const appState = useRef(AppState.currentState);
  const hasCheckedOnMount = useRef(false);

  const authenticate = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock App",
        fallbackLabel: "Use Passcode",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });
      if (result.success) {
        setIsLocked(false);
      }
    } catch (e) {
      logger.warn("Biometric auth failed", e);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Lock on mount if enabled
  useEffect(() => {
    if (biometricLockEnabled && !hasCheckedOnMount.current) {
      hasCheckedOnMount.current = true;
      setIsLocked(true);
    }
  }, [biometricLockEnabled]);

  // Lock when app goes to background, unlock via biometric when it returns
  useEffect(() => {
    if (!biometricLockEnabled) {
      setIsLocked(false);
      return;
    }

    const sub = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (
          appState.current.match(/active/) &&
          nextState.match(/inactive|background/)
        ) {
          setIsLocked(true);
        }
        appState.current = nextState;
      },
    );

    return () => sub.remove();
  }, [biometricLockEnabled]);

  return { isLocked, authenticate, isAuthenticating };
}

/** Check if the device supports biometric or passcode authentication */
export async function isBiometricAvailable(): Promise<{
  available: boolean;
  biometricType: string;
}> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  const types =
    await LocalAuthentication.supportedAuthenticationTypesAsync();

  const hasFace = types.includes(
    LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
  );
  const hasFingerprint = types.includes(
    LocalAuthentication.AuthenticationType.FINGERPRINT,
  );

  let biometricType = "Passcode";
  if (hasFace) biometricType = "Face ID";
  else if (hasFingerprint) biometricType = "Fingerprint";

  return {
    available: compatible && enrolled,
    biometricType,
  };
}

import { useCallback } from "react";
import { useStorageState } from "./useStorageState";

const ONBOARDING_KEY = "user-onboarded";

export function useOnboardingState() {
  const [state, setState] = useStorageState(ONBOARDING_KEY);

  const isLoading = state[0];
  const isOnboarded = state[1] === "true";

  const setOnboarded = useCallback(
    (onboarded: boolean) => {
      setState(onboarded ? "true" : "false");
    },
    [setState],
  );

  const completeOnboarding = useCallback(() => {
    setOnboarded(true);
  }, [setOnboarded]);

  const resetOnboarding = useCallback(() => {
    setOnboarded(false);
  }, [setOnboarded]);

  return {
    isLoading,
    isOnboarded,
    setOnboarded,
    completeOnboarding,
    resetOnboarding,
  };
}

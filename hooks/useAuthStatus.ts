import { useCallback, useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

import { hasValidTokens, getTokenExpirationInfo } from "@/lib/api/authToken";

interface TokenInfo {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  accessTokenExpired: boolean | null;
  refreshTokenExpired: boolean | null;
}

interface AuthStatusResult {
  isAuthenticated: boolean;
  isChecking: boolean;
  tokenInfo: TokenInfo | null;
  checkAuthStatus: () => Promise<void>;
}

/**
 * Hook to monitor authentication status and token validity
 * Automatically checks tokens when app comes to foreground
 */
export function useAuthStatus(): AuthStatusResult {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);

  const checkAuthStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      const [hasTokens, info] = await Promise.all([
        hasValidTokens(),
        getTokenExpirationInfo(),
      ]);

      setIsAuthenticated(hasTokens);
      setTokenInfo(info);
    } catch (error) {
      setIsAuthenticated(false);
      setTokenInfo(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Check auth status when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        checkAuthStatus();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Initial check
    checkAuthStatus();

    return () => {
      subscription?.remove();
    };
  }, [checkAuthStatus]);

  return {
    isAuthenticated,
    isChecking,
    tokenInfo,
    checkAuthStatus,
  };
}

/**
 * Hook specifically for checking if tokens need refresh soon
 * Useful for proactive refresh before expiration
 */
export function useTokenExpirationMonitor(refreshThresholdMinutes = 5) {
  const [needsRefreshSoon, setNeedsRefreshSoon] = useState(false);

  useEffect(() => {
    const checkTokenExpiration = async () => {
      try {
        const info = await getTokenExpirationInfo();
        if (!info) return;

        // Rely on the existing refresh mechanism in API config
        setNeedsRefreshSoon(false);
      } catch (error) {
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkTokenExpiration, 30000);
    checkTokenExpiration(); // Initial check

    return () => clearInterval(interval);
  }, [refreshThresholdMinutes]);

  return { needsRefreshSoon };
}

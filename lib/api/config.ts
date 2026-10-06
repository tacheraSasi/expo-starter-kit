import { router } from "expo-router";

import axios from "axios";

import { BASE_URL } from "@/constants/constants";
import { isJwtExpired } from "../utils";

import { authToken, clearCache, saveUser, setAuthToken } from "./authToken";
import { getClientContextHeaders, getMobileAuthHeaders } from "./mobileAuth";
import logger from "../logger";

function createApiInstance(authenticate: boolean) {
  const config = axios.create({ baseURL: BASE_URL, timeout: 30000 });
  config.defaults.headers.post["Content-Type"] = "application/json";

  // Client context (mobile key, app version, os) on every request so the
  // backend ActivityTracker can attribute events to the mobile app.
  Object.assign(config.defaults.headers.common, getClientContextHeaders());

  // Dev-only: log request durations
  if (__DEV__) {
    config.interceptors.request.use(
      (c) => {
        (c as any)._startTime = Date.now();
        return c;
      },
      (error) => Promise.reject(error),
    );

    config.interceptors.response.use(
      (response) => {
        const startTime = (response.config as any)._startTime;
        if (startTime) {
          const duration = Date.now() - startTime;
          const method = (response.config.method || "").toUpperCase();
          const url = response.config.url || "";
          const elapsed = duration >= 1000 ? (duration / 1000).toFixed(1) + "s" : duration + "ms";
          logger.log(`⚡ ${method} ${url} (${elapsed})`);
        }
        return response;
      },
      (error) => {
        const req = error.config;
        const startTime = (req as any)?._startTime;
        if (startTime) {
          const duration = Date.now() - startTime;
          const method = (req?.method || "").toUpperCase();
          const url = req?.url || "";
          const elapsed = duration >= 1000 ? (duration / 1000).toFixed(1) + "s" : duration + "ms";
          logger.warn(`⚡ ${method} ${url} (${elapsed}) FAILED`);
        }
        return Promise.reject(error);
      },
    );
  }

  if (authenticate) {
    config.interceptors.request.use(
      async (c) => {
        let token = await authToken("access");
        if (token) {
          if (isJwtExpired(token)) {
            const refreshed = await refreshAuthToken();
            if (refreshed) {
              c.headers.Authorization = "Bearer " + refreshed;
            } else {
              router.replace("/(auth)/login");
              return Promise.reject(
                new Error("Token expired and refresh failed"),
              );
            }
          } else {
            c.headers.Authorization = "Bearer " + token;
          }
        } else {
          const refreshed = await refreshAuthToken();
          if (refreshed) {
            c.headers.Authorization = "Bearer " + refreshed;
          } else {
            router.replace("/(auth)/login");
            return Promise.reject(
              new Error("No valid tokens available. Please log in."),
            );
          }
        }
        return c;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor to handle token refresh
    config.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const errorMessage =
          error.response?.data?.message || error.response?.data?.error || "";

        // Detect auth-related error messages that require re-login
        const authErrorCodes = [
          "NO_TOKEN",
          "TOKEN_EXPIRED",
          "INVALID_TOKEN",
          "TOKEN_REVOKED",
        ];
        const authErrorPatterns = [
          "Invalid token issuer",
          "Token has been revoked",
          "Unauthenticated",
          "Token is invalid",
          "Token not provided",
          "No token provided",
        ];
        const errorCode = error.response?.data?.error_code;
        const isAuthError =
          (errorCode && authErrorCodes.includes(errorCode)) ||
          authErrorPatterns.some((pattern) =>
            errorMessage.toLowerCase().includes(pattern.toLowerCase()),
          );

        if (isAuthError) {
          logger.warn(
            "Auth error detected, signing out and redirecting to login:",
            errorMessage,
          );
          await clearCache();
          router.replace("/(auth)/login");
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshed = await refreshAuthToken();
          if (refreshed) {
            originalRequest.headers.Authorization = "Bearer " + refreshed;
            return config(originalRequest);
          } else {
            router.replace("/(auth)/login");
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  return config;
}

// One axios instance per auth mode. Built once at module level so
// interceptors are attached a single time instead of per api() call
// (~200 call sites), and every request shares the same header defaults.
const authedApi = createApiInstance(true);
const publicApi = createApiInstance(false);

const api = (authenticate: any) => (authenticate ? authedApi : publicApi);

// Tracking ongoing refresh to prevent multiple simultaneous refresh calls
let refreshTokenPromise: Promise<string | null> | null = null;

async function refreshAuthToken(): Promise<string | null> {
  // Return existing refresh promise if one is already in progress
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = performTokenRefresh();
  const result = await refreshTokenPromise;
  refreshTokenPromise = null; // Reset after completion

  return result;
}

async function performTokenRefresh(): Promise<string | null> {
  try {
    const refreshToken = await authToken("refresh");
    if (!refreshToken || isJwtExpired(refreshToken)) {
      logger.warn("Refresh token is null or expired");
      router.replace("/(auth)/login");
      return null;
    }

    logger.log("Attempting to refresh token...");

    const requestBody = {
      refresh_token: refreshToken,
    };
    const requestUri = "auth/refresh";

    // Call refresh endpoint with refresh_token in body.
    // getMobileAuthHeaders is a no-op unless EXPO_PUBLIC_MOBILE_API_KEY/SECRET are set.
    const response = await axios.post(`${BASE_URL}${requestUri}`, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getMobileAuthHeaders("POST", requestUri, requestBody),
      },
      timeout: 10000, // 10 second timeout
    });

    const { success, data, message, token, refresh_token } = response.data;

    // Support both `{ success, data: { tokens: { access_token, refresh_token } } }`
    // and flat `{ token, refresh_token }` response shapes.
    const accessToken =
      data?.tokens?.access_token ?? data?.access_token ?? token;
    const newRefreshToken =
      data?.tokens?.refresh_token ?? data?.refresh_token ?? refresh_token;

    if (!accessToken) {
      throw new Error(message || "Token refresh failed");
    }

    // Store new tokens
    await setAuthToken({
      access: accessToken,
      refresh: newRefreshToken ?? null,
    });

    // Refresh may carry a fresh user payload — persist it when present
    // so permission gates stay in sync.
    const refreshedUser = (data as any)?.user;
    if (refreshedUser) {
      try {
        await saveUser({
          id: String(
            refreshedUser.uuid ?? refreshedUser.id ?? refreshedUser.ID ?? "",
          ),
          name: refreshedUser.name ?? refreshedUser.fullName ?? "",
          fullName: refreshedUser.fullName ?? refreshedUser.name ?? "",
          email: refreshedUser.email ?? "",
          role: refreshedUser.role ?? refreshedUser.roles?.[0] ?? null,
          ...refreshedUser,
        });
      } catch (persistError) {
        logger.warn("Failed to persist refreshed user:", persistError);
      }
    }

    logger.log("Token refresh successful");
    return accessToken;
  } catch (error: any) {
    logger.error("Token refresh failed:", error);

    // Distinguish "refresh token is dead" from transient failures (network, 5xx).
    const status = error.response?.status;
    const fatalCodes = ["TOKEN_REVOKED", "INVALID_TOKEN", "REFRESH_TOKEN_EXPIRED"];
    const fatalMessages = ["expired", "Invalid token", "revoked"];
    const msg = error.response?.data?.message || "";
    const isFatal =
      status === 401 ||
      fatalCodes.includes(error.response?.data?.error_code) ||
      fatalMessages.some((p) => msg.toLowerCase().includes(p.toLowerCase()));

    if (isFatal) {
      await clearCache();
      router.replace("/(auth)/login");
    } else {
      // Network/timeout/5xx — keep cached tokens so the next request can retry.
      logger.warn("Transient refresh failure, keeping cached tokens");
    }
    return null;
  }
}

export default api;

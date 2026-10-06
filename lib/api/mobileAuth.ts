import { API_PREFIX } from "@/constants/constants";
import * as Application from "expo-application";
import { Platform } from "react-native";
import CryptoJS from "crypto-js";

// Mobile API configuration - loaded from environment variables
const MOBILE_API_KEY = process.env.EXPO_PUBLIC_MOBILE_API_KEY || "";
const MOBILE_API_SECRET = process.env.EXPO_PUBLIC_MOBILE_API_SECRET || "";

/**
 * Headers sent on every API request so the backend ActivityTracker can
 * classify the client as mobile and record os + app version in PostHog
 * events. The backend falls back to User-Agent parsing when these are
 * absent, but explicit headers are authoritative.
 */
export const getClientContextHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (MOBILE_API_KEY) {
    headers["X-Mobile-API-Key"] = MOBILE_API_KEY;
  }
  const version = Application.nativeApplicationVersion;
  if (version) {
    headers["X-App-Version"] = version;
  }
  if (Platform.OS === "ios") {
    headers["X-App-OS"] = "ios";
  } else if (Platform.OS === "android") {
    headers["X-App-OS"] = "android";
  }
  return headers;
};

/**
 * Generate HMAC-SHA256 signature for mobile API requests
 * Formula: SIGNATURE = HMAC-SHA256(method + uri + body, secret)
 */
const generateSignature = (method: string, uri: string, body: any): string => {
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
    const prefixedUri = API_PREFIX + uri.replace(new RegExp(`^${API_PREFIX}`), ""); // Ensuriung URI starts with API_PREFIX
    const message = method.toUpperCase() + prefixedUri + bodyString;
    const signature = CryptoJS.HmacSHA256(message, MOBILE_API_SECRET);
    return signature.toString(CryptoJS.enc.Hex);
};

/**
 * Generate mobile auth headers with dynamic signature
 */
export const getMobileAuthHeaders = (method: string, uri: string, body: any) => {
    const signature = generateSignature(method, uri, body);

    return {
        "X-Mobile-API-Key": MOBILE_API_KEY,
        "X-Request-Signature": signature,
    };
};

import { jwtDecode } from "jwt-decode";

import i18n from "../i18n";

type JwtPayload = {
  exp: number; // expiration time in seconds
  [key: string]: any;
};

/**
 * Check if the jwt token is expired
 * @param token jwt token to be verified in string format
 * @param skewSeconds number of seconds to consider the token expired before actual expiration (default: 30 seconds)
 * @returns `True` if the token has expired
 */
export function isJwtExpired(token: string, skewSeconds = 30): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if (!decoded.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now + skewSeconds;
  } catch {
    return true;
  }
}


/**
 * Locale tag for date/time formatting that follows the active app language.
 */
export function getDateLocale(): string {
  return i18n.language === "sw" ? "sw" : "en-GB";
}

/**
 * Format a number as currency using locale-aware formatting.
 * Override locale/currency per project needs.
 * @param amount The numeric amount to format
 * @returns Formatted currency string e.g. "$1,500"
 */
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount || 0);
}

/**
 * Format a large currency amount in a compact form (e.g. "$1.5M").
 * @param amount The numeric amount
 * @returns Compact formatted string
 */
export function formatCurrencyCompact(amount: number): string {
  const abs = Math.abs(amount || 0);
  if (abs >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
}

/**
 * Format duration in seconds to human readable format
 * @param seconds number
 * @returns Formatted duration string (e.g., "2:30", "1:23:45")
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
}



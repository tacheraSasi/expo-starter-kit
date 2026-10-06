import { AccessibilityInfo } from "react-native";

/**
 * Screen-reader announcement for dynamic content that has no focus change:
 * scan results, cart additions, totals, counters. Respects the OS
 * screen-reader setting; a no-op otherwise.
 */
export function announce(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}

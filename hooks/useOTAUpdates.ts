import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import * as Updates from "expo-updates";
import * as Notifications from "expo-notifications";
import { toast } from "yooo-native";
import { useTranslation } from "react-i18next";
import { useHaptics } from "./useHaptics";
import logger from "@/lib/logger";
import { useAuthUser } from "@/context/ctx";
import { mmkv } from "@/lib/storage/mmkv";
import { APP_VERSION } from "@/constants/version";

const OTA_UPDATE_NOTIFICATION_ID = "ota-update-ready";
const REMINDER_DELAY_MS = 1 * 60 * 1000;

const OTA_LAST_VERSION_KEY = "ota:last-version";
const OTA_LAST_UPDATED_KEY = "ota:last-updated";

type NotifiedState = "available" | "downloaded" | "notified";

/**
 * Silent OTA updates with polite delight:
 *
 * 1. Silent by default → check on foreground, download in background.
 *    No modal / no prompt. The update applies on next cold start.
 * 2. Toast on completion → immediate, non-blocking confirmation that a
 *    new version is ready ("it'll be applied next time you reopen").
 * 3. Local push reminder → if the user backgrounds the app before
 *    relaunching, a scheduled local notification nudges them to reopen.
 * 4. Haptics → a light "success" tick the moment the update lands,
 *    making it feel premium without interrupting the user.
 */
export function useOTAUpdates() {
  const { isUpdateAvailable } = Updates.useUpdates();
  const { success, light } = useHaptics();
  const { t } = useTranslation();
  const { user } = useAuthUser();

  // Track what we've already done for the current update so a
  // re-render (e.g. AppState flip) doesn't re-toast / re-notify.
  const stateRef = useRef<NotifiedState>("available");
  const cancelledRef = useRef(false);

  // Reset cancellation flag on (re)mount.
  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  // 1) Check for updates when the app returns to the foreground.
  useEffect(() => {
    if (__DEV__) return;

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        Updates.checkForUpdateAsync().catch(() => {});
      }
    });

    return () => subscription.remove();
  }, []);

  // 2-4) React to an available update: download silently, then toast +
  // haptic + schedule a reminder notification.
  useEffect(() => {
    if (!isUpdateAvailable) {
      stateRef.current = "available";
      return;
    }

    if (stateRef.current !== "available") return;
    stateRef.current = "downloaded";

    let cancelledLocal = false;

    (async () => {
      // --- Silent download ---
      try {
        await Updates.fetchUpdateAsync();
      } catch (err) {
        logger.warn("OTA fetchUpdateAsync failed:", err);

        // Soft, non-scary toast so the user knows the next launch may
        // still pick up the update later.
        try {
          toast.info(t("common:ota.downloadFailed"));
          void light();
        } catch {
          /* toast may be unmounted */
        }
        return;
      }

      if (cancelledLocal || cancelledRef.current) return;

      // --- Persist: remember this OTA version for in-app display ---
      try {
        mmkv.set(OTA_LAST_VERSION_KEY, APP_VERSION);
        mmkv.set(OTA_LAST_UPDATED_KEY, Date.now());
      } catch {
        /* storage best-effort */
      }

      // --- Delight: haptic + toast ---
      try {
        void success();
      } catch {
        /* haptics best-effort */
      }

      try {
        toast.success(t("common:ota.readyTitle"), {
          description: t("common:ota.readyBody"),
          duration: 6000,
        });
      } catch {
        /* toast may be unmounted */
      }

      // --- Reminder: local push (covers backgrounded users) ---
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted") return;
        if (cancelledLocal || cancelledRef.current) return;

        // Replace any previously scheduled reminder - avoid piling up.
        await Notifications.cancelScheduledNotificationAsync(
          OTA_UPDATE_NOTIFICATION_ID,
        ).catch(() => {});

        const triggerDate = new Date(Date.now() + REMINDER_DELAY_MS);
        const firstName = user?.name?.trim?.() || "";

        await Notifications.scheduleNotificationAsync({
          identifier: OTA_UPDATE_NOTIFICATION_ID,
          content: {
            title: firstName
              ? t("common:ota.pushTitle", { name: firstName })
              : t("common:ota.pushTitleGeneric"),
            body: t("common:ota.pushBody"),
            sound: true,
            vibrate: Platform.OS === "android" ? [0, 100, 180, 100] : undefined,
            data: {
              type: "ota_update_ready",
              url: "/(core)/(drawer)/(tabs)/home",
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
          },
        });

        stateRef.current = "notified";
      } catch (err) {
        logger.warn("Failed to schedule OTA update notification:", err);
      }
    })();

    return () => {
      cancelledLocal = true;
    };
  }, [isUpdateAvailable, success, light, t, user?.name]);
}

// ── Read helpers ────────────────────────────────────────────────

/** Last successfully applied OTA version string (e.g. "v1.1.33 (gfweubr6)"). */
export function getLastOTAUpdateVersion(): string | null {
  return mmkv.getString(OTA_LAST_VERSION_KEY) ?? null;
}

/** Unix ms timestamp of the last successful OTA download. */
export function getLastOTAUpdateTimestamp(): number | null {
  const val = mmkv.getNumber(OTA_LAST_UPDATED_KEY);
  return val ?? null;
}

/** Human-readable "time ago" since the last OTA was downloaded. */
export function getLastOTAUpdateTimeAgo(): string {
  const ts = getLastOTAUpdateTimestamp();
  if (!ts) return "never";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
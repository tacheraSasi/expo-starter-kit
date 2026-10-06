import logger from "@/lib/logger";
import Api from "@/lib/api";
import { useNotificationStore } from "@/stores/notifications";
import { useState, useEffect, useRef, useCallback } from "react";
import { Alert, AppState, Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { router } from "expo-router";
import { authToken } from "@/lib/api/authToken";
import i18n from "@/i18n";
import { resolveNotificationRoute } from "@/lib/notificationRoutes";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: string | null;
}

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null,
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Silent registration: only fetch a token when permission is
    // already granted. First-time permission prompts are deferred to
    // post-login (see completeLogin in context/ctx.tsx) so the iOS
    // dialog never competes with startup/splash.
    registerForPushNotificationsAsync({ promptIfNeeded: false })
      .then((token) => {
        if (token) {
          setExpoPushToken(token);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to register for push notifications");
        logger.error("Push notification registration error:", err);
      });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        logger.log("Notification response:", response);
        const data = response.notification.request.content.data;
        const content = response.notification.request.content;

        const type = String(data?.type || "");
        const typedData: Record<string, any> = {};
        if (data) {
          for (const key of Object.keys(data)) {
            typedData[key] = data[key];
          }
        }

        const routeMatch = resolveNotificationRoute(type, typedData);

        if (routeMatch) {
          if (Object.keys(routeMatch.params).length > 0) {
            router.push({
              pathname: routeMatch.route as any,
              params: routeMatch.params as any,
            });
          } else {
            router.push(routeMatch.route as any);
          }
          return;
        }

        const title = content.title || "";
        const body = content.body || "";
        const priority = String(data?.priority || "normal");
        const notificationUuid = String(data?.notification_uuid || "");

        if (title || body) {
          router.push({
            pathname: "/(core)/(modals)/notification-detail" as any,
            params: {
              uuid: notificationUuid,
              title,
              body,
              type,
              priority,
              category: "",
              created_at: new Date().toISOString(),
              action_url: String(data?.action_url || ""),
              data: data ? JSON.stringify(data) : "null",
            },
          });
        } else {
          router.push("/(core)/(modals)/notifications" as any);
        }
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
    error,
  };
}

export function useNotificationBadgeSync() {
  const bump = useNotificationStore((s) => s.bump);
  const setCount = useNotificationStore((s) => s.setCount);
  const setFetching = useNotificationStore((s) => s.setFetching);

  useEffect(() => {
    const refetch = async () => {
      const token = await authToken("access");
      if (!token) return;

      setFetching(true);
      try {
        const count = await Api.getUnreadNotificationCount();
        setCount(count);
      } catch {
      } finally {
        setFetching(false);
      }
    };

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void refetch();
      }
    });

    void refetch();

    return () => subscription.remove();
  }, [setCount, setFetching]);

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(() => {
      bump(1);
    });
    return () => sub.remove();
  }, [bump]);
}

export async function registerForPushNotificationsAsync(options?: {
  promptIfNeeded?: boolean;
}): Promise<string | null> {
  const promptIfNeeded = options?.promptIfNeeded ?? true;

  if (!Device.isDevice) {
    logger.warn("Push notifications require a physical device");
    return null;
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    if (!promptIfNeeded) {
      logger.warn("Push permission not granted; deferring prompt to post-login");
      return null;
    }

    if (Platform.OS === "ios") {
      const shouldRequest = await new Promise<boolean>((resolve) => {
        Alert.alert(
          i18n.t("common:pushNotifications.enableTitle"),
          i18n.t("common:pushNotifications.enableMessage"),
          [
            {
              text: i18n.t("common:pushNotifications.notNow"),
              style: "cancel",
              onPress: () => resolve(false),
            },
            {
              text: i18n.t("common:pushNotifications.allow"),
              onPress: () => resolve(true),
            },
          ],
        );
      });

      if (!shouldRequest) {
        logger.warn("User declined notification permission rationale");
        return null;
      }
    }

    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    logger.warn("Push notification permissions not granted");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      throw new Error("EAS Project ID not found in app config");
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    logger.log("Expo push token:", tokenData.data);
    return tokenData.data;
  } catch (err) {
    logger.error("Error getting Expo push token:", err);
    return null;
  }
}

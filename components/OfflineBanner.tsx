import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const DEBOUNCE_MS = 1500;

export default function OfflineBanner() {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(false);
  const progress = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // On iOS, isInternetReachable can be null during network transitions.
      // Only treat as offline when isInternetReachable is explicitly false.
      // null means "unknown" — assume connected.
      const offline = !state.isConnected || state.isInternetReachable === false;

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      if (offline) {
        // Debounce going offline to avoid brief flickers
        debounceTimer.current = setTimeout(() => {
          setIsOffline(true);
          progress.value = withTiming(1, { duration: 300 });
        }, DEBOUNCE_MS);
      } else {
        setIsOffline(false);
        progress.value = withTiming(0, { duration: 300 });
      }
    });

    return () => {
      unsubscribe();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [progress]);

  const animStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [0, 36]),
    opacity: progress.value,
  }));

  if (!isOffline) return null;

  return (
    <Animated.View style={[styles.container, { top: insets.top }, animStyle]}>
      <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
      <Text style={styles.text}>{t("common:noInternet")}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: "#E74C3C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    overflow: "hidden",
  },
  text: {
    color: "#fff",
    fontSize: 13,
    fontFamily:
      Platform.OS === "ios" ? "Inter_600SemiBold" : "Inter_600SemiBold",
  },
});

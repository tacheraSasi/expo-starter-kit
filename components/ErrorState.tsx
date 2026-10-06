import { useCurrentTheme } from "@/context/CentralTheme";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import SpringPressable from "@/components/SpringPressable";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  showRetryButton?: boolean;
}

export default function ErrorState({
  title,
  message,
  onRetry,
  retryText,
  iconName = "construct-outline",
  showRetryButton = true,
}: ErrorStateProps) {
  const theme = useCurrentTheme();
  const { t } = useTranslation();

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 350 }}
      style={styles.container}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.errorBg }]}>
        <Ionicons name={iconName} size={36} color={theme.error} />
      </View>

      <Text style={[styles.title, { color: theme.text }]}>
        {title || t("common:errorState.title", "We're working on it")}
      </Text>

      <Text style={[styles.message, { color: theme.textSecondary }]}>
        {message ||
          t(
            "common:errorState.message",
            "Sorry about that. We're on the case and things will be back to normal soon."
          )}
      </Text>

      {showRetryButton && onRetry && (
        <SpringPressable
          style={[
            styles.retryButton,
            { backgroundColor: theme.primary },
            styles.noShadow,
          ]}
          onPress={onRetry}
          haptic
        >
          <Ionicons name="refresh" size={18} color="white" />
          <Text style={styles.retryButtonText}>
            {retryText || t("common:errorState.button", "Try again")}
          </Text>
        </SpringPressable>
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "transparent",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: {
        elevation: 0,
      },
      default: {
        boxShadow: "none",
      },
    }),
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
    opacity: 0.9,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 10,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  noShadow: {
    ...Platform.select({
      ios: {
        shadowColor: "transparent",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: {
        elevation: 0,
      },
      default: {
        boxShadow: "none",
      },
    }),
  },
});
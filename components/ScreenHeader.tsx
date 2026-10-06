import React from "react";
import { StyleSheet, Text, View } from "react-native";
import HapticTouchableOpacity from "@/components/HapticTouchableOpacity";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCurrentTheme } from "@/context/CentralTheme";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({
  title,
  onBack,
  rightAction,
}: ScreenHeaderProps) {
  const router = useRouter();
  const theme = useCurrentTheme();

  return (
    <View style={[styles.header, { backgroundColor: theme.card }]}>
      <HapticTouchableOpacity
        onPress={onBack || (() => router.back())}
        style={[styles.backBtn, { backgroundColor: theme.inputBackground }]}
        hapticType="light"
      >
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </HapticTouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
      {rightAction || <View style={{ width: 54 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  backBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
});

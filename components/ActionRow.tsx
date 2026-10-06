import React from "react";
import { ActivityIndicator, Text } from "react-native";
import HapticTouchableOpacity from "@/components/HapticTouchableOpacity";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "@/context/CentralTheme";

interface ActionRowProps {
  icon: string;
  label: string;
  color?: string;
  onPress: () => void;
  loading?: boolean;
  chevron?: boolean;
}

export function ActionRow({
  icon,
  label,
  color,
  onPress,
  loading,
  chevron,
}: ActionRowProps) {
  const styles = useStyles();
  return (
    <HapticTouchableOpacity
      style={styles.actionItem}
      onPress={onPress}
      hapticType="light"
    >
      <Ionicons
        name={icon as any}
        size={22}
        color={color || styles._textPrimary}
      />
      <Text style={[styles.actionText, color ? { color } : undefined]}>
        {label}
      </Text>
      {loading ? (
        <ActivityIndicator size="small" color={color || styles._primary} />
      ) : chevron ? (
        <Ionicons name="chevron-forward" size={18} color={styles._chevron} />
      ) : null}
    </HapticTouchableOpacity>
  );
}

const useStyles = createStyles((theme) => ({
  _textPrimary: theme.textPrimary as any,
  _primary: theme.primary as any,
  _chevron: theme.chevron as any,
  actionItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: theme.divider,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600" as const,
    color: theme.textPrimary,
  },
}));

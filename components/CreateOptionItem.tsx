import React from "react";
import { Text, View } from "react-native";
import HapticTouchableOpacity from "@/components/HapticTouchableOpacity";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "@/context/CentralTheme";

interface CreateOptionItemProps {
  icon: string;
  color: string;
  title: string;
  desc: string;
  onPress: () => void;
}

export function CreateOptionItem({
  icon,
  color,
  title,
  desc,
  onPress,
}: CreateOptionItemProps) {
  const styles = useStyles();
  return (
    <HapticTouchableOpacity
      style={styles.createItem}
      onPress={onPress}
      hapticType="light"
    >
      <View style={[styles.createIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon as any} size={28} color={color} />
      </View>
      <View style={styles.createInfo}>
        <Text style={styles.createTitle}>{title}</Text>
        <Text style={styles.createDesc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={styles._chevron} />
    </HapticTouchableOpacity>
  );
}

const useStyles = createStyles((theme) => ({
  _chevron: theme.chevron as any,
  createItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.divider,
  },
  createIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  createInfo: { flex: 1 },
  createTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: theme.textPrimary,
    marginBottom: 2,
  },
  createDesc: { fontSize: 13, color: theme.textMuted },
}));

import { useCurrentTheme } from "@/context/CentralTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Platform, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolate,
} from "react-native-reanimated";
import { HapticFeedback } from "@/lib/haptics";
import SpringPressable from "@/components/SpringPressable";

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  bottom?: number;
  right?: number;
  /** Animate FAB entrance with a spring */
  animated?: boolean;
  /** Delay before entrance animation (ms) */
  enterDelay?: number;
}

export default function FloatingActionButton({
  onPress,
  icon = "add",
  size = 28,
  color,
  bottom = 20,
  right = 20,
  animated = true,
  enterDelay = 300,
}: FloatingActionButtonProps) {
  const theme = useCurrentTheme();
  const fabColor = color || theme.primary;
  const scale = useSharedValue(animated ? 0 : 1);

  useEffect(() => {
    if (animated) {
      scale.value = withDelay(
        enterDelay,
        withSpring(1, { damping: 12, stiffness: 120 }),
      );
    }
  }, [animated, enterDelay, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(scale.value, [0, 1], [0, 1]),
  }));

  const handlePress = () => {
    HapticFeedback("medium");
    onPress();
  };

  return (
    <Animated.View style={[styles.fab, { bottom, right }, animStyle]}>
      <SpringPressable onPress={handlePress} haptic scaleDown={0.92}>
        <Animated.View style={[styles.fabInner, { backgroundColor: fabColor }]}>
          <Ionicons name={icon} size={size} color="white" />
        </Animated.View>
      </SpringPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
});

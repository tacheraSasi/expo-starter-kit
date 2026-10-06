import React, { useCallback } from "react";
import { Pressable, PressableProps, ViewStyle, StyleProp } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { HapticFeedback } from "@/lib/haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

interface SpringPressableProps extends Omit<PressableProps, "style"> {
  style?: StyleProp<ViewStyle>;
  scaleDown?: number;
  haptic?: boolean;
}

export default function SpringPressable({
  children,
  style,
  onPress,
  scaleDown = 0.97,
  haptic = true,
  disabled,
  ...rest
}: SpringPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(scaleDown, SPRING_CONFIG);
  }, [scale, scaleDown]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
  }, [scale]);

  const handlePress = useCallback(
    (e: any) => {
      if (haptic) {
        HapticFeedback("light");
      }
      onPress?.(e);
    },
    [haptic, onPress],
  );

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}

import React, { useCallback } from "react";
import { TouchableOpacity, type TouchableOpacityProps } from "react-native";
import { HapticFeedback, type HapticFeedbackType } from "@/lib/haptics";

interface HapticTouchableOpacityProps extends TouchableOpacityProps {
  hapticType?: HapticFeedbackType;
}

/**
 * A TouchableOpacity that triggers haptic feedback on press.
 * Respects the user's haptics-enabled setting automatically.
 */
export default function HapticTouchableOpacity({
  onPress,
  hapticType = "light",
  ...props
}: HapticTouchableOpacityProps) {
  const handlePress = useCallback(
    (e: any) => {
      HapticFeedback(hapticType);
      onPress?.(e);
    },
    [onPress, hapticType],
  );

  return <TouchableOpacity onPress={handlePress} {...props} />;
}

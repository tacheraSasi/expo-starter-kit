import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import HapticTouchableOpacity from "@/components/HapticTouchableOpacity";
import type { TouchableOpacityProps } from "react-native";
import { createStyles } from "@/context/CentralTheme";

interface BackButtonProps extends TouchableOpacityProps {
  icon?: "arrow-back" | "close";
  size?: number;
  onPress?: () => void;
}

export default function BackButton({
  icon = "arrow-back",
  size = 24,
  onPress,
  style,
  ...props
}: BackButtonProps) {
  const styles = useStyles();
  return (
    <HapticTouchableOpacity
      style={[styles.button, style]}
      onPress={onPress ?? (() => router.back())}
      activeOpacity={0.7}
      hapticType="light"
      {...props}
    >
      <Ionicons name={icon} size={size} color={styles._textPrimary} />
    </HapticTouchableOpacity>
  );
}

const useStyles = createStyles((theme) => ({
  button: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.inputBackground,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  _textPrimary: theme.textPrimary,
}));

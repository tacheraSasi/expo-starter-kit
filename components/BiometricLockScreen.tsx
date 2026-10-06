import HapticTouchableOpacity from "@/components/HapticTouchableOpacity";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { createStyles } from "@/context/CentralTheme";
import { useTranslation } from "react-i18next";
import { brandGradient } from "@/constants/Colors";
import { isBiometricAvailable } from "@/hooks/useBiometricLock";

interface BiometricLockScreenProps {
  onAuthenticate: () => void;
  isAuthenticating: boolean;
}

export default function BiometricLockScreen({
  onAuthenticate,
  isAuthenticating,
}: BiometricLockScreenProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  const [biometricType, setBiometricType] = useState("Face ID");

  useEffect(() => {
    isBiometricAvailable().then((result) => {
      if (result.available) {
        setBiometricType(result.biometricType);
      }
    });
  }, []);

  const iconName =
    biometricType === "Face ID"
      ? "scan"
      : biometricType === "Fingerprint"
        ? "finger-print"
        : "lock-closed";

  return (
    <LinearGradient colors={brandGradient} style={styles.container}>
      <View style={styles.decoCircle1} />
      <View style={styles.decoCircle2} />

      <Animated.View
        entering={FadeInDown.delay(100).duration(700).springify()}
        style={styles.content}
      >
        <View style={styles.iconRing}>
          <Ionicons name={iconName} size={44} color="#fff" />
        </View>

        <Text style={styles.title}>{t("common:biometricLock.title")}</Text>
        <Text style={styles.subtitle}>
          {t("common:biometricLock.unlockWith", { type: biometricType })}
        </Text>

        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.buttonWrapper}
        >
          <HapticTouchableOpacity
            style={[
              styles.unlockButton,
              isAuthenticating && styles.unlockButtonDisabled,
            ]}
            onPress={onAuthenticate}
            disabled={isAuthenticating}
            activeOpacity={0.8}
            hapticType="medium"
          >
            <Text style={styles.unlockText}>
              {isAuthenticating
                ? t("common:biometricLock.verifying")
                : t("common:biometricLock.unlock")}
            </Text>
          </HapticTouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(500).duration(400)}>
          <HapticTouchableOpacity
            onPress={onAuthenticate}
            disabled={isAuthenticating}
            style={styles.passcodeLink}
            hapticType="light"
          >
            <Text style={styles.passcodeText}>
              {t("common:biometricLock.usePasscode")}
            </Text>
          </HapticTouchableOpacity>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

const useStyles = createStyles(() => ({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  decoCircle1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -60,
    right: -80,
  },
  decoCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: 60,
    left: -60,
  },
  content: {
    alignItems: "center",
    width: "100%",
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 22,
  },
  buttonWrapper: {
    width: "100%",
    alignItems: "center",
  },
  unlockButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 28,
    width: "100%",
    maxWidth: 280,
    alignItems: "center",
  },
  unlockButtonDisabled: {
    opacity: 0.7,
  },
  unlockText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#00A670",
  },
  passcodeLink: {
    marginTop: 20,
    paddingVertical: 8,
  },
  passcodeText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.6)",
    textDecorationLine: "underline",
  },
}));

import ScreenLayout from "@/components/ScreenLayout";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/ctx";
import { useHaptics } from "@/hooks/useHaptics";
import Colors, { ColorScheme } from "@/constants/Colors";
import { useCurrentTheme } from "@/context/CentralTheme";

const { width, height } = Dimensions.get("window");

export default function Step2() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const { trigger: haptics } = useHaptics();
  const theme = useCurrentTheme();
  const colors = Colors[theme.colorScheme];
  const styles = getStyles(theme.colorScheme);

  const handleGetStarted = () => {
    completeOnboarding();
    haptics("light");
    router.replace("/(auth)/register");
  };

  const handleGoToLogin = () => {
    completeOnboarding();
    router.replace("/(auth)/login");
  };

  return (
    <ScreenLayout>
      {/* Geometric Background */}
      <View style={styles.backgroundGeometry}>
        <View style={styles.geometricShape1} />
        <View style={styles.geometricShape2} />
        <View style={styles.geometricTriangle} />
      </View>

      <View style={styles.content}>
        {/* Header with Audio Waveforms */}
        <View style={styles.headerSection}>
          <View style={styles.waveformContainer}>
            <View style={styles.waveformBars}>
              {[...Array(8)].map((_, i) => (
                <View
                  key={i}
                  style={[styles.waveBar, { height: 20 + (i % 4) * 15 }]}
                />
              ))}
            </View>
          </View>

          <Text style={styles.headerTitle}>
            Built for <Text style={styles.titleBold}>convenience</Text>
            {"\n"}
            not complications
          </Text>
        </View>

        {/* Feature Grid */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>What you'll experience</Text>

          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <View style={styles.iconWave} />
              </View>
              <Text style={styles.featureLabel}>Quick Setup</Text>
              <Text style={styles.featureDesc}>Get started in seconds</Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <View style={styles.iconCircle} />
                <View style={styles.iconCircleSmall} />
              </View>
              <Text style={styles.featureLabel}>Secure & Reliable</Text>
              <Text style={styles.featureDesc}>Built with best practices</Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <View style={styles.iconSpark} />
                <View style={styles.iconSparkSmall} />
              </View>
              <Text style={styles.featureLabel}>Beautiful UI</Text>
              <Text style={styles.featureDesc}>
                Pre-built themed components
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <View style={styles.iconHeart} />
              </View>
              <Text style={styles.featureLabel}>Customizable</Text>
              <Text style={styles.featureDesc}>Make it yours easily</Text>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.buttonBackground]}
              style={styles.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.primaryButtonText}>Create Account</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoToLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>
              Already have an account?{" "}
              <Text style={styles.loginLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenLayout>
  );
}

const getStyles = (colorScheme: ColorScheme) => {
  const colors = Colors[colorScheme];
  const isDark = colorScheme === "dark";

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    backgroundGeometry: {
      position: "absolute",
      width: "100%",
      height: "100%",
    },
    geometricShape1: {
      position: "absolute",
      width: 120,
      height: 120,
      backgroundColor: isDark ? "#2a2a2a" : "#e4e4e4",
      transform: [{ rotate: "45deg" }],
      top: 80,
      left: -60,
    },
    geometricShape2: {
      position: "absolute",
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? "#2a2a2a" : "#e4e4e4",
      bottom: 200,
      right: -40,
    },
    geometricTriangle: {
      position: "absolute",
      width: 0,
      height: 0,
      borderLeftWidth: 30,
      borderRightWidth: 30,
      borderBottomWidth: 50,
      borderStyle: "solid",
      borderLeftColor: "transparent",
      borderRightColor: "transparent",
      borderBottomColor: isDark ? "#1a1a1a" : "#f8f8f8",
      top: "45%",
      right: 60,
    },
    content: {
      flex: 1,
      paddingHorizontal: 32,
      justifyContent: "space-between",
    },
    headerSection: {
      alignItems: "center",
    },
    waveformContainer: {
      marginBottom: 12,
      alignItems: "center",
    },
    waveformBars: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 4,
      paddingVertical: 20,
    },
    waveBar: {
      width: 3,
      backgroundColor: colors.text,
      borderRadius: 1.5,
    },
    headerTitle: {
      fontSize: 38,
      fontWeight: "300",
      fontFamily: "Inter_400Regular",
      textAlign: "center",
      color: colors.text,
      lineHeight: 46,
      letterSpacing: -0.5,
    },
    titleBold: {
      fontWeight: "700",
      fontFamily: "Inter_700Bold",
    },
    featuresSection: {
      paddingVertical: 20,
    },
    featuresTitle: {
      fontSize: 18,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
      color: isDark ? "#cccccc" : "#333333",
      textAlign: "center",
      marginBottom: 32,
      letterSpacing: 0.5,
    },
    featuresGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 16,
    },
    featureCard: {
      width: (width - 80) / 2,
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: isDark ? "#333333" : "#f0f0f0",
    },
    featureIcon: {
      width: 40,
      height: 40,
      marginBottom: 16,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    iconWave: {
      width: 24,
      height: 3,
      backgroundColor: isDark ? "#ffffff" : "#000000",
      borderRadius: 1.5,
    },
    iconCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: isDark ? "#ffffff" : "#000000",
    },
    iconCircleSmall: {
      position: "absolute",
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.secondary,
      top: 2,
      right: 2,
    },
    iconSpark: {
      width: 16,
      height: 16,
      backgroundColor: isDark ? "#ffffff" : "#000000",
      transform: [{ rotate: "45deg" }],
    },
    iconSparkSmall: {
      position: "absolute",
      width: 8,
      height: 8,
      backgroundColor: colors.secondary,
      borderRadius: 4,
      top: -2,
      right: -2,
    },
    iconHeart: {
      width: 18,
      height: 16,
      backgroundColor: isDark ? "#ffffff" : "#000000",
      borderTopLeftRadius: 9,
      borderTopRightRadius: 9,
      transform: [{ rotate: "45deg" }],
    },
    featureLabel: {
      fontSize: 14,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
      color: colors.text,
      marginBottom: 4,
      textAlign: "center",
    },
    featureDesc: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.secondary,
      textAlign: "center",
      fontWeight: "400",
    },
    ctaSection: {
      alignItems: "center",
      paddingBottom: 50,
    },
    primaryButton: {
      width: "90%",
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    primaryGradient: {
      paddingVertical: 18,
      paddingHorizontal: 32,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
      color: colors.buttonText,
      letterSpacing: 0.8,
      marginRight: 12,
    },
    buttonSparkle: {
      backgroundColor: "rgba(255,255,255,0.2)",
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
    },
    sparkleText: {
      fontSize: 14,
    },
    secondaryButton: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 32,
    },
    secondaryButtonText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.secondary,
      textAlign: "center",
      fontWeight: "400",
    },
    loginLink: {
      color: colors.text,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
      textDecorationLine: "underline",
    },
    pagination: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    paginationActive: {
      width: 32,
      backgroundColor: isDark ? "#ffffff" : "#000000",
    },
  });
};

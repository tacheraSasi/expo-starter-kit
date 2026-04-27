import ScreenLayout from "@/components/ScreenLayout";
import Colors, { ColorScheme } from "@/constants/Colors";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useHaptics } from "@/hooks/useHaptics";
import { Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function Step1() {
  const router = useRouter();
  const { trigger: haptics } = useHaptics();
  const theme = useCurrentTheme();
  const colors = Colors[theme.colorScheme];
  const styles = getStyles(theme.colorScheme);

  return (
    <ScreenLayout>
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <View style={styles.patternCircle1} />
        <View style={styles.patternCircle2} />
        <View style={styles.patternCircle3} />
      </View>

      <View style={styles.content}>
        {/* Header with Logo */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={["#00000003", "#53535306"]}
              style={styles.logoCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Image
              style={{ position: "absolute", width: 64, height: 64 }}
              source={require("@/assets/images/android/play_store_512.png")}
              // source={require("@/assets/images/icon-black-and-white.png")}
            />
            <Text style={styles.logoText}>starter</Text>
          </View>

          <View style={styles.decorativeLines}>
            <View style={styles.line} />
            <View style={[styles.line, styles.lineShort]} />
            <View style={[styles.line, styles.lineLong]} />
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={styles.title}>
            Your Journey{"\n"}
            <Text style={styles.titleAccent}>Starts Here</Text>
            {"\n"}
          </Text>

          <Text style={styles.subtitle}>
            A powerful starter template with authentication, navigation,
            theming, and more. Build your next mobile app faster.
          </Text>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => {
              haptics("light");
              router.push("./step2");
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.buttonBackground]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <View style={styles.buttonArrow}>
                <Text style={styles.arrowText}>
                  <Entypo name="chevron-right" size={24} />
                </Text>
              </View>
            </LinearGradient>
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
    backgroundPattern: {
      position: "absolute",
      width: "100%",
      height: "100%",
    },
    patternCircle1: {
      position: "absolute",
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: isDark ? "#2a2a2a" : "#e4e4e4",
      top: -100,
      right: -50,
    },
    patternCircle2: {
      position: "absolute",
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: isDark ? "#2a2a2a" : "#e4e4e4",
      bottom: 100,
      left: -75,
    },
    patternCircle3: {
      position: "absolute",
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? "#222222" : "#e8eaed",
      top: "60%",
      right: 30,
    },
    content: {
      flex: 1,
      paddingHorizontal: 32,
      justifyContent: "space-between",
    },
    headerSection: {
      alignItems: "center",
      marginTop: 20,
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 20,
    },
    logoCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    logoText: {
      fontSize: 28,
      fontWeight: "200",
      fontFamily: "Inter_400Regular",
      letterSpacing: 6,
      color: colors.text,
      textTransform: "uppercase",
    },
    decorativeLines: {
      alignItems: "center",
      gap: 8,
    },
    line: {
      height: 1,
      backgroundColor: colors.border,
      width: 60,
    },
    lineShort: {
      width: 40,
    },
    lineLong: {
      width: 80,
    },
    mainContent: {
      alignItems: "center",
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 42,
      fontWeight: "300",
      fontFamily: "Inter_400Regular",
      textAlign: "center",
      lineHeight: 50,
      color: colors.text,
      marginBottom: 24,
      letterSpacing: -0.5,
    },
    titleAccent: {
      fontWeight: "700",
      fontFamily: "Inter_700Bold",
      color: isDark ? "#ffffff" : "#000000",
    },
    subtitle: {
      fontSize: 16,
      textAlign: "center",
      lineHeight: 26,
      color: colors.secondary,
      marginBottom: 48,
      fontWeight: "400",
      fontFamily: "Inter_400Regular",
      maxWidth: 320,
    },
    featureHighlights: {
      alignItems: "flex-start",
      gap: 16,
    },
    highlight: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    highlightDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: isDark ? "#ffffff" : "#000000",
      marginRight: 16,
    },
    highlightText: {
      fontSize: 14,
      color: isDark ? "#cccccc" : "#333333",
      fontWeight: "500",
      fontFamily: "Inter_500Medium",
      letterSpacing: 0.5,
    },
    bottomSection: {
      alignItems: "center",
      paddingBottom: 50,
    },
    continueButton: {
      width: "85%",
      marginBottom: 32,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    buttonGradient: {
      paddingVertical: 18,
      paddingHorizontal: 32,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
      color: colors.buttonText,
      letterSpacing: 1,
      marginRight: 12,
    },
    buttonArrow: {
      backgroundColor: "rgba(255, 255, 255, 0.32)",
      width: 38,
      height: 38,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    arrowText: {
      fontSize: 24,
      color: colors.buttonText,
      fontWeight: "600",
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

import ScreenLayout from "@/components/ScreenLayout";
import HapticTouchableOpacity from "@/components/HapticTouchableOpacity";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { createStyles } from "@/context/CentralTheme";
import { useTranslation } from "react-i18next";

interface NoAccessScreenProps {
  onSignOut: () => void;
  userEmail?: string;
}

export default function NoAccessScreen({
  onSignOut,
  userEmail,
}: NoAccessScreenProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <ScreenLayout>
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <View style={styles.patternCircle1} />
        <View style={styles.patternCircle2} />
        <View style={styles.patternCircle3} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={["#00000003", "#53535306"]}
                style={styles.logoCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Image
                style={styles.iconImage}
                source={require("@/assets/images/android/play_store_512.png")}
              />
              <Text style={styles.logoText}>Starter</Text>
            </View>

            <Text style={styles.title}>{t("common:noAccess.title")}</Text>
            <Text style={styles.subtitle}>{t("common:noAccess.subtitle")}</Text>
          </View>

          {/* Info Card */}
          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Ionicons
                name="shield-outline"
                size={24}
                color={styles._primary}
              />
            </View>
            <Text style={styles.cardText}>
              {userEmail
                ? t("common:noAccess.message", { email: userEmail })
                : t("common:noAccess.messageNoEmail")}
            </Text>
          </View>

          {/* Required Modules */}
          <View style={styles.modulesSection}>
            <Text style={styles.modulesLabel}>
              {t("common:noAccess.modulesLabel")}
            </Text>

            <View style={styles.moduleRow}>
              <View style={styles.moduleIcon}>
                <Ionicons
                  name="cart-outline"
                  size={20}
                  color={styles._primary}
                />
              </View>
              <View>
                <Text style={styles.moduleName}>
                  {t("common:noAccess.posName")}
                </Text>
                <Text style={styles.moduleDesc}>
                  {t("common:noAccess.posDesc")}
                </Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.moduleRow}>
              <View style={styles.moduleIcon}>
                <Ionicons
                  name="receipt-outline"
                  size={20}
                  color={styles._primary}
                />
              </View>
              <View>
                <Text style={styles.moduleName}>
                  {t("common:noAccess.salesName")}
                </Text>
                <Text style={styles.moduleDesc}>
                  {t("common:noAccess.salesDesc")}
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <HapticTouchableOpacity
              style={styles.primaryButton}
              onPress={onSignOut}
              activeOpacity={0.8}
              hapticType="medium"
            >
              <LinearGradient
                colors={[styles._primary, styles._primary]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="log-out-outline" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>
                  {t("common:noAccess.signOut")}
                </Text>
                <View style={styles.buttonArrow}>
                  <Entypo name="chevron-right" size={20} color="white" />
                </View>
              </LinearGradient>
            </HapticTouchableOpacity>

            <Text style={styles.hint}>{t("common:noAccess.hint")}</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const useStyles = createStyles((theme) => ({
  _primary: theme.primary as any,
  backgroundPattern: {
    position: "absolute" as const,
    width: "100%",
    height: "100%",
  },
  patternCircle1: {
    position: "absolute" as const,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.surface,
    top: -100,
    right: -50,
  },
  patternCircle2: {
    position: "absolute" as const,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.surface,
    bottom: 100,
    left: -75,
  },
  patternCircle3: {
    position: "absolute" as const,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.elevatedSurface,
    top: "40%",
    right: 30,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center" as const,
  },
  header: {
    alignItems: "center" as const,
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: "center" as const,
    marginBottom: 24,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 20,
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.shadowOpacity,
    shadowRadius: 8,
    elevation: 4,
  },
  iconImage: {
    position: "absolute" as const,
    width: 64,
    borderRadius: 32,
    height: 64,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "200" as const,
    letterSpacing: 6,
    color: theme.textPrimary,
    textTransform: "uppercase" as const,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: theme.textPrimary,
    marginBottom: 8,
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: "center" as const,
    fontWeight: "400" as const,
  },
  bold: {
    fontWeight: "700" as const,
    color: theme.textPrimary,
  },
  card: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 12,
    backgroundColor: theme.inputBackground,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  cardIcon: {
    marginTop: 2,
  },
  cardText: {
    flex: 1,
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  modulesSection: {
    backgroundColor: theme.inputBackground,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  modulesLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: theme.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: 16,
  },
  moduleRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14,
  },
  moduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primarySoft,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  moduleName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: theme.textPrimary,
  },
  moduleDesc: {
    fontSize: 13,
    color: theme.textMuted,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 14,
  },
  actions: {
    gap: 16,
  },
  primaryButton: {
    width: "100%",
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: theme.textInverse,
    letterSpacing: 1,
    flex: 1,
    textAlign: "center" as const,
  },
  buttonArrow: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  hint: {
    fontSize: 13,
    color: theme.textMuted,
    textAlign: "center" as const,
    lineHeight: 18,
  },
}));

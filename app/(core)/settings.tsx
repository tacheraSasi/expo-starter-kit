import { ScreenHeader } from "@/components/ScreenHeader";
import ScreenLayout from "@/components/ScreenLayout";
import { createStyles, useCurrentTheme } from "@/context/CentralTheme";
import { useAuth, useAuthActions } from "@/context/ctx";
import { APP_VERSION } from "@/constants/version";
import { HapticFeedback } from "@/lib/haptics";
import { appAlert } from "@/lib/ui/appAlert";
import { isBiometricAvailable } from "@/hooks/useBiometricLock";
import { useLanguageStore, type Language } from "@/stores/language";
import { useSettingsStore } from "@/stores/settings";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { toast } from "yooo-native";
import { useTranslation } from "react-i18next";

function Row({
  title,
  subtitle,
  icon,
  onPress,
  right,
}: {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  const theme = useCurrentTheme();
  const styles = useStyles();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed && onPress ? theme.highlight : "transparent" },
      ]}
      onPress={() => {
        if (!onPress) return;
        void HapticFeedback("selection");
        onPress();
      }}
      disabled={!onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.primaryMuted }]}>
        <Ionicons name={icon} size={20} color={theme.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: theme.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useCurrentTheme();
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

const THEME_OPTIONS = [
  { value: "light", icon: "sunny-outline", labelKey: "settings:appearance.themeLight" },
  { value: "dark", icon: "moon-outline", labelKey: "settings:appearance.themeDark" },
  { value: "system", icon: "phone-portrait-outline", labelKey: "settings:appearance.themeSystem" },
] as const;

export default function Settings() {
  const { t } = useTranslation();
  const theme = useCurrentTheme();
  const styles = useStyles();
  const { signOut } = useAuthActions();
  const { user } = useAuth();
  const settings = useSettingsStore();
  const { language, setLanguage } = useLanguageStore();
  const [biometricType, setBiometricType] = useState("Passcode");
  const [biometricSupported, setBiometricSupported] = useState(false);

  useEffect(() => {
    void isBiometricAvailable().then((r) => {
      setBiometricSupported(r.available);
      setBiometricType(r.biometricType);
    });
  }, []);

  const cycleLanguage = async (next: Language) => {
    try {
      await setLanguage(next);
      toast.success(t("settings:language.changed"));
    } catch {
      toast.error(t("common:status.error"));
    }
  };

  const handleSignOut = () => {
    appAlert.dialog(t("auth:signOut.title"), t("auth:signOut.message"), [
      { text: t("auth:signOut.cancel"), style: "cancel" },
      {
        text: t("auth:signOut.confirm"),
        style: "destructive",
        onPress: () => void signOut(),
      },
    ]);
  };

  return (
    <ScreenLayout>
      <ScreenHeader title={t("settings:title")} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Section title={t("settings:sections.appearance")}>
          {THEME_OPTIONS.map((opt) => {
            const active = settings.themeMode === opt.value;
            return (
              <Row
                key={opt.value}
                title={t(opt.labelKey)}
                icon={opt.icon as any}
                onPress={() => {
                  settings.updateSetting("themeMode", opt.value);
                  void HapticFeedback("light");
                }}
                right={
                  <Ionicons
                    name={active ? "checkmark-circle" : "ellipse-outline"}
                    size={22}
                    color={active ? theme.primary : theme.chevron}
                  />
                }
              />
            );
          })}
          <Row
            title={t("settings:appearance.haptics")}
            icon="pulse-outline"
            onPress={() =>
              settings.updateSetting("hapticsEnabled", !settings.hapticsEnabled)
            }
            right={
              <Switch
                value={settings.hapticsEnabled}
                onValueChange={(v) => {
                  settings.updateSetting("hapticsEnabled", v);
                  if (v) void HapticFeedback("success");
                }}
              />
            }
          />
          <Row
            title={t("settings:appearance.soundEffects")}
            icon="volume-medium-outline"
            onPress={() =>
              settings.updateSetting(
                "soundEffectsEnabled",
                !settings.soundEffectsEnabled,
              )
            }
            right={
              <Switch
                value={settings.soundEffectsEnabled}
                onValueChange={(v) =>
                  settings.updateSetting("soundEffectsEnabled", v)
                }
              />
            }
          />
        </Section>

        <Section title={t("settings:sections.security")}>
          <Row
            title={t("settings:security.appLock")}
            subtitle={
              biometricSupported
                ? t("settings:security.appLockDesc", { biometricType })
                : undefined
            }
            icon="finger-print-outline"
            onPress={
              biometricSupported
                ? () =>
                    settings.updateSetting(
                      "biometricLockEnabled",
                      !settings.biometricLockEnabled,
                    )
                : undefined
            }
            right={
              <Switch
                value={settings.biometricLockEnabled}
                disabled={!biometricSupported}
                onValueChange={(v) =>
                  settings.updateSetting("biometricLockEnabled", v)
                }
              />
            }
          />
        </Section>

        <Section title={t("settings:sections.language")}>
          <Row
            title={t("settings:language.english")}
            icon="language-outline"
            onPress={() => void cycleLanguage("en")}
            right={
              <Ionicons
                name={language === "en" ? "checkmark-circle" : "ellipse-outline"}
                size={22}
                color={language === "en" ? theme.primary : theme.chevron}
              />
            }
          />
          <Row
            title={t("settings:language.second")}
            subtitle="Kiswahili"
            icon="language-outline"
            onPress={() => void cycleLanguage("sw")}
            right={
              <Ionicons
                name={language === "sw" ? "checkmark-circle" : "ellipse-outline"}
                size={22}
                color={language === "sw" ? theme.primary : theme.chevron}
              />
            }
          />
        </Section>

        <Section title={t("settings:sections.about")}>
          <Row
            title={t("settings:about.version")}
            subtitle={APP_VERSION}
            icon="information-circle-outline"
          />
          {user ? (
            <Row
              title={user.email}
              subtitle={(user as any).name ?? (user as any).fullName}
              icon="person-outline"
            />
          ) : null}
          <Row
            title={t("settings:about.support")}
            icon="help-circle-outline"
            onPress={() => router.push("/(core)/help" as any)}
            right={
              <Ionicons name="chevron-forward" size={18} color={theme.chevron} />
            }
          />
        </Section>

        <Section title={t("settings:sections.dangerZone")}>
          <Row
            title={t("settings:actions.reset")}
            icon="refresh-outline"
            onPress={() =>
              appAlert.dialog(
                t("settings:actions.reset"),
                t("settings:actions.resetConfirm"),
                [
                  { text: t("settings:actions.cancel"), style: "cancel" },
                  {
                    text: t("settings:actions.reset"),
                    style: "destructive",
                    onPress: () => settings.resetToDefaults(),
                  },
                ],
              )
            }
          />
          <Row
            title={t("auth:signOut.confirm")}
            icon="log-out-outline"
            onPress={handleSignOut}
          />
        </Section>
      </ScrollView>
    </ScreenLayout>
  );
}

const useStyles = createStyles(() => ({
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
    marginTop: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16 },
  rowSubtitle: { fontSize: 13, marginTop: 2 },
}));

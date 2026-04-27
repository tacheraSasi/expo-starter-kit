import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useSettingsStore } from "@/stores/settings";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { toast } from "yooo-native";

const { width } = Dimensions.get("window");

interface SettingItemProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialIcons.glyphMap;
  iconType?: "ionicon" | "material";
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  disabled?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  subtitle,
  icon,
  iconType = "ionicon",
  onPress,
  rightElement,
  showChevron = false,
  disabled = false,
}) => {
  const theme = useCurrentTheme();
  const hapticsEnabled = useSettingsStore((state) => state.hapticsEnabled);

  const handlePress = () => {
    if (disabled || !onPress) return;

    if (hapticsEnabled) {
      // Use selection haptic for toggles and switches, light impact for navigation
      if (rightElement) {
        Haptics.selectionAsync();
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
    onPress();
  };

  const IconComponent = iconType === "material" ? MaterialIcons : Ionicons;

  // Icon colors based on category
  const getIconColor = () => {
    if (icon === "car" || icon === "map") return "#6C5CE7";
    if (icon === "phone-portrait" || icon === "volume-medium") return "#45B7D1";
    if (icon === "notifications" || icon === "time") return "#FFB84D";
    if (icon === "analytics" || icon === "location") return "#96CEB4";
    if (icon === "shield-checkmark" || icon === "people") return "#FF6B6B";
    if (icon === "pause" || icon === "wallet") return "#E17055";
    return theme.primary;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        {
          backgroundColor: pressed ? theme.highlight : "transparent",
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      onPress={handlePress}
      disabled={disabled || !onPress}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${getIconColor()}15` },
          ]}
        >
          <IconComponent name={icon as any} size={22} color={getIconColor()} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.subtleText }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightElement}
        {showChevron && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.mutedText}
            style={styles.chevron}
          />
        )}
      </View>
    </Pressable>
  );
};

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => {
  const theme = useCurrentTheme();

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {title}
        </Text>
      </View>
      {subtitle && (
        <Text style={[styles.sectionSubtitle, { color: theme.subtleText }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

export default function Settings() {
  const theme = useCurrentTheme();
  const {
    hapticsEnabled,
    soundEffectsEnabled,
    pushNotificationsEnabled,
    shareAnalytics,
    allowLocationAccess,
    dataSaverMode,
    preloadContent,
    reduceMotion,
    updateSetting,
    resetToDefaults,
    exportSettings,
  } = useSettingsStore();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleHapticsToggle = (value: boolean) => {
    updateSetting("hapticsEnabled", value);
    if (value) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "This will reset all settings to their default values. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetToDefaults();
            if (hapticsEnabled) {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
              );
            }
            toast.success("Settings reset to defaults");
          },
        },
      ],
    );
  };

  const handleExportSettings = async () => {
    try {
      const settingsString = await exportSettings();
      await Share.share({
        message: settingsString,
        title: "Listen App Settings Export",
      });
    } catch (error) {
      toast.error("Failed to export settings");
    }
  };

  return (
    <ScreenLayout>
      <ScrollView
        style={[styles.container]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <View style={styles.headerTitleContainer}>
              <View style={styles.headerIconWrapper}>
                <Ionicons name="settings" size={28} color="#6C5CE7" />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                  Settings
                </Text>
                <Text
                  style={[styles.headerSubtitle, { color: theme.subtleText }]}
                >
                  Customize your experience
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Theme Section (Disabled) */}
        {/* <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <SectionHeader
            title="Appearance"
            subtitle="Theme options coming soon"
          />

          <SettingItem
            title="Theme Mode"
            subtitle={`Current: ${themeMode} (Fixed for now)`}
            icon="color-palette"
            disabled={!themeEnabled}
            rightElement={
              <Text style={[styles.disabledText, { color: theme.mutedText }]}>
                Coming Soon
              </Text>
            }
          />
        </View> */}

        {/* Interaction Settings */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <SectionHeader
            title="Interaction"
            subtitle="Control how you interact with the app"
          />

          <SettingItem
            title="Haptic Feedback"
            subtitle="Vibrations for touch interactions"
            icon="phone-portrait"
            rightElement={
              <Switch
                value={hapticsEnabled}
                onValueChange={handleHapticsToggle}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={hapticsEnabled ? "white" : theme.mutedText}
              />
            }
          />

          <SettingItem
            title="Sound Effects"
            subtitle="UI sounds and audio cues"
            icon="volume-medium"
            rightElement={
              <Switch
                value={soundEffectsEnabled}
                onValueChange={(value) =>
                  updateSetting("soundEffectsEnabled", value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={soundEffectsEnabled ? "white" : theme.mutedText}
              />
            }
          />
        </View>

        {/* Notifications */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <SectionHeader
            title="Notifications"
            subtitle="Manage how and when you're notified"
          />

          <SettingItem
            title="Push Notifications"
            subtitle="Enable push notifications"
            icon="notifications"
            rightElement={
              <Switch
                value={pushNotificationsEnabled}
                onValueChange={(value) =>
                  updateSetting("pushNotificationsEnabled", value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={
                  pushNotificationsEnabled ? "white" : theme.mutedText
                }
              />
            }
          />
        </View>

        {/* Privacy & Data */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <SectionHeader
            title="Privacy & Data"
            subtitle="Control your privacy and data usage"
          />

          <SettingItem
            title="Share Analytics"
            subtitle="Help improve the app with anonymous usage data"
            icon="analytics"
            rightElement={
              <Switch
                value={shareAnalytics}
                onValueChange={(value) =>
                  updateSetting("shareAnalytics", value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={shareAnalytics ? "white" : theme.mutedText}
              />
            }
          />

          <SettingItem
            title="Location Access"
            subtitle="Allow location-based features"
            icon="location"
            rightElement={
              <Switch
                value={allowLocationAccess}
                onValueChange={(value) =>
                  updateSetting("allowLocationAccess", value)
                }
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={allowLocationAccess ? "white" : theme.mutedText}
              />
            }
          />

          <SettingItem
            title="Data Saver Mode"
            subtitle="Reduce data usage"
            icon="cellular"
            rightElement={
              <Switch
                value={dataSaverMode}
                onValueChange={(value) => updateSetting("dataSaverMode", value)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={dataSaverMode ? "white" : theme.mutedText}
              />
            }
          />
        </View>

        {/* Accessibility */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <SectionHeader
            title="Accessibility"
            subtitle="Make the app work better for you"
          />

          <SettingItem
            title="Reduce Motion"
            subtitle="Minimize animations and transitions"
            icon="pause"
            rightElement={
              <Switch
                value={reduceMotion}
                onValueChange={(value) => updateSetting("reduceMotion", value)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={reduceMotion ? "white" : theme.mutedText}
              />
            }
          />
        </View>

        {/* Advanced Settings */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <Pressable
            style={styles.advancedToggle}
            onPress={() => setShowAdvanced(!showAdvanced)}
          >
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Advanced Settings
            </Text>
            <Ionicons
              name={showAdvanced ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.text}
            />
          </Pressable>

          {showAdvanced && (
            <>
              <SettingItem
                title="Preload Content"
                subtitle="Load content in advance for faster access"
                icon="download"
                rightElement={
                  <Switch
                    value={preloadContent}
                    onValueChange={(value) =>
                      updateSetting("preloadContent", value)
                    }
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor={preloadContent ? "white" : theme.mutedText}
                  />
                }
              />

              <SettingItem
                title="Export Settings"
                subtitle="Save your settings configuration"
                icon="share"
                onPress={handleExportSettings}
                showChevron
              />

              <SettingItem
                title="Reset to Defaults"
                subtitle="Reset all settings to original values"
                icon="refresh"
                onPress={handleResetSettings}
                showChevron
              />
            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.mutedText }]}>
            expo Starter Kit
          </Text>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#6C5CE715",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: 'Inter_700Bold',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: 'Inter_400Regular',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: 'Inter_600SemiBold',
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  },
  advancedToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
    fontFamily: 'Inter_600SemiBold',
  },
  settingSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Inter_400Regular',
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chevron: {
    marginLeft: 4,
  },
  disabledText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 11,
    textAlign: "center",
    opacity: 0.6,
    fontFamily: 'Inter_400Regular',
  },
});

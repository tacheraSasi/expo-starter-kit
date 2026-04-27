import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const quickActions = [
    { icon: "search-outline", label: "Search", color: "#6C5CE7" },
    { icon: "notifications-outline", label: "Alerts", color: "#45B7D1" },
    { icon: "bookmark-outline", label: "Saved", color: "#96CEB4" },
    { icon: "settings-outline", label: "Settings", color: "#FFB84D" },
  ];

  return (
    <ScreenLayout>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={({ pressed }) => [
              styles.menuButton,
              {
                backgroundColor: theme.cardBackground,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons name="menu" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Home</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Welcome Card */}
        <View
          style={[
            styles.welcomeCard,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <Text style={[styles.welcomeTitle, { color: theme.text }]}>
            Welcome to Your App
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: theme.subtleText }]}>
            This is a starter template. Customize this screen to build your app.
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.quickActionCard,
                  {
                    backgroundColor: theme.cardBackground,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => {
                  if (action.label === "Settings") {
                    router.push("/(core)/settings");
                  }
                }}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: `${action.color}15` },
                  ]}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={24}
                    color={action.color}
                  />
                </View>
                <Text style={[styles.quickActionLabel, { color: theme.text }]}>
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Placeholder Content */}
        <View
          style={[
            styles.placeholderCard,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <Ionicons
            name="construct-outline"
            size={48}
            color={theme.mutedText}
          />
          <Text style={[styles.placeholderTitle, { color: theme.text }]}>
            Start Building
          </Text>
          <Text style={[styles.placeholderText, { color: theme.subtleText }]}>
            Replace this content with your app's features. This starter kit
            includes authentication, navigation, theming, and more.
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: 'Inter_700Bold',
  },
  welcomeCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
  },
  welcomeSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    width: (width - 56) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: 'Inter_600SemiBold',
  },
  placeholderCard: {
    marginHorizontal: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: 'Inter_700Bold',
  },
  placeholderText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    fontFamily: 'Inter_400Regular',
  },
});

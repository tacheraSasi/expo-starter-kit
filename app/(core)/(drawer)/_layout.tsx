import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/ctx";
import { useCurrentTheme } from "@/context/CentralTheme";
import { router } from "expo-router";
import HapticTouchableOpacity from "@/components/HapticTouchableOpacity";

interface DrawerEntry {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  route: string;
  tab?: boolean;
}

/**
 * Drawer shell for the demo app: quick jumps to each tab plus preferences.
 * Swap these entries for your own product sections; the tabs stay the same.
 */
const MENU: DrawerEntry[] = [
  { id: "home", label: "Overview", icon: "home-outline", route: "/(core)/(drawer)/(tabs)/home", tab: true },
  { id: "expenses", label: "Transactions", icon: "wallet-outline", route: "/(core)/(drawer)/(tabs)/expenses", tab: true },
  { id: "reports", label: "Reports", icon: "stats-chart-outline", route: "/(core)/(drawer)/(tabs)/reports", tab: true },
  { id: "settings", label: "Settings", icon: "settings-outline", route: "/(core)/settings" },
];

function CustomDrawerContent(props: any) {
  const { user, signOut } = useAuth();
  const theme = useCurrentTheme();
  const [isLoading, setIsLoading] = useState(false);

  const userInfo = useMemo(() => user || ({} as any), [user]);
  const name = userInfo?.name || "Demo User";
  const email = userInfo?.email || "demo@example.com";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const go = (entry: DrawerEntry) => {
    props.navigation.closeDrawer();
    if (entry.tab) {
      router.navigate(entry.route as any);
    } else {
      router.push(entry.route as any);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    props.navigation.closeDrawer();
    // signOut clears the session and redirects on its own.
    await signOut();
    setIsLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.divider }]}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {name}
          </Text>
          <Text
            style={[styles.email, { color: theme.subtleText }]}
            numberOfLines={1}
          >
            {email}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: theme.mutedText }]}>
          Menu
        </Text>
        <View style={[styles.group, { backgroundColor: theme.card }]}>
          {MENU.map((entry, index) => (
            <HapticTouchableOpacity
              key={entry.id}
              hapticType="light"
              style={[
                styles.item,
                index > 0 && {
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: theme.divider,
                },
              ]}
              onPress={() => go(entry)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.itemIcon, { backgroundColor: theme.primarySoft }]}
              >
                <Ionicons name={entry.icon} size={18} color={theme.primary} />
              </View>
              <Text style={[styles.itemLabel, { color: theme.text }]}>
                {entry.label}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.mutedText}
              />
            </HapticTouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <HapticTouchableOpacity
          hapticType="medium"
          style={[styles.signOut, { backgroundColor: theme.errorBg }]}
          onPress={handleSignOut}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.error} />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={18} color={theme.error} />
              <Text style={[styles.signOutText, { color: theme.error }]}>
                Sign out
              </Text>
            </>
          )}
        </HapticTouchableOpacity>
        <Text style={[styles.version, { color: theme.mutedText }]}>
          Starter Kit · demo data
        </Text>
      </View>
    </View>
  );
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: "front",
          overlayColor: "rgba(0,0,0,0.4)",
        }}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  name: { fontSize: 16, fontFamily: "Inter_700Bold" },
  email: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  scroll: { padding: 16, paddingBottom: 24 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  group: { borderRadius: 20, overflow: "hidden" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  itemIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  itemLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  footer: { padding: 16, gap: 10 },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  signOutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  version: {
    textAlign: "center",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
});

import Colors from "@/constants/Colors";
import { ThemeStatusBar, useCurrentTheme } from "@/context/CentralTheme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";

type TabName = keyof typeof Colors.tabColors;

/**
 * Bottom tabs for the demo expense tracker: overview, transactions, reports
 * and account. Each tab keeps its own accent so the bar has some personality
 * without leaving the theme system.
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  tabName: TabName;
  focused: boolean;
}) {
  const theme = useCurrentTheme();
  const accent = Colors.tabColors[props.tabName];

  return (
    <View
      style={[
        styles.iconWrap,
        props.focused && { backgroundColor: `${accent}1f` },
      ]}
    >
      <Ionicons
        name={props.name}
        size={22}
        color={props.focused ? accent : theme.subtleText}
      />
    </View>
  );
}

export default function TabsLayout() {
  const theme = useCurrentTheme();

  return (
    <View style={styles.container}>
      <ThemeStatusBar />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.isDark ? "#000" : "#fff",
            borderTopWidth: 0.5,
            borderTopColor: theme.border,
            paddingTop: 6,
            height: 78,
          },
          tabBarActiveTintColor: theme.text,
          tabBarInactiveTintColor: theme.subtleText,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            fontFamily: "Inter_600SemiBold",
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name="home" tabName="home" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="expenses"
          options={{
            title: "Expenses",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name="wallet" tabName="expenses" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: "Reports",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name="stats-chart" tabName="reports" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Account",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name="person" tabName="profile" focused={focused} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconWrap: {
    width: 44,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});

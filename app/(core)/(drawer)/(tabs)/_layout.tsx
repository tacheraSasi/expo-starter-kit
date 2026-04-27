import Colors from "@/constants/Colors";
import { ThemeStatusBar, useCurrentTheme } from "@/context/CentralTheme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  tabName: keyof typeof Colors.tabColors;
  focused: boolean;
}) {
  const theme = useCurrentTheme();

  const iconColor = props.focused
    ? Colors.tabColors[props.tabName]
    : theme.isDark
      ? "#666666"
      : "#999999";

  return (
    <FontAwesome
      size={26}
      style={{ marginBottom: -3 }}
      name={props.name}
      color={props.focused ? theme.text : theme.subtleText}
    />
  );
}

export default function TabsLayout() {
  const theme = useCurrentTheme();

  return (
    <View style={styles.container}>
      <ThemeStatusBar />
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.isDark ? "#000" : "#fff",
            borderTopWidth: 0.5,
            borderTopColor: theme.border,
            paddingVertical: 18,
            height: 82,
          },
          // tabBarActiveTintColor:
          //   Colors.tabColors[route.name as keyof typeof Colors.tabColors] ??
          //   theme.primary,
          tabBarActiveTintColor: theme.text,
          tabBarInactiveTintColor: theme.subtleText,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            fontFamily: 'Inter_600SemiBold',
          },
        })}
      >
        {/* HOME TAB */}
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name="home" tabName="home" focused={focused} />
            ),
          }}
        />

        {/* PROFILE / ACCOUNT TAB */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Account",
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name="user" tabName="profile" focused={focused} />
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
});

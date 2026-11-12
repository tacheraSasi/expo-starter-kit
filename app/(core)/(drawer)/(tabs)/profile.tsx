import NativeScreen from "@/components/NativeScreen";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useAuth } from "@/context/ctx";
import { Column, List, ListItem, Text } from "@expo/ui";
import { useRouter } from "expo-router";
import { useMemo } from "react";

/**
 * Account screen. Rows are native list items and the actions are plain
 * navigation, so the platform supplies the row styling, separators and press
 * feedback.
 */
export default function ProfileScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const userInfo = useMemo(() => user || ({} as any), [user]);

  return (
    <NativeScreen title="Account">
      <List>
        <Column spacing={4} style={{ padding: 20 }}>
          <Text
            textStyle={{ fontSize: 22, fontWeight: "700", color: theme.text }}
          >
            {userInfo?.name || "Demo User"}
          </Text>
          <Text textStyle={{ fontSize: 13, color: theme.subtleText }}>
            {userInfo?.email || "demo@example.com"}
          </Text>
        </Column>

        <ListItem supportingText={userInfo?.role || "Member"}>
          Role
        </ListItem>
        <ListItem
          supportingText="Theme, notifications, language"
          onPress={() => router.push("/(core)/settings")}
        >
          Settings
        </ListItem>
        <ListItem
          supportingText="Send anonymous feedback"
          onPress={() => router.push("/(core)/help")}
        >
          Help and feedback
        </ListItem>
        <ListItem onPress={() => signOut()}>Sign out</ListItem>
      </List>
    </NativeScreen>
  );
}

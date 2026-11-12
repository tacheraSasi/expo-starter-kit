import Colors from "@/constants/Colors";
import { useCurrentTheme } from "@/context/CentralTheme";
import { NativeTabs } from "expo-router/unstable-native-tabs";

/**
 * iOS tab bar rendered by the system (`UITabBarController`), so it picks up the
 * native material, animations and the iOS 26 Liquid Glass treatment for free.
 *
 * Android and web fall back to the themed JS tabs in `_layout.tsx`, which keeps
 * the starter working on every platform.
 */
export default function TabsLayout() {
  const theme = useCurrentTheme();

  return (
    <NativeTabs tintColor={theme.primary} iconColor={theme.subtleText}>
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="house.fill"
          selectedColor={Colors.tabColors.home}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="expenses">
        <NativeTabs.Trigger.Label>Expenses</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="wallet.pass.fill"
          selectedColor={Colors.tabColors.expenses}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="reports">
        <NativeTabs.Trigger.Label>Reports</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="chart.bar.fill"
          selectedColor={Colors.tabColors.reports}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="person.crop.circle.fill"
          selectedColor={Colors.tabColors.profile}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

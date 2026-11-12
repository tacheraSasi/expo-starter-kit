import HapticTouchableOpacity from "@/components/HapticTouchableOpacity";
import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useApiItem } from "@/hooks/useApi";
import Api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

/** Month-to-date breakdown by category, rendered as simple bars. */
export default function ReportsScreen() {
  const theme = useCurrentTheme();
  const navigation = useNavigation();

  const { data, loading, refreshing, refresh } = useApiItem({
    fetcher: () => Api.getDemoSummary(),
    cachePrefix: "demo:summary",
  });

  const rows = data?.byCategory ?? [];
  const max = rows.reduce((m, r) => Math.max(m, r.amount), 0) || 1;
  const net = (data?.income ?? 0) - (data?.spent ?? 0);

  return (
    <ScreenLayout insideTabs>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={theme.primary}
          />
        }
      >
        <View style={styles.header}>
          <HapticTouchableOpacity
            hapticType="light"
            style={[styles.iconButton, { backgroundColor: theme.card }]}
            onPress={() => (navigation as any)?.openDrawer?.()}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
          >
            <Ionicons name="menu" size={22} color={theme.text} />
          </HapticTouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.text }]}>Reports</Text>
            <Text style={[styles.subtitle, { color: theme.subtleText }]}>
              {data?.month ?? "This month"}
            </Text>
          </View>
        </View>

        {loading && !data ? (
          <Text style={{ color: theme.subtleText }}>Loading report...</Text>
        ) : (
          <>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                  Spent
                </Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {formatCurrency(data?.spent ?? 0)}
                </Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                  Income
                </Text>
                <Text style={[styles.statValue, { color: theme.success }]}>
                  {formatCurrency(data?.income ?? 0)}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.netCard,
                {
                  backgroundColor: net >= 0 ? theme.successBg : theme.errorBg,
                },
              ]}
            >
              <Ionicons
                name={net >= 0 ? "trending-up" : "trending-down"}
                size={18}
                color={net >= 0 ? theme.success : theme.error}
              />
              <Text
                style={[
                  styles.netText,
                  { color: net >= 0 ? theme.success : theme.error },
                ]}
              >
                {net >= 0 ? "Saved" : "Over budget"} {formatCurrency(Math.abs(net))}
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              By category
            </Text>

            <View style={[styles.card, { backgroundColor: theme.card }]}>
              {rows.map((row, index) => (
                <View
                  key={row.category}
                  style={[
                    styles.row,
                    index > 0 && {
                      borderTopWidth: StyleSheet.hairlineWidth,
                      borderTopColor: theme.divider,
                    },
                  ]}
                >
                  <View style={styles.rowHeader}>
                    <View style={[styles.dot, { backgroundColor: row.color }]} />
                    <Text
                      style={[styles.rowLabel, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {row.category}
                    </Text>
                    <Text style={[styles.rowAmount, { color: theme.subtleText }]}>
                      {formatCurrency(row.amount)}
                    </Text>
                  </View>
                  <View
                    style={[styles.track, { backgroundColor: theme.surface }]}
                  >
                    <View
                      style={[
                        styles.fill,
                        {
                          width: `${Math.max(6, Math.round((row.amount / max) * 100))}%`,
                          backgroundColor: row.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}

              {rows.length === 0 && (
                <Text style={[styles.empty, { color: theme.subtleText }]}>
                  No spending recorded this month.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 120 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  statCard: { flex: 1, borderRadius: 18, padding: 16, gap: 6 },
  statLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  netCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
  },
  netText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 10 },
  card: { borderRadius: 20, paddingHorizontal: 16 },
  row: { paddingVertical: 14, gap: 8 },
  rowHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rowLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold" },
  rowAmount: { fontSize: 13, fontFamily: "Inter_500Medium" },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
  empty: { paddingVertical: 24, textAlign: "center", fontSize: 13 },
});

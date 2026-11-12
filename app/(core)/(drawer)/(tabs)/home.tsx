import HapticTouchableOpacity from "@/components/HapticTouchableOpacity";
import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useApiItem } from "@/hooks/useApi";
import Api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

/**
 * Overview screen for the demo expense tracker. Everything is powered by the
 * mock API in `lib/api` so the loading, refresh and empty states are real.
 */
export default function HomeScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const { data, loading, refreshing, refresh } = useApiItem({
    fetcher: () => Api.getDemoSummary(),
    cachePrefix: "demo:summary",
  });

  const budgetLeft = Math.max(0, (data?.budget ?? 0) - (data?.spent ?? 0));
  const progress =
    data && data.budget > 0 ? Math.min(1, data.spent / data.budget) : 0;

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
            <Text style={[styles.greeting, { color: theme.subtleText }]}>
              Welcome back
            </Text>
            <Text style={[styles.name, { color: theme.text }]}>
              {data?.month ?? "This month"}
            </Text>
          </View>

          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
        </View>

        {loading && !data ? (
          <View style={styles.skeletonCard}>
            <Text style={{ color: theme.subtleText }}>Loading summary...</Text>
          </View>
        ) : (
          <>
            <View style={[styles.heroCard, { backgroundColor: theme.primary }]}>
              <Text style={styles.heroLabel}>Spent this month</Text>
              <Text style={styles.heroAmount}>
                {formatCurrency(data?.spent ?? 0)}
              </Text>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.round(progress * 100)}%` },
                  ]}
                />
              </View>

              <View style={styles.heroFooter}>
                <Text style={styles.heroMeta}>
                  Budget {formatCurrency(data?.budget ?? 0)}
                </Text>
                <Text style={styles.heroMeta}>
                  {formatCurrency(budgetLeft)} left
                </Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <View
                style={[styles.statCard, { backgroundColor: theme.card }]}
              >
                <View
                  style={[styles.statIcon, { backgroundColor: theme.successBg }]}
                >
                  <Ionicons
                    name="arrow-down"
                    size={16}
                    color={theme.success}
                  />
                </View>
                <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                  Income
                </Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {formatCurrency(data?.income ?? 0)}
                </Text>
              </View>

              <View
                style={[styles.statCard, { backgroundColor: theme.card }]}
              >
                <View
                  style={[styles.statIcon, { backgroundColor: theme.warningBg }]}
                >
                  <Ionicons name="trending-up" size={16} color={theme.warning} />
                </View>
                <Text style={[styles.statLabel, { color: theme.subtleText }]}>
                  Top category
                </Text>
                <Text
                  style={[styles.statValue, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {data?.topCategory ?? "-"}
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Recent activity
              </Text>
              <HapticTouchableOpacity
                hapticType="light"
                onPress={() =>
                  router.navigate("/(core)/(drawer)/(tabs)/expenses" as any)
                }
              >
                <Text style={[styles.link, { color: theme.primary }]}>
                  See all
                </Text>
              </HapticTouchableOpacity>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card }]}>
              {(data?.recent ?? []).map((txn, index) => (
                <View
                  key={txn.uuid}
                  style={[
                    styles.row,
                    index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.divider },
                  ]}
                >
                  <View style={[styles.rowIcon, { backgroundColor: theme.surface }]}>
                    <Ionicons
                      name={txn.type === "income" ? "arrow-down" : "card-outline"}
                      size={16}
                      color={txn.type === "income" ? theme.success : theme.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.rowTitle, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {txn.title}
                    </Text>
                    <Text style={[styles.rowMeta, { color: theme.subtleText }]}>
                      {txn.category} · {txn.date}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.rowAmount,
                      { color: txn.type === "income" ? theme.success : theme.text },
                    ]}
                  >
                    {txn.type === "income" ? "+" : "-"}
                    {formatCurrency(txn.amount)}
                  </Text>
                </View>
              ))}

              {!loading && (data?.recent?.length ?? 0) === 0 && (
                <Text style={[styles.emptyText, { color: theme.subtleText }]}>
                  No transactions yet. Add your first expense to get started.
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
  greeting: { fontSize: 12, fontFamily: "Inter_500Medium" },
  name: { fontSize: 18, fontFamily: "Inter_700Bold" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  skeletonCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
  },
  heroCard: { borderRadius: 24, padding: 20, marginBottom: 12 },
  heroLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.85)",
  },
  heroAmount: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginTop: 4,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: "#fff" },
  heroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  heroMeta: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.85)",
  },
  statRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 18, padding: 14, gap: 6 },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  statValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  link: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  card: { borderRadius: 20, paddingHorizontal: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  rowMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  rowAmount: { fontSize: 14, fontFamily: "Inter_700Bold" },
  emptyText: {
    paddingVertical: 24,
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});

import HapticTouchableOpacity from "@/components/HapticTouchableOpacity";
import ScreenLayout from "@/components/ScreenLayout";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useApiItem, useApiList, useDebouncedValue } from "@/hooks/useApi";
import Api from "@/lib/api";
import { appAlert } from "@/lib/ui/appAlert";
import { formatCurrency } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

/** Transactions list with search, category filters and pagination. */
export default function ExpensesScreen() {
  const theme = useCurrentTheme();
  const navigation = useNavigation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: categories } = useApiItem({
    fetcher: () => Api.listDemoCategories(),
    cachePrefix: "demo:categories",
  });

  const params = useMemo(
    () => ({ search: debouncedSearch, category }),
    [debouncedSearch, category],
  );

  const {
    data,
    loading,
    refreshing,
    loadingMore,
    refresh,
    loadMore,
    error,
  } = useApiList({
    fetcher: (p) => Api.listDemoTransactions(p),
    params,
    perPage: 12,
    cachePrefix: "demo:transactions",
  });

  return (
    <ScreenLayout insideTabs>
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
        <Text style={[styles.title, { color: theme.text }]}>Expenses</Text>
        <HapticTouchableOpacity
          hapticType="light"
          style={[styles.iconButton, { backgroundColor: theme.primarySoft }]}
          onPress={() =>
            appAlert.dialog(
              "Demo template",
              "The create flow is not wired in this starter kit. Hook it up to your own form or modal route.",
            )
          }
          accessibilityRole="button"
          accessibilityLabel="Add expense"
        >
          <Ionicons name="add" size={22} color={theme.primary} />
        </HapticTouchableOpacity>
      </View>

      <View style={[styles.searchBox, { backgroundColor: theme.card }]}>
        <Ionicons name="search" size={18} color={theme.subtleText} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search transactions"
          placeholderTextColor={theme.subtleText}
          style={[styles.searchInput, { color: theme.text }]}
        />
        {search.length > 0 && (
          <HapticTouchableOpacity
            hapticType="light"
            onPress={() => setSearch("")}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={18} color={theme.subtleText} />
          </HapticTouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
      >
        {(categories ?? []).map((c) => {
          const active = c === category;
          return (
            <HapticTouchableOpacity
              key={c}
              hapticType="selection"
              style={[
                styles.chip,
                { backgroundColor: active ? theme.primary : theme.card },
              ]}
              onPress={() => setCategory(c)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? "#fff" : theme.subtleText },
                ]}
              >
                {c}
              </Text>
            </HapticTouchableOpacity>
          );
        })}
      </ScrollView>

      {loading && data.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : error && data.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ color: theme.subtleText }}>{error}</Text>
          <HapticTouchableOpacity
            hapticType="light"
            onPress={refresh}
            style={[styles.retry, { backgroundColor: theme.primarySoft }]}
          >
            <Text style={{ color: theme.primary, fontFamily: "Inter_600SemiBold" }}>
              Try again
            </Text>
          </HapticTouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.uuid}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={theme.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="wallet-outline" size={56} color={theme.subtleText} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No transactions found
              </Text>
              <Text style={{ color: theme.subtleText }}>
                Try a different search or category.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.row, { backgroundColor: theme.card }]}>
              <View
                style={[
                  styles.rowIcon,
                  {
                    backgroundColor:
                      item.type === "income" ? theme.successBg : theme.primarySoft,
                  },
                ]}
              >
                <Ionicons
                  name={item.type === "income" ? "arrow-down" : "card-outline"}
                  size={18}
                  color={item.type === "income" ? theme.success : theme.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.rowTitle, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text style={[styles.rowMeta, { color: theme.subtleText }]}>
                  {item.category} · {item.date} · {item.method}
                </Text>
              </View>
              <Text
                style={[
                  styles.rowAmount,
                  { color: item.type === "income" ? theme.success : theme.text },
                ]}
              >
                {item.type === "income" ? "+" : "-"}
                {formatCurrency(item.amount)}
              </Text>
            </View>
          )}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={{ marginVertical: 16 }} color={theme.primary} />
            ) : undefined
          }
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, fontSize: 20, fontFamily: "Inter_700Bold" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  chipScroll: { flexGrow: 0, marginTop: 12 },
  chipRow: { paddingHorizontal: 16, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  chipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  listContent: { padding: 16, paddingBottom: 120, gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  rowMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  rowAmount: { fontSize: 14, fontFamily: "Inter_700Bold" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 32 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  retry: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
});

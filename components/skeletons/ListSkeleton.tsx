import React from "react";
import { View, StyleSheet } from "react-native";
import { SkeletonItem } from "@/components/SkeletonLoader";
import { useCurrentTheme } from "@/context/CentralTheme";

interface ListSkeletonProps {
  /** Number of skeleton rows to render */
  count?: number;
  /** Show a search bar skeleton at the top */
  showSearch?: boolean;
  /** Show filter chips skeleton below search */
  showFilters?: boolean;
  /** Show a screen header (back btn + title + add btn) */
  showHeader?: boolean;
  /** Card variant to match specific page layouts */
  variant?: "invoice" | "product" | "customer" | "generic";
}

/**
 * Generic list skeleton for products, invoices, customers, etc.
 * Matches the card-based design language (borderRadius 24).
 */
export default function ListSkeleton({
  count = 5,
  showSearch = true,
  showFilters = false,
  showHeader = true,
  variant = "generic",
}: ListSkeletonProps) {
  const theme = useCurrentTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {showHeader && (
        <View style={[styles.header, { backgroundColor: theme.card }]}>
          <SkeletonItem width={54} height={54} borderRadius={27} />
          <SkeletonItem width={100} height={18} borderRadius={9} />
          <SkeletonItem width={54} height={54} borderRadius={27} />
        </View>
      )}

      {showSearch && (
        <View style={styles.searchWrap}>
          <SkeletonItem width="100%" height={48} borderRadius={24} />
        </View>
      )}

      {showFilters && (
        <View style={styles.filterRow}>
          {[80, 65, 90, 70].map((w, i) => (
            <SkeletonItem key={i} width={w} height={34} borderRadius={17} />
          ))}
        </View>
      )}

      {Array.from({ length: count }).map((_, i) => {
        if (variant === "invoice") return <InvoiceCardSkeleton key={i} />;
        if (variant === "product") return <ProductCardSkeleton key={i} />;
        if (variant === "customer") return <CustomerCardSkeleton key={i} />;
        return <GenericCardSkeleton key={i} />;
      })}
    </View>
  );
}

function InvoiceCardSkeleton() {
  const theme = useCurrentTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      {/* Header: invoice number + status badge */}
      <View style={styles.cardHead}>
        <View style={{ flex: 1 }}>
          <SkeletonItem width={130} height={16} borderRadius={8} />
          <SkeletonItem
            width={100}
            height={13}
            borderRadius={6}
            style={{ marginTop: 6 }}
          />
        </View>
        <SkeletonItem width={70} height={24} borderRadius={12} />
      </View>

      {/* Detail rows */}
      <View style={[styles.detailSection, { borderTopColor: theme.divider }]}>
        <View style={styles.detailRow}>
          <SkeletonItem width={16} height={16} borderRadius={8} />
          <SkeletonItem width={120} height={13} borderRadius={6} />
        </View>
        <View style={styles.detailRow}>
          <SkeletonItem width={16} height={16} borderRadius={8} />
          <SkeletonItem width={100} height={13} borderRadius={6} />
        </View>
      </View>

      {/* Footer: total */}
      <View style={[styles.cardFoot, { borderTopColor: theme.divider }]}>
        <SkeletonItem width={80} height={12} borderRadius={6} />
        <SkeletonItem width={90} height={18} borderRadius={8} />
      </View>
    </View>
  );
}

function ProductCardSkeleton() {
  const theme = useCurrentTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      {/* Header: image + name + stock badge */}
      <View style={styles.productHead}>
        <SkeletonItem
          width={48}
          height={48}
          borderRadius={10}
          style={{ marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <SkeletonItem width={150} height={16} borderRadius={8} />
          <SkeletonItem
            width={90}
            height={12}
            borderRadius={6}
            style={{ marginTop: 5 }}
          />
        </View>
        <SkeletonItem width={65} height={22} borderRadius={11} />
      </View>

      {/* Detail rows */}
      <View style={[styles.detailSection, { borderTopColor: theme.divider }]}>
        <View style={styles.detailRow}>
          <SkeletonItem width={16} height={16} borderRadius={8} />
          <SkeletonItem width={140} height={13} borderRadius={6} />
        </View>
        <View style={styles.detailRow}>
          <SkeletonItem width={16} height={16} borderRadius={8} />
          <SkeletonItem width={100} height={13} borderRadius={6} />
        </View>
        <View style={styles.detailRow}>
          <SkeletonItem width={16} height={16} borderRadius={8} />
          <SkeletonItem width={80} height={13} borderRadius={6} />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <SkeletonItem width={80} height={32} borderRadius={16} />
        <SkeletonItem width={90} height={32} borderRadius={16} />
      </View>
    </View>
  );
}

function CustomerCardSkeleton() {
  const theme = useCurrentTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      {/* Header: name + type badge */}
      <View style={styles.cardHead}>
        <View style={{ flex: 1 }}>
          <SkeletonItem width={140} height={16} borderRadius={8} />
          <SkeletonItem
            width={170}
            height={12}
            borderRadius={6}
            style={{ marginTop: 6 }}
          />
          <SkeletonItem
            width={110}
            height={12}
            borderRadius={6}
            style={{ marginTop: 4 }}
          />
        </View>
        <SkeletonItem width={65} height={22} borderRadius={11} />
      </View>

      {/* Stats row */}
      <View style={[styles.statsRow, { borderTopColor: theme.divider }]}>
        <View style={{ flex: 1 }}>
          <SkeletonItem width={80} height={11} borderRadius={5} />
          <SkeletonItem
            width={70}
            height={15}
            borderRadius={7}
            style={{ marginTop: 4 }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <SkeletonItem width={75} height={11} borderRadius={5} />
          <SkeletonItem
            width={60}
            height={15}
            borderRadius={7}
            style={{ marginTop: 4 }}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.cardFootSimple}>
        <SkeletonItem width={80} height={20} borderRadius={10} />
        <SkeletonItem width={100} height={12} borderRadius={6} />
      </View>
    </View>
  );
}

function GenericCardSkeleton() {
  const theme = useCurrentTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.cardHead}>
        <View style={{ flex: 1 }}>
          <SkeletonItem width={130} height={16} borderRadius={8} />
          <SkeletonItem
            width={90}
            height={13}
            borderRadius={6}
            style={{ marginTop: 6 }}
          />
        </View>
        <SkeletonItem width={60} height={16} borderRadius={8} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  searchWrap: {
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  card: {
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  cardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  detailSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 16,
  },
  cardFootSimple: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  productHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
});

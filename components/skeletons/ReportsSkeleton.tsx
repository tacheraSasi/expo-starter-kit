import React from "react";
import { View, StyleSheet } from "react-native";
import { SkeletonItem } from "@/components/SkeletonLoader";
import { useCurrentTheme } from "@/context/CentralTheme";

interface ReportsSkeletonProps {
  /** "sales" shows KPI grid + chart area, "z-reports" shows stats + report cards */
  variant?: "sales" | "z-reports";
}

/**
 * Skeleton for report screens matching their actual layouts.
 */
export default function ReportsSkeleton({
  variant = "sales",
}: ReportsSkeletonProps) {
  const theme = useCurrentTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <SkeletonItem width={54} height={54} borderRadius={27} />
        <SkeletonItem width={120} height={18} borderRadius={9} />
        <SkeletonItem width={54} height={54} borderRadius={27} />
      </View>

      {variant === "sales" ? (
        <SalesAnalysisSkeleton theme={theme} />
      ) : (
        <ZReportsSkeleton theme={theme} />
      )}
    </View>
  );
}

function SalesAnalysisSkeleton({ theme }: { theme: any }) {
  return (
    <View style={styles.content}>
      {/* Time Period Filter */}
      <View style={styles.section}>
        <SkeletonItem
          width={90}
          height={14}
          borderRadius={7}
          style={{ marginBottom: 12 }}
        />
        <View style={styles.filterRow}>
          {[60, 55, 65, 50, 70].map((w, i) => (
            <SkeletonItem key={i} width={w} height={34} borderRadius={17} />
          ))}
        </View>
      </View>

      {/* Store Filter */}
      <View style={styles.section}>
        <SkeletonItem
          width={80}
          height={14}
          borderRadius={7}
          style={{ marginBottom: 12 }}
        />
        <View style={styles.filterRow}>
          {[70, 85, 75].map((w, i) => (
            <SkeletonItem key={i} width={w} height={34} borderRadius={17} />
          ))}
        </View>
      </View>

      {/* KPI Grid */}
      <View style={styles.kpiGrid}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[styles.kpiCard, { backgroundColor: theme.card }]}
          >
            <SkeletonItem
              width={90}
              height={12}
              borderRadius={6}
              style={{ marginBottom: 8 }}
            />
            <SkeletonItem width={100} height={20} borderRadius={8} />
          </View>
        ))}
      </View>

      {/* Chart Area */}
      <View style={[styles.chartArea, { backgroundColor: theme.card }]}>
        <SkeletonItem
          width={120}
          height={16}
          borderRadius={8}
          style={{ marginBottom: 16 }}
        />
        <SkeletonItem width="100%" height={180} borderRadius={12} />
      </View>
    </View>
  );
}

function ZReportsSkeleton({ theme }: { theme: any }) {
  return (
    <View style={styles.content}>
      {/* Info Banner */}
      <View style={[styles.infoBanner, { backgroundColor: theme.card }]}>
        <SkeletonItem width={20} height={20} borderRadius={10} />
        <SkeletonItem width="80%" height={14} borderRadius={7} />
      </View>

      {/* Stats Summary */}
      <View style={styles.statsRow}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.statBox, { backgroundColor: theme.card }]}
          >
            <SkeletonItem
              width={50}
              height={20}
              borderRadius={8}
              style={{ marginBottom: 6 }}
            />
            <SkeletonItem width={60} height={12} borderRadius={6} />
          </View>
        ))}
      </View>

      {/* Report Cards */}
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={[styles.reportCard, { backgroundColor: theme.card }]}
        >
          {/* Header: report number + badge */}
          <View style={styles.reportHead}>
            <View>
              <SkeletonItem
                width={120}
                height={16}
                borderRadius={8}
                style={{ marginBottom: 4 }}
              />
              <SkeletonItem width={90} height={12} borderRadius={6} />
            </View>
            <SkeletonItem width={70} height={22} borderRadius={11} />
          </View>

          {/* Stats rows */}
          <View style={[styles.reportStats, { borderTopColor: theme.divider }]}>
            <View style={styles.reportStatRow}>
              <SkeletonItem width={16} height={16} borderRadius={8} />
              <SkeletonItem width={100} height={13} borderRadius={6} />
            </View>
            <View style={styles.reportStatRow}>
              <SkeletonItem width={16} height={16} borderRadius={8} />
              <SkeletonItem width={140} height={13} borderRadius={6} />
            </View>
            <View style={styles.reportStatRow}>
              <SkeletonItem width={16} height={16} borderRadius={8} />
              <SkeletonItem width={110} height={13} borderRadius={6} />
            </View>
          </View>

          {/* Footer */}
          <View
            style={[styles.reportFooter, { borderTopColor: theme.divider }]}
          >
            <SkeletonItem width={140} height={16} borderRadius={8} />
            <SkeletonItem width={20} height={20} borderRadius={10} />
          </View>
        </View>
      ))}
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
  content: {
    flex: 1,
    paddingTop: 8,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 8,
  },
  kpiCard: {
    width: "47%",
    borderRadius: 24,
    padding: 16,
  },
  chartArea: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 24,
    padding: 20,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 16,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
  },
  reportCard: {
    borderRadius: 24,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  reportHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  reportStats: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  reportStatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reportFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});

import React from "react";
import { View, StyleSheet } from "react-native";
import { SkeletonItem } from "@/components/SkeletonLoader";
import { useCurrentTheme } from "@/context/CentralTheme";

/**
 * Skeleton that mirrors the home screen layout:
 * - Header with menu button, center text, notification + avatar
 * - "Performance Today" title
 * - 2 metric cards side-by-side
 * - 1 wide metric card
 * - Promo card area
 */
export default function HomeSkeleton() {
  const theme = useCurrentTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Hero Section */}
      <View style={[styles.heroSection, { backgroundColor: theme.card }]}>
        {/* Header Row */}
        <View style={styles.header}>
          <SkeletonItem width={54} height={54} borderRadius={27} />
          <View style={styles.headerCenter}>
            <SkeletonItem width={90} height={13} borderRadius={6} />
            <SkeletonItem
              width={120}
              height={20}
              borderRadius={8}
              style={{ marginTop: 6 }}
            />
          </View>
          <SkeletonItem width={54} height={54} borderRadius={27} />
          <SkeletonItem
            width={42}
            height={42}
            borderRadius={21}
            style={{ marginLeft: 10 }}
          />
        </View>

        {/* Section Title */}
        <SkeletonItem
          width={180}
          height={18}
          borderRadius={9}
          style={{ marginBottom: 16 }}
        />

        {/* Metrics Grid - 2 cards */}
        <View style={styles.metricsRow}>
          <View
            style={[
              styles.metricCard,
              { backgroundColor: theme.isDark ? "#1a3d2f" : "#e6f7f0" },
            ]}
          >
            <View style={styles.metricHeader}>
              <View>
                <SkeletonItem width={70} height={14} borderRadius={7} />
                <SkeletonItem
                  width={40}
                  height={12}
                  borderRadius={6}
                  style={{ marginTop: 4 }}
                />
              </View>
              <SkeletonItem width={40} height={40} borderRadius={20} />
            </View>
            <SkeletonItem
              width={100}
              height={22}
              borderRadius={8}
              style={{ marginTop: 18 }}
            />
          </View>

          <View
            style={[
              styles.metricCard,
              { backgroundColor: theme.isDark ? "#3d3a1a" : "#fef9e6" },
            ]}
          >
            <View style={styles.metricHeader}>
              <View>
                <SkeletonItem width={55} height={14} borderRadius={7} />
                <SkeletonItem
                  width={40}
                  height={12}
                  borderRadius={6}
                  style={{ marginTop: 4 }}
                />
              </View>
              <SkeletonItem width={40} height={40} borderRadius={20} />
            </View>
            <SkeletonItem
              width={80}
              height={22}
              borderRadius={8}
              style={{ marginTop: 18 }}
            />
          </View>
        </View>

        {/* Wide metric card */}
        <View
          style={[
            styles.metricCardWide,
            { backgroundColor: theme.isDark ? "#1a2d3d" : "#eaf6ff" },
          ]}
        >
          <View style={styles.metricHeader}>
            <View>
              <SkeletonItem width={80} height={14} borderRadius={7} />
              <SkeletonItem
                width={65}
                height={12}
                borderRadius={6}
                style={{ marginTop: 4 }}
              />
            </View>
            <SkeletonItem width={40} height={40} borderRadius={20} />
          </View>
          <SkeletonItem
            width={60}
            height={22}
            borderRadius={8}
            style={{ marginTop: 18 }}
          />
        </View>
      </View>

      {/* Promo Card Area */}
      <View style={styles.promoWrapper}>
        <View
          style={[
            styles.promoCard,
            {
              backgroundColor: theme.isDark ? "#F2F2F2" : "#121212",
            },
          ]}
        >
          <SkeletonItem
            width="64%"
            height={28}
            borderRadius={8}
            style={{ marginBottom: 8 }}
          />
          <SkeletonItem
            width="50%"
            height={28}
            borderRadius={8}
            style={{ marginBottom: 18 }}
          />
          <SkeletonItem width={110} height={36} borderRadius={18} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 18,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    minHeight: 130,
    justifyContent: "space-between",
  },
  metricCardWide: {
    borderRadius: 24,
    padding: 16,
    minHeight: 100,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  promoWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  promoCard: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    overflow: "hidden",
  },
});

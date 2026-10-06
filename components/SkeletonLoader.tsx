import { useCurrentTheme } from "@/context/CentralTheme";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonItem: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const theme = useCurrentTheme();

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.isDark ? "#333" : "#e1e1e1",
          overflow: "hidden",
        },
        style,
      ]}
    >
      <ShimmerOverlay theme={theme} />
    </View>
  );
};

/**
 * Shimmer sweep overlay using expo-linear-gradient.
 * Creates a light sweep that moves left-to-right across the skeleton.
 */
function ShimmerOverlay({ theme }: { theme: any }) {
  const translateX = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 2,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -1,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [translateX]);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          transform: [
            {
              translateX: translateX.interpolate({
                inputRange: [-1, 2],
                outputRange: ["-100%", "200%"],
              }),
            },
          ],
        },
      ]}
      pointerEvents="none"
    >
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={[
          "transparent",
          theme.isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.5)",
          theme.isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.7)",
          theme.isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.5)",
          "transparent",
        ]}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

interface SkeletonCardProps {
  showImage?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showMetadata?: boolean;
  style?: any;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showImage = true,
  showTitle = true,
  showSubtitle = true,
  showMetadata = true,
  style,
}) => {
  const theme = useCurrentTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.card,
          borderRadius: 12,
          padding: 16,
          marginVertical: 8,
          borderWidth: 1,
          borderColor: theme.border,
        },
        style,
      ]}
    >
      {showImage && (
        <SkeletonItem
          width="100%"
          height={120}
          borderRadius={8}
          style={{ marginBottom: 12 }}
        />
      )}

      {showTitle && (
        <SkeletonItem width="80%" height={18} style={{ marginBottom: 8 }} />
      )}

      {showSubtitle && (
        <SkeletonItem width="60%" height={14} style={{ marginBottom: 12 }} />
      )}

      {showMetadata && (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <SkeletonItem width={80} height={12} />
          <SkeletonItem width={60} height={12} />
        </View>
      )}
    </View>
  );
};

interface SkeletonListProps {
  itemCount?: number;
  showHeader?: boolean;
  cardProps?: SkeletonCardProps;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  itemCount = 5,
  showHeader = true,
  cardProps,
}) => {
  const theme = useCurrentTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {showHeader && (
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <SkeletonItem width="40%" height={24} style={{ marginBottom: 8 }} />
          <SkeletonItem width="70%" height={16} />
        </View>
      )}

      <View style={{ paddingHorizontal: 16 }}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <SkeletonCard key={index} {...cardProps} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

import NativeScreen from "@/components/NativeScreen";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useApiItem } from "@/hooks/useApi";
import Api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Column, Row, ScrollView, Spacer, Text } from "@expo/ui";
import { useWindowDimensions } from "react-native";

/** Month-to-date report rendered with native layout primitives. */
export default function ReportsScreen() {
  const theme = useCurrentTheme();
  const { width } = useWindowDimensions();

  const { data } = useApiItem({
    fetcher: () => Api.getDemoSummary(),
    cachePrefix: "demo:summary",
  });

  const rows = data?.byCategory ?? [];
  const max = rows.reduce((m, r) => Math.max(m, r.amount), 0) || 1;
  const net = (data?.income ?? 0) - (data?.spent ?? 0);
  const trackWidth = Math.max(120, width - 60);

  return (
    <NativeScreen title="Reports">
      <ScrollView>
        <Column spacing={16} style={{ padding: 16 }}>
          <Column spacing={2}>
            <Text textStyle={{ fontSize: 13, color: theme.subtleText }}>
              {data?.month ?? "This month"}
            </Text>
            <Text
              textStyle={{ fontSize: 28, fontWeight: "700", color: theme.text }}
            >
              Spending report
            </Text>
          </Column>

          <Column
            spacing={10}
            style={{
              backgroundColor: theme.card,
              borderRadius: 18,
              padding: 16,
            }}
          >
            <Row spacing={8}>
              <Text textStyle={{ fontSize: 13, color: theme.subtleText }}>
                Spent
              </Text>
              <Spacer flexible />
              <Text
                textStyle={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: theme.text,
                }}
              >
                {formatCurrency(data?.spent ?? 0)}
              </Text>
            </Row>
            <Row spacing={8}>
              <Text textStyle={{ fontSize: 13, color: theme.subtleText }}>
                Income
              </Text>
              <Spacer flexible />
              <Text
                textStyle={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: theme.success,
                }}
              >
                {formatCurrency(data?.income ?? 0)}
              </Text>
            </Row>
            <Row spacing={8}>
              <Text textStyle={{ fontSize: 13, color: theme.subtleText }}>
                {net >= 0 ? "Saved" : "Over budget"}
              </Text>
              <Spacer flexible />
              <Text
                textStyle={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: net >= 0 ? theme.success : theme.error,
                }}
              >
                {formatCurrency(Math.abs(net))}
              </Text>
            </Row>
          </Column>

          <Text
            textStyle={{ fontSize: 17, fontWeight: "700", color: theme.text }}
          >
            By category
          </Text>

          <Column
            spacing={14}
            style={{
              backgroundColor: theme.card,
              borderRadius: 18,
              padding: 16,
            }}
          >
            {rows.map((row) => (
              <Column key={row.category} spacing={6}>
                <Row spacing={8}>
                  <Text
                    numberOfLines={1}
                    textStyle={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: theme.text,
                    }}
                  >
                    {row.category}
                  </Text>
                  <Spacer flexible />
                  <Text textStyle={{ fontSize: 13, color: theme.subtleText }}>
                    {formatCurrency(row.amount)}
                  </Text>
                </Row>
                <Row
                  style={{
                    height: 6,
                    width: trackWidth,
                    backgroundColor: theme.surface,
                    borderRadius: 3,
                  }}
                >
                  <Row
                    style={{
                      height: 6,
                      width: Math.max(8, (row.amount / max) * trackWidth),
                      backgroundColor: row.color,
                      borderRadius: 3,
                    }}
                  />
                </Row>
              </Column>
            ))}

            {rows.length === 0 && (
              <Text textStyle={{ fontSize: 13, color: theme.subtleText }}>
                No spending recorded this month.
              </Text>
            )}
          </Column>
        </Column>
      </ScrollView>
    </NativeScreen>
  );
}

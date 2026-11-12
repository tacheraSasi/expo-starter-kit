import NativeScreen from "@/components/NativeScreen";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useApiItem } from "@/hooks/useApi";
import Api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Button, Column, Row, ScrollView, Spacer, Text } from "@expo/ui";
import { useRouter } from "expo-router";
import { useWindowDimensions } from "react-native";

/**
 * Overview screen built from native SwiftUI / Jetpack Compose views via
 * `@expo/ui`. No styling library: layout, text and buttons are the platform's
 * own primitives, so it matches the host OS instead of imitating it.
 */
export default function HomeScreen() {
  const theme = useCurrentTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const { data } = useApiItem({
    fetcher: () => Api.getDemoSummary(),
    cachePrefix: "demo:summary",
  });

  const spent = data?.spent ?? 0;
  const budget = data?.budget ?? 0;
  const left = Math.max(0, budget - spent);
  const cardWidth = Math.max(120, (width - 32 - 12) / 2);
  const muted = theme.subtleText;

  return (
    <NativeScreen title="Overview">
      <ScrollView>
        <Column spacing={16} style={{ padding: 16 }}>
          <Column spacing={2}>
            <Text textStyle={{ fontSize: 13, color: muted }}>Welcome back</Text>
            <Text
              textStyle={{ fontSize: 28, fontWeight: "700", color: theme.text }}
            >
              {data?.month ?? "This month"}
            </Text>
          </Column>

          <Column
            spacing={10}
            style={{
              backgroundColor: theme.primary,
              borderRadius: 20,
              padding: 16,
            }}
          >
            <Text textStyle={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
              Spent this month
            </Text>
            <Text
              textStyle={{ fontSize: 34, fontWeight: "700", color: "#FFFFFF" }}
            >
              {formatCurrency(spent)}
            </Text>
            <Row spacing={8}>
              <Text
                textStyle={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}
              >
                {`Budget ${formatCurrency(budget)}`}
              </Text>
              <Spacer flexible />
              <Text
                textStyle={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}
              >
                {`${formatCurrency(left)} left`}
              </Text>
            </Row>
          </Column>

          <Row spacing={12}>
            <Column
              spacing={4}
              style={{
                width: cardWidth,
                backgroundColor: theme.card,
                borderRadius: 18,
                padding: 14,
              }}
            >
              <Text textStyle={{ fontSize: 12, color: muted }}>Income</Text>
              <Text
                textStyle={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: theme.success,
                }}
              >
                {formatCurrency(data?.income ?? 0)}
              </Text>
            </Column>

            <Column
              spacing={4}
              style={{
                width: cardWidth,
                backgroundColor: theme.card,
                borderRadius: 18,
                padding: 14,
              }}
            >
              <Text textStyle={{ fontSize: 12, color: muted }}>
                Top category
              </Text>
              <Text
                numberOfLines={1}
                textStyle={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: theme.text,
                }}
              >
                {data?.topCategory ?? "-"}
              </Text>
            </Column>
          </Row>

          <Text
            textStyle={{ fontSize: 17, fontWeight: "700", color: theme.text }}
          >
            Recent activity
          </Text>

          <Column
            spacing={0}
            style={{
              backgroundColor: theme.card,
              borderRadius: 18,
              paddingHorizontal: 14,
            }}
          >
            {(data?.recent ?? []).map((txn) => (
              <Row key={txn.uuid} spacing={10} style={{ paddingVertical: 12 }}>
                <Column spacing={2}>
                  <Text
                    numberOfLines={1}
                    textStyle={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: theme.text,
                    }}
                  >
                    {txn.title}
                  </Text>
                  <Text textStyle={{ fontSize: 12, color: muted }}>
                    {`${txn.category} · ${txn.date}`}
                  </Text>
                </Column>
                <Spacer flexible />
                <Text
                  textStyle={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: txn.type === "income" ? theme.success : theme.text,
                  }}
                >
                  {`${txn.type === "income" ? "+" : "-"}${formatCurrency(
                    txn.amount,
                  )}`}
                </Text>
              </Row>
            ))}
          </Column>

          <Button
            label="View all transactions"
            variant="filled"
            onPress={() =>
              router.navigate("/(core)/(drawer)/(tabs)/expenses" as any)
            }
          />
        </Column>
      </ScrollView>
    </NativeScreen>
  );
}

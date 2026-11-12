import NativeScreen from "@/components/NativeScreen";
import { useCurrentTheme } from "@/context/CentralTheme";
import { useApiItem, useApiList, useDebouncedValue } from "@/hooks/useApi";
import Api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Column, List, ListItem, Picker, Text, TextInput } from "@expo/ui";
import { useMemo, useState } from "react";

/**
 * Transactions screen using the native list primitives: SwiftUI `List` on iOS,
 * Material 3 `ListItem` on Android, plus the platform search field and picker.
 */
export default function ExpensesScreen() {
  const theme = useCurrentTheme();
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

  const { data, total, refresh } = useApiList({
    fetcher: (p) => Api.listDemoTransactions(p),
    params,
    perPage: 50,
    cachePrefix: "demo:transactions",
  });

  return (
    <NativeScreen title="Expenses">
      <List onRefresh={async () => refresh()}>
        <Column spacing={10} style={{ padding: 16 }}>
          <TextInput
            placeholder="Search transactions"
            onChangeText={setSearch}
          />
          <Picker
            selectedValue={category}
            onValueChange={(value) => setCategory(String(value))}
          >
            {(categories ?? []).map((c) => (
              <Picker.Item key={c} label={c} value={c} />
            ))}
          </Picker>
          <Text textStyle={{ fontSize: 12, color: theme.subtleText }}>
            {`${total} ${total === 1 ? "transaction" : "transactions"}`}
          </Text>
        </Column>

        {data.map((item) => (
          <ListItem
            key={item.uuid}
            supportingText={`${item.category} · ${item.date} · ${
              item.type === "income" ? "+" : "-"
            }${formatCurrency(item.amount)}`}
          >
            {item.title}
          </ListItem>
        ))}

        {data.length === 0 && (
          <Column spacing={6} style={{ padding: 24 }}>
            <Text
              textStyle={{
                fontSize: 16,
                fontWeight: "600",
                color: theme.text,
              }}
            >
              No transactions found
            </Text>
            <Text textStyle={{ fontSize: 13, color: theme.subtleText }}>
              Try a different search or category.
            </Text>
          </Column>
        )}
      </List>
    </NativeScreen>
  );
}

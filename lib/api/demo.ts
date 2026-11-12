/**
 * Demo dataset for the starter kit.
 *
 * Fake, but shaped like a real backend so screens, hooks and navigation can be
 * exercised without a server. Replace the API methods in `lib/api/index.ts`
 * with real calls and delete this file.
 */

export type TransactionType = "expense" | "income";

export interface DemoTransaction {
  uuid: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  method: "card" | "cash" | "transfer";
  type: TransactionType;
}

export interface DemoCategoryTotal {
  category: string;
  amount: number;
  color: string;
}

export interface DemoSummary {
  month: string;
  spent: number;
  budget: number;
  income: number;
  spentDelta: number;
  topCategory: string;
  recent: DemoTransaction[];
  byCategory: DemoCategoryTotal[];
}

export const DEMO_CATEGORIES = [
  "All Categories",
  "Food & Drinks",
  "Transport",
  "Bills & Utilities",
  "Shopping",
  "Health",
  "Entertainment",
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  "Food & Drinks": "#f59e0b",
  Transport: "#3b82f6",
  "Bills & Utilities": "#8b5cf6",
  Shopping: "#ec4899",
  Health: "#10b981",
  Entertainment: "#ef4444",
  Income: "#22c55e",
};

const RAW: Omit<DemoTransaction, "uuid">[] = [
  { title: "Groceries at the supermarket", category: "Food & Drinks", amount: 84.5, date: "2026-11-12", method: "card", type: "expense" },
  { title: "Morning coffee", category: "Food & Drinks", amount: 4.8, date: "2026-11-12", method: "card", type: "expense" },
  { title: "Ride to the office", category: "Transport", amount: 12.0, date: "2026-11-11", method: "card", type: "expense" },
  { title: "Electricity bill", category: "Bills & Utilities", amount: 96.4, date: "2026-11-10", method: "transfer", type: "expense" },
  { title: "Streaming subscription", category: "Entertainment", amount: 15.99, date: "2026-11-09", method: "card", type: "expense" },
  { title: "Monthly salary", category: "Income", amount: 3200, date: "2026-11-09", method: "transfer", type: "income" },
  { title: "Pharmacy", category: "Health", amount: 27.3, date: "2026-11-08", method: "cash", type: "expense" },
  { title: "New running shoes", category: "Shopping", amount: 129.0, date: "2026-11-07", method: "card", type: "expense" },
  { title: "Lunch with the team", category: "Food & Drinks", amount: 42.6, date: "2026-11-06", method: "card", type: "expense" },
  { title: "Internet bill", category: "Bills & Utilities", amount: 55.0, date: "2026-11-05", method: "transfer", type: "expense" },
  { title: "Freelance payment", category: "Income", amount: 640.0, date: "2026-11-04", method: "transfer", type: "income" },
  { title: "Bus pass top-up", category: "Transport", amount: 38.0, date: "2026-11-03", method: "cash", type: "expense" },
  { title: "Cinema tickets", category: "Entertainment", amount: 24.0, date: "2026-11-02", method: "card", type: "expense" },
  { title: "Weekly groceries", category: "Food & Drinks", amount: 76.2, date: "2026-11-01", method: "card", type: "expense" },
  { title: "Gym membership", category: "Health", amount: 45.0, date: "2026-10-31", method: "card", type: "expense" },
  { title: "Fuel", category: "Transport", amount: 61.4, date: "2026-10-30", method: "card", type: "expense" },
  { title: "Online order", category: "Shopping", amount: 88.75, date: "2026-10-29", method: "card", type: "expense" },
  { title: "Water bill", category: "Bills & Utilities", amount: 31.2, date: "2026-10-28", method: "transfer", type: "expense" },
  { title: "Dinner out", category: "Food & Drinks", amount: 58.9, date: "2026-10-27", method: "card", type: "expense" },
  { title: "Concert tickets", category: "Entertainment", amount: 95.0, date: "2026-10-26", method: "card", type: "expense" },
  { title: "Doctor visit", category: "Health", amount: 70.0, date: "2026-10-25", method: "cash", type: "expense" },
  { title: "Taxi home", category: "Transport", amount: 18.5, date: "2026-10-24", method: "cash", type: "expense" },
  { title: "Coffee beans", category: "Food & Drinks", amount: 16.4, date: "2026-10-23", method: "card", type: "expense" },
  { title: "Phone case", category: "Shopping", amount: 22.0, date: "2026-10-22", method: "card", type: "expense" },
];

export const DEMO_TRANSACTIONS: DemoTransaction[] = RAW.map((t, i) => ({
  ...t,
  uuid: `txn-${i + 1}`,
}));

function sumWhere(predicate: (t: DemoTransaction) => boolean): number {
  return DEMO_TRANSACTIONS.filter(predicate).reduce((total, t) => total + t.amount, 0);
}

const byCategory: DemoCategoryTotal[] = Object.entries(
  DEMO_TRANSACTIONS.filter((t) => t.type === "expense").reduce<Record<string, number>>(
    (acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    },
    {},
  ),
)
  .map(([category, amount]) => ({
    category,
    amount: Math.round(amount * 100) / 100,
    color: CATEGORY_COLORS[category] ?? "#94a3b8",
  }))
  .sort((a, b) => b.amount - a.amount);

export const DEMO_SUMMARY: DemoSummary = {
  month: "November 2026",
  spent: Math.round(sumWhere((t) => t.type === "expense") * 100) / 100,
  budget: 2400,
  income: Math.round(sumWhere((t) => t.type === "income") * 100) / 100,
  spentDelta: 8.2,
  topCategory: byCategory[0]?.category ?? "Food & Drinks",
  recent: DEMO_TRANSACTIONS.slice(0, 5),
  byCategory,
};

/** Shared slice + meta builder so demo lists behave like paginated APIs. */
export function paginate<T>(
  all: T[],
  params: { page?: number; per_page?: number } = {},
) {
  const per = params.per_page ?? 12;
  const page = params.page ?? 1;
  const start = (page - 1) * per;
  const lastPage = Math.max(1, Math.ceil(all.length / per));
  return {
    data: all.slice(start, start + per),
    meta: {
      current_page: page,
      from: all.length === 0 ? 0 : start + 1,
      per_page: per,
      to: Math.min(start + per, all.length),
      total: all.length,
      last_page: lastPage,
      total_items: all.length,
      total_pages: lastPage,
      has_next_page: start + per < all.length,
      has_previous_page: page > 1,
    },
  };
}

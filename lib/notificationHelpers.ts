import type { Ionicons } from "@expo/vector-icons";
import { getCategoryFromType, getCategoryVisual, getTypeConfig } from "./notificationTypes";

type IconName = keyof typeof Ionicons.glyphMap;

export interface NotificationTypeInfo {
  icon: IconName;
  color: string;
  label: string;
  category: string;
}

export function getNotificationTypeInfo(type: string): NotificationTypeInfo {
  const config = getTypeConfig(type);
  if (config) {
    const visual = getCategoryVisual(config.category);
    return {
      icon: visual.icon,
      color: visual.color,
      label: config.label,
      category: config.category,
    };
  }

  const category = getCategoryFromType(type);
  const visual = getCategoryVisual(category);
  return {
    icon: visual.icon,
    color: visual.color,
    label: type
      .split(".")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" "),
    category,
  };
}

export interface PriorityInfo {
  label: string;
  color: string;
  bgColor: string;
  icon: IconName;
}

const PRIORITY_MAP: Record<string, PriorityInfo> = {
  critical: {
    label: "Critical",
    color: "#dc2626",
    bgColor: "#fef2f2",
    icon: "alert-circle",
  },
  high: {
    label: "High",
    color: "#ea580c",
    bgColor: "#fff7ed",
    icon: "arrow-up-circle",
  },
  normal: {
    label: "Normal",
    color: "#6b7280",
    bgColor: "#f9fafb",
    icon: "remove-circle-outline",
  },
  low: {
    label: "Low",
    color: "#9ca3af",
    bgColor: "#f9fafb",
    icon: "arrow-down-circle-outline",
  },
};

export function getPriorityInfo(priority: string): PriorityInfo {
  return (
    PRIORITY_MAP[priority] ?? {
      label: priority || "Normal",
      color: "#6b7280",
      bgColor: "#f9fafb",
      icon: "remove-circle-outline" as IconName,
    }
  );
}

const UUID_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

export function stripUuids(text: string): string {
  return text
    .replace(UUID_REGEX, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function isUuidValue(v: unknown): boolean {
  return typeof v === "string" && UUID_REGEX.test(v);
}

export function isUuidKey(k: string): boolean {
  return k.toLowerCase().includes("uuid") || k.toLowerCase().includes("_id");
}

export function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatFullDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function humanizeKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount == null) return "";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDecimal(value: number | string | null | undefined): string {
  if (value == null) return "";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getStatusColor(status: string): string {
  const lower = status.toLowerCase();
  if (["approved", "paid", "completed", "won", "delivered", "active", "success"].includes(lower))
    return "#10b981";
  if (["pending", "submitted", "awaiting_approval", "scheduled", "in_progress"].includes(lower))
    return "#f59e0b";
  if (["rejected", "failed", "lost", "overdue", "expired", "cancelled"].includes(lower))
    return "#ef4444";
  if (["draft", "created"].includes(lower)) return "#6b7280";
  return "#6b7280";
}

export function getStatusIcon(status: string): IconName {
  const lower = status.toLowerCase();
  if (["approved", "paid", "completed", "won", "delivered", "active", "success"].includes(lower))
    return "checkmark-circle";
  if (["pending", "submitted", "awaiting_approval", "scheduled", "in_progress"].includes(lower))
    return "time-outline";
  if (["rejected", "failed", "lost", "overdue", "expired", "cancelled"].includes(lower))
    return "close-circle";
  if (["draft", "created"].includes(lower)) return "ellipse-outline";
  return "ellipse-outline" as IconName;
}

const HIDDEN_DATA_KEYS = new Set([
  "url",
  "type",
  "notification_uuid",
  "priority",
  "action_url",
  "action_type",
  "__entity_details",
]);

export function getEntityDetails(
  data: Record<string, any> | null,
): [string, string][] {
  if (!data?.__entity_details || typeof data.__entity_details !== "object")
    return [];
  return Object.entries(data.__entity_details).map(([key, value]) => [
    key,
    String(value),
  ]);
}

export function getDisplayableData(
  data: Record<string, any> | null,
): [string, any][] {
  if (!data) return [];

  const entityKeys = new Set<string>();
  if (data.__entity_details && typeof data.__entity_details === "object") {
    for (const prettyKey of Object.keys(data.__entity_details)) {
      entityKeys.add(prettyKey.toLowerCase().replace(/\s+/g, "_"));
    }
  }

  return Object.entries(data).filter(
    ([key, value]) =>
      !HIDDEN_DATA_KEYS.has(key) &&
      !isUuidKey(key) &&
      !isUuidValue(value) &&
      !entityKeys.has(key) &&
      value != null,
  );
}

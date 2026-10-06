import type { Ionicons } from "@expo/vector-icons";

type IconName = keyof typeof Ionicons.glyphMap;

export interface NotificationTypeConfig {
  label: string;
  category: string;
  entity_type: string;
  entity_label_key?: string;
  mobile_route?: string;
  mobile_route_param?: string;
  mobile_route_value_key?: string;
  priority?: string;
}

export interface NotificationRoute {
  route: string;
  params: Record<string, string>;
}

/**
 * Registry mapping notification `type` -> display + routing config.
 * Add your own entries per backend event. Example:
 *   "order.created": { label: "Order Created", category: "orders",
 *     entity_type: "order", mobile_route: "/(core)/orders/[uuid]",
 *     mobile_route_param: "uuid", mobile_route_value_key: "order_uuid" },
 */
export const TYPE_REGISTRY: Record<string, NotificationTypeConfig> = {
  "general.announcement": {
    label: "Announcement",
    category: "general",
    entity_type: "general",
  },
  "ota_update.ready": {
    label: "Update Ready",
    category: "system",
    entity_type: "system",
    mobile_route: "/(core)/(drawer)/(tabs)/home",
  },
};

export const CATEGORY_VISUAL: Record<string, { icon: IconName; color: string }> = {
  general: { icon: "notifications-outline", color: "#007AFF" },
  system: { icon: "settings-outline", color: "#666666" },
};

function templateRoute(
  template: string,
  param: string | undefined,
  value: string | undefined,
): { route: string; params: Record<string, string> } {
  if (!param || !value) return { route: template, params: {} };
  const route = template.replace(`[${param}]`, value).replace(`{${param}}`, value);
  if (route !== template) return { route, params: {} };
  return { route: template, params: { [param]: value } };
}

/**
 * Resolve a push-notification payload to an expo-router destination.
 * Honors an explicit `data.url` override first, then the type registry.
 */
export function resolveNotificationRoute(
  type: string,
  data?: Record<string, any>,
): NotificationRoute | null {
  const url = data?.url ?? data?.action_url;
  if (typeof url === "string" && url.length > 0) {
    return { route: url, params: {} };
  }
  const config = TYPE_REGISTRY[type];
  if (!config?.mobile_route) return null;
  const valueKey = config.mobile_route_value_key ?? config.mobile_route_param;
  const value =
    valueKey && data?.[valueKey] != null ? String(data[valueKey]) : undefined;
  return templateRoute(config.mobile_route, config.mobile_route_param, value);
}

/** Key used to pick a renderer component for rich notification cards. */
export function getRendererKey(type: string): string {
  return TYPE_REGISTRY[type]?.entity_type ?? "general";
}

export function getTypeConfig(type: string): NotificationTypeConfig | undefined {
  return TYPE_REGISTRY[type];
}

export function getCategoryFromType(type: string): string {
  return TYPE_REGISTRY[type]?.category ?? type.split(".")[0] ?? "general";
}

export function getCategoryVisual(category: string): {
  icon: IconName;
  color: string;
} {
  return (
    CATEGORY_VISUAL[category] ?? {
      icon: "notifications-outline" as IconName,
      color: "#666666",
    }
  );
}

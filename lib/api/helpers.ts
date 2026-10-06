import logger from "../logger";

import type {
  PaginatedResponse,
  PaginationLinks,
  PaginationMeta,
} from "./types";

export function defaultMeta(): PaginationMeta {
  return {
    current_page: 1,
    from: 0,
    per_page: 15,
    to: 0,
    total: 0,
    last_page: 1,
    total_items: 0,
    total_pages: 1,
    has_next_page: false,
    has_previous_page: false,
  };
}

/**
 * Normalize a paginated response from the new unified backend format
 * to be backward-compatible with existing consumers.
 *
 * The backend now returns:
 *   { status: "success", data: [...], meta: { total_items, total_pages, ... } }
 *
 * This adds the old field aliases (total, last_page) so existing screens
 * continue working while supporting the new field names.
 */
export function normalizePaginated<T>(raw: any): PaginatedResponse<T> {
  if (!raw) {
    return { data: [], meta: defaultMeta() };
  }

  if (Array.isArray(raw)) {
    return { data: raw, meta: defaultMeta() };
  }

  const hasOldSuccess = raw.success !== undefined;
  const nested = raw.data;
  const hasNestedData = !Array.isArray(nested) && Array.isArray(nested?.data);
  const rawMeta = hasNestedData ? nested?.meta : raw.meta;

  const data: T[] = Array.isArray(nested)
    ? nested
    : hasNestedData
      ? nested.data
      : [];

  const meta: PaginationMeta = {
    current_page: rawMeta?.current_page ?? 1,
    from: rawMeta?.from ?? 0,
    per_page: rawMeta?.per_page ?? 15,
    to: rawMeta?.to ?? 0,
    total: rawMeta?.total_items ?? rawMeta?.total ?? 0,
    last_page: rawMeta?.total_pages ?? rawMeta?.last_page ?? 1,
    total_items: rawMeta?.total_items ?? rawMeta?.total ?? 0,
    total_pages: rawMeta?.total_pages ?? rawMeta?.last_page ?? 1,
    has_next_page: rawMeta?.has_next_page ?? false,
    has_previous_page: rawMeta?.has_previous_page ?? false,
  };

  return {
    status: raw.status ?? (hasOldSuccess ? (raw.success ? "success" : "error") : undefined),
    success: hasOldSuccess ? raw.success : raw.status === "success",
    message: raw.message,
    data,
    meta,
    links: raw.links as PaginationLinks | undefined,
    summary: raw.summary,
  };
}

/**
 * Merge multiple summary blocks (one per store) into a single summary.
 * Numeric leaves are summed, arrays concatenated, entities nulled.
 */
export function mergeSummaries<T extends Record<string, any>>(
  summaries: T[],
): T | undefined {
  if (summaries.length === 0) return undefined;
  if (summaries.length === 1) return summaries[0];

  const out: Record<string, any> = {};
  const keys = new Set<string>();
  for (const s of summaries) {
    for (const k of Object.keys(s || {})) keys.add(k);
  }

  for (const key of keys) {
    const values = summaries.map((s) => s?.[key]);
    const first = values[0];

    if (Array.isArray(first)) {
      out[key] = values.flat();
    } else if (first !== null && typeof first === "object") {
      out[key] = null; // entity objects don't merge across stores
    } else if (values.every((v) => typeof v === "number")) {
      out[key] = values.reduce((sum, v) => sum + (Number(v) || 0), 0);
    } else {
      out[key] = first;
    }
  }

  // Recompute average-style fields that are now stale after summing.
  const outRecord = out as Record<string, any>;
  const count = Number(outRecord.total_count ?? outRecord.total_movements ?? outRecord.total_items_count ?? 0);
  if (count > 0) {
    if (outRecord.average_sale !== undefined && outRecord.total_sales !== undefined) {
      outRecord.average_sale = Number(outRecord.total_sales) / count;
    }
  } else if (outRecord.average_sale !== undefined) {
    outRecord.average_sale = 0;
  }

  return out as T;
}

export function handleError(error: any, defaultMessage: string): Error {
  if (error.response) {
    const data = error.response.data;
    const status = error.response.status;
    const errorMessage = data.message || data.error || "";

    // 403 Forbidden user lacks permission or store access.
    // Log at warn level instead of error to reduce noise.
    if (status === 403) {
      logger.warn(
        `[403] ${defaultMessage}: ${errorMessage}`,
      );

      // Store access issues are a common 403 make the message actionable.
      if (
        errorMessage.toLowerCase().includes("access to this store") ||
        errorMessage.toLowerCase().includes("do not have access")
      ) {
        return new Error(
          "You don't have access to the selected store. " +
            "Try selecting a different store or contact your administrator.",
        );
      }

      if (errorMessage.toLowerCase().includes("permission")) {
        return new Error(
          "You don't have permission to perform this action. " +
            "Please contact your system administrator.",
        );
      }

      return new Error(errorMessage || defaultMessage);
    }

    // Handle validation errors (422)
    if (status === 422 && data.errors) {
      logger.warn(`[422] ${defaultMessage}`);
      let allErrors: string[] = [];
      if (Array.isArray(data.errors)) {
        // Backend format: array of { field, message, code, value }
        allErrors = data.errors
          .map((e: any) => e?.message)
          .filter(Boolean);
      } else {
        // Laravel default format: { field: ["msg1", "msg2"] }
        allErrors = Object.entries(data.errors)
          .map(([field, msgs]) => (Array.isArray(msgs) ? msgs[0] : msgs))
          .filter(Boolean);
      }
      if (allErrors.length > 0) {
        return new Error(allErrors.join(". "));
      }
      return new Error(data.message || defaultMessage);
    }

    // Non-403, non-422 errors: log as error
    logger.error(defaultMessage, error);
    logger.error("API Error Response:", JSON.stringify(data, null, 2));

    // Safety net: redirect to login for auth errors that slipped past the interceptor
    const authErrorPatterns = [
      "Invalid token issuer",
      "Token has been revoked",
      "Unauthenticated",
      "Token is invalid",
      "No token provided",
      "Token not provided",
    ];
    const isAuthError = authErrorPatterns.some((pattern) =>
      errorMessage.toLowerCase().includes(pattern.toLowerCase()),
    );
    if (isAuthError || status === 401) {
      logger.warn(
        "Auth error in handleError, signing out and redirecting to login:",
        errorMessage,
      );
      // Dynamic import to avoid circular dependency issues
      import("./authToken").then(({ clearCache }) => {
        clearCache().then(() => {
          import("expo-router").then(({ router }) => {
            router.replace("/(auth)/login");
          });
        });
      });
      return new Error("Session expired. Please log in again.");
    }

    return new Error(data.message || data.error || defaultMessage);
  }

  // Network errors request was made but no HTTP response was received.
  // This is a transport-layer failure (DNS, TLS handshake, timeout, blocked route).
  // Surface the underlying cause so we can distinguish them instead of always
  // reporting a generic "Cannot reach server".
  const axiosErr = error as any;
  const cause =
    axiosErr?.code ||
    axiosErr?.message ||
    (axiosErr?.request?._response && String(axiosErr.request._response)) ||
    "unknown";
  const reqUrl =
    axiosErr?.config?.baseURL
      ? String(axiosErr.config.baseURL) + String(axiosErr.config.url || "")
      : String(axiosErr?.config?.url || axiosErr?.request?.responseURL || "");
  const reqMethod = (axiosErr?.config?.method || "").toUpperCase();
  logger.error(
    `${defaultMessage} [network] code=${cause} method=${reqMethod} url=${reqUrl}`,
    {
      code: axiosErr?.code,
      message: axiosErr?.message,
      name: axiosErr?.name,
      stack: axiosErr?.stack,
    },
  );

  if (error.request) {
    // Detect timeout explicitly different user guidance than a hard block.
    const isTimeout =
      axiosErr?.code === "ECONNABORTED" ||
      /timeout|timed out/i.test(axiosErr?.message || "");
    if (isTimeout) {
      return new Error(
        "Server took too long to respond. Please check your connection and try again.",
      );
    }
    // Keep the familiar message but include the cause so support can see what happened.
    return new Error(`Cannot reach server (${cause}). Please check your connection.`);
  }

  return new Error(error.message || defaultMessage);
}

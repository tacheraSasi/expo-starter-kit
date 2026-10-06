import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import { invalidateCache } from "@/lib/api/cache";
import type { PaginatedResponse, PaginationMeta } from "@/lib/api/types";

export interface UseApiListOptions<T> {
  /** Fetches one page. Receives the merged params ({ page, per_page, ...filters }). */
  fetcher: (params: Record<string, any>) => Promise<PaginatedResponse<T>>;
  /** Filter params when their cleaned content changes, page 1 is refetched. */
  params?: Record<string, any>;
  perPage?: number;
  /** When false, no auto-fetch happens (e.g. no store selected yet). */
  enabled?: boolean;
  /** When set, `refresh()` and focus-refetches bust cached entries with this prefix first. */
  cachePrefix?: string;
  /** Refetch page 1 (silently) when the screen regains focus. Skips the first focus. */
  refetchOnFocus?: boolean;
  onError?: (error: any) => void;
}

export interface UseApiListResult<T> {
  data: T[];
  /** Direct setter use for optimistic updates or after local mutations. */
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  /** Last fetch error. Screens render an ErrorState with onRetry={refresh} when data is empty. */
  error: any;
  page: number;
  lastPage: number;
  total: number;
  meta: PaginationMeta | null;
  /** Response-level summary block (e.g. cross-list totals), if the API returns one. */
  summary: any;
  /** Fetch page 1 with the full-screen loading state (e.g. after a mutation). */
  refetch: () => void;
  /** Bust the cache (if cachePrefix) and fetch page 1 with the pull-to-refresh state. */
  refresh: () => void;
  /** Append the next page; no-op while loading or on the last page. */
  loadMore: () => void;
  /** Clear the list without fetching. */
  reset: () => void;
}

/** Drops undefined/null/"" values so filters never send empty params. */
function cleanParams(params: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== "") out[key] = value;
  }
  return out;
}

/** Canonical serialization (keys sorted) so object identity doesn't matter. */
function stableStringify(value: any): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

/**
 * Paginated list data-fetching hook.
 *
 * Replaces the per-screen boilerplate of list + filters + pagination:
 * loading/refreshing/loadingMore states, page/lastPage/total tracking,
 * refetch on filter change, pull-to-refresh with cache busting, focus
 * refetch, and stale-append protection.
 */
export function useApiList<T>(options: UseApiListOptions<T>): UseApiListResult<T> {
  const {
    fetcher,
    params = {},
    perPage = 20,
    enabled = true,
    cachePrefix,
    refetchOnFocus = false,
    onError,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [summary, setSummary] = useState<any>(null);

  // Keep latest options in a ref so the stable callbacks never go stale.
  const optionsRef = useRef({ fetcher, params, perPage, enabled, cachePrefix, refetchOnFocus, onError });
  optionsRef.current = { fetcher, params, perPage, enabled, cachePrefix, refetchOnFocus, onError };

  const loadingRef = useRef(loading);
  loadingRef.current = loading;
  const pageRef = useRef(page);
  pageRef.current = page;
  const lastPageRef = useRef(lastPage);
  lastPageRef.current = lastPage;
  const loadingMoreRef = useRef(loadingMore);
  loadingMoreRef.current = loadingMore;
  const signatureRef = useRef("");
  // Monotonic request id: only the latest in-flight request may write state.
  const requestIdRef = useRef(0);

  const loadPage = useCallback(
    async (
      pageNum: number,
      append: boolean,
      mode: "loading" | "refreshing" | "loadingMore",
    ) => {
      const { fetcher, params, perPage, onError } = optionsRef.current;

      const merged = { ...cleanParams(params), per_page: perPage, page: pageNum };
      const signature = stableStringify(merged);
      const requestId = ++requestIdRef.current;

      if (mode === "loading") setLoading(true);
      else if (mode === "refreshing") setRefreshing(true);
      else setLoadingMore(true);

      // Page-1 requests claim the active signature synchronously so a
      // slower response from the previous filters is discarded when it
      // resolves (e.g. fast search typing).
      if (!append) signatureRef.current = signature;

      try {
        const res = await fetcher(merged);

        // A newer request superseded this one: drop the response instead
        // of clobbering fresher data or clearing its loading state.
        if (requestId !== requestIdRef.current) return;

        // Append responses must still match the current query a slow
        // loadMore resolving after a filter change would otherwise append
        // duplicates onto the reset list.
        if (append && signatureRef.current !== signature) return;

        setError(null);
        const resMeta = res?.meta ?? null;
        const rows = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];

        if (append) {
          setData((prev) => {
            const seen = new Set(prev.map((r) => (r as any)?.uuid ?? (r as any)?.id));
            const fresh = rows.filter((r) => {
              const key = (r as any)?.uuid ?? (r as any)?.id;
              return key === undefined || !seen.has(key);
            });
            return fresh.length > 0 ? [...prev, ...fresh] : prev;
          });
        } else {
          setData(rows);
          setSummary(res?.summary ?? null);
        }

        setPage(resMeta?.current_page ?? pageNum);
        setLastPage(resMeta?.total_pages ?? 1);
        setTotal(resMeta?.total_items ?? rows.length);
        setMeta(resMeta);
      } catch (error) {
        if (requestId !== requestIdRef.current) return;
        setError(error);
        onError?.(error);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    [],
  );

  // Fetch page 1 whenever the cleaned filter params change.
  const paramsKey = useMemo(() => stableStringify(cleanParams(params)), [params]);
  useEffect(() => {
    if (!enabled) {
      requestIdRef.current += 1;
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
      return;
    }
    loadPage(1, false, "loading");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, enabled, loadPage]);

  // Refresh when the screen regains focus. The first focus is skipped
  // the params effect above already loaded page 1 on mount.
  const isFirstFocusRef = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (!optionsRef.current.refetchOnFocus) return;
      if (isFirstFocusRef.current) {
        isFirstFocusRef.current = false;
        return;
      }
      if (optionsRef.current.cachePrefix) {
        invalidateCache(optionsRef.current.cachePrefix);
      }
      loadPage(1, false, "refreshing");
    }, [loadPage]),
  );

  const refetch = useCallback(() => {
    if (!optionsRef.current.enabled) return;
    loadPage(1, false, "loading");
  }, [loadPage]);

  const refresh = useCallback(() => {
    if (!optionsRef.current.enabled) return;
    if (optionsRef.current.cachePrefix) {
      invalidateCache(optionsRef.current.cachePrefix);
    }
    loadPage(1, false, "refreshing");
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (!optionsRef.current.enabled) return;
    if (loadingRef.current || loadingMoreRef.current) return;
    if (pageRef.current >= lastPageRef.current) return;
    loadPage(pageRef.current + 1, true, "loadingMore");
  }, [loadPage]);

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    signatureRef.current = "";
    setData([]);
    setError(null);
    setLoading(false);
    setRefreshing(false);
    setLoadingMore(false);
    setPage(1);
    setLastPage(1);
    setTotal(0);
    setMeta(null);
    setSummary(null);
  }, []);

  return {
    data,
    setData,
    loading,
    refreshing,
    loadingMore,
    error,
    page,
    lastPage,
    total,
    meta,
    summary,
    refetch,
    refresh,
    loadMore,
    reset,
  };
}

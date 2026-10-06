import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import { invalidateCache } from "@/lib/api/cache";

export interface UseApiItemOptions<T> {
  /** Fetches the item. Return null/undefined when the response is empty. */
  fetcher: () => Promise<T | null>;
  /** Re-fetch when any of these change (e.g. a selected uuid). */
  deps?: React.DependencyList;
  enabled?: boolean;
  onError?: (error: any) => void;
  /** Fires with the fetched value (skip when the fetch returned null). */
  onSuccess?: (data: T) => void;
  /** When set, `refresh()` and focus-refetches bust cached entries with this prefix first. */
  cachePrefix?: string;
  /** Refetch (silently) when the screen regains focus. Skips the first focus. */
  refetchOnFocus?: boolean;
}

export interface UseApiItemResult<T> {
  data: T | null;
  /** Direct setter — use for optimistic updates after local mutations. */
  setData: React.Dispatch<React.SetStateAction<T | null>>;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  /** Fetch with the full loading state. */
  refetch: () => void;
  /** Bust the cache (if cachePrefix) and fetch with the pull-to-refresh state. */
  refresh: () => void;
}

/**
 * Single-item data-fetching hook: loading/error/refreshing state + refetch.
 * Re-fetches whenever `deps` change or `refetch()`/`refresh()` is called.
 */
export function useApiItem<T>(options: UseApiItemOptions<T>): UseApiItemResult<T> {
  const {
    fetcher,
    deps = [],
    enabled = true,
    onError,
    onSuccess,
    cachePrefix,
    refetchOnFocus = false,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const optionsRef = useRef({ enabled, cachePrefix, refetchOnFocus });
  optionsRef.current = { enabled, cachePrefix, refetchOnFocus };

  // Monotonic request id: only the latest in-flight fetch may write state.
  const requestIdRef = useRef(0);

  const load = useCallback(async (mode: "loading" | "refreshing" = "loading") => {
    const requestId = ++requestIdRef.current;
    if (mode === "loading") setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      // Superseded by a newer fetch (deps change, refetch, focus): drop it.
      if (requestId !== requestIdRef.current) return;
      setData(result);
      if (result !== null && result !== undefined) {
        onSuccessRef.current?.(result);
      }
    } catch (e: any) {
      if (requestId !== requestIdRef.current) return;
      const message = e?.message || "Failed to load";
      setError(message);
      onErrorRef.current?.(e);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      requestIdRef.current += 1;
      setData(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    load("loading");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, load, ...deps]);

  // Refresh when the screen regains focus. The first focus is skipped —
  // the deps effect above already loaded on mount.
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
      load("refreshing");
    }, [load]),
  );

  const refetch = useCallback(() => {
    if (!optionsRef.current.enabled) return;
    load("loading");
  }, [load]);

  const refresh = useCallback(() => {
    if (!optionsRef.current.enabled) return;
    if (optionsRef.current.cachePrefix) {
      invalidateCache(optionsRef.current.cachePrefix);
    }
    load("refreshing");
  }, [load]);

  return { data, setData, loading, refreshing, error, refetch, refresh };
}

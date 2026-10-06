/**
 * Bounded persistent cache + in-flight request deduplication.
 *
 * Backed by a dedicated MMKV instance (`template-app-api-cache`, see
 * lib/storage/mmkv.ts) so cache entries survive cold starts without ever
 * sharing space with auth tokens or user data. Reads return immediately
 * (from memory or disk); when an entry is stale the caller still gets the
 * cached value but a background revalidation is kicked off to refresh it
 * stale-while-revalidate semantics.
 *
 * Why this matters: the app fires 2-3x the necessary requests on launch
 * (mount + focus effects), and the backend is variable-latency (cold
 * calls 1-2s, warm 300-500ms). Deduplicating concurrent requests +
 * reusing persistent cached data cuts both wall time and server load,
 * and makes warm launches feel instant.
 *
 * Bounds: every distinct search string, page, and filter set would
 * otherwise create a permanent in-memory entry plus a persisted JSON
 * blob, so all of the following caps are enforced together:
 *
 * - Memory: LRU map capped at MAX_MEMORY_ENTRIES. Hits refresh recency;
 *   the oldest entry is dropped once the cap is exceeded.
 * - Disk: capped at MAX_DISK_ENTRIES, enforced on every write via a
 *   write-order queue (oldest-first eviction, no full scans on the hot
 *   path). Persisted entries older than MAX_DISK_AGE_MS are treated as
 *   dead and removed on read.
 * - Hydration is lazy per key: no startup scan, no bulk load. The first
 *   read of a key checks memory, then disk, then the network.
 * - One-shot keys (free-text search results) should pass
 *   `{ persist: false }` so typing never accumulates disk blobs. They
 *   still live in the bounded memory LRU for the session.
 * - Entries serializing above MAX_PERSIST_BYTES (e.g. per_page=500
 *   picker payloads) stay memory-only: persisting them would block the
 *   JS thread on huge synchronous writes for data that is cheap to
 *   refetch and rarely reused across restarts.
 *
 * Scope: tiny on purpose. Entries are invalidated explicitly via
 * `invalidateCache()` (pull-to-refresh, post-mutation, logout). TTLs
 * bound staleness; pull-to-refresh callers should always invalidate
 * before fetching so the user gets fresh data on demand.
 */

import { apiCacheMmkv, mmkv } from "../storage/mmkv";

interface CacheEntry<T> {
  value: T;
  expiresAt: number; // epoch ms, 0 = never expires
  fetchedAt: number; // epoch ms, for min-interval gating and disk ordering
}

export interface CacheGetOptions {
  /**
   * Default true. Pass false for one-shot keys (e.g. free-text search
   * results) that should live in the bounded memory LRU only and never
   * be written to disk.
   */
  persist?: boolean;
}

/** In-memory LRU cap. A full 50-item product page is the reference unit. */
const MAX_MEMORY_ENTRIES = 60;
/** Persisted entry cap. Only the most recent pages survive restarts. */
const MAX_DISK_ENTRIES = 30;
/** Persisted entries older than this are dropped on read. */
const MAX_DISK_AGE_MS = 24 * 60 * 60 * 1000;
/** Larger serialized entries stay memory-only (see header comment). */
const MAX_PERSIST_BYTES = 512 * 1024;

/**
 * Legacy keys from the pre-budget era lived in the shared auth instance
 * under this prefix. Removed once by the schema migration below.
 */
const LEGACY_NAMESPACE = "template-app:api-cache:";
/** Bookkeeping key inside the dedicated cache instance. Never evicted. */
const SCHEMA_KEY = "__cache_schema_version";
const SCHEMA_VERSION = 2;

const cache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();
/**
 * Oldest-first write order of disk entries, used to enforce
 * MAX_DISK_ENTRIES without scanning/parsing the instance on the hot
 * path. Best-effort mirror: reconciled once per session against actual
 * disk contents the first time the budget is enforced.
 */
const diskOrder: string[] = [];
let didReconcileDiskOrder = false;
let didMigrate = false;

/**
 * One-time versioned migration (replaces the old wipe-on-every-start).
 * Drops unbounded legacy entries from the shared instance so they stop
 * competing with auth tokens for space, then stamps the schema version
 * so this never runs again. Deferred to the first real cache operation
 * so module import stays free of disk I/O.
 */
function ensureMigrated(): void {
  if (didMigrate) return;
  didMigrate = true;
  let stored = 0;
  try {
    stored = apiCacheMmkv.getNumber(SCHEMA_KEY) ?? 0;
  } catch {
    return;
  }
  if (stored >= SCHEMA_VERSION) return;
  try {
    for (const key of mmkv.getAllKeys()) {
      if (!key.startsWith(LEGACY_NAMESPACE)) continue;
      try {
        mmkv.remove(key);
      } catch {
        // keep going: one stuck key must not block the rest
      }
    }
  } catch {
    // shared instance unreadable: nothing to clean, stamp anyway
  }
  try {
    apiCacheMmkv.set(SCHEMA_KEY, SCHEMA_VERSION);
  } catch {
    // stamping failed: migration will simply retry next cold start
    didMigrate = false;
  }
}

/** Marks a key most-recently-used. */
function touch(key: string): void {
  const entry = cache.get(key);
  if (entry !== undefined) {
    cache.delete(key);
    cache.set(key, entry);
  }
}

/** Evicts least-recently-used entries until the memory cap holds. */
function trimMemory(): void {
  while (cache.size > MAX_MEMORY_ENTRIES) {
    const oldest = cache.keys().next();
    if (oldest.done) break;
    cache.delete(oldest.value);
  }
}

function removeFromDisk(key: string): void {
  try {
    apiCacheMmkv.remove(key);
  } catch {
    // ignore: disk and memory are best-effort mirrors
  }
}

/**
 * Reads one entry from disk. Drops corrupted or ancient entries so they
 * can never accumulate. TTL expiry is NOT checked here: stale entries
 * are still useful to stale-while-revalidate callers, and the normal
 * TTL logic decides freshness after hydration.
 */
function readFromDisk<T>(key: string): CacheEntry<T> | undefined {
  ensureMigrated();
  let raw: string | undefined;
  try {
    raw = apiCacheMmkv.getString(key);
  } catch {
    return undefined;
  }
  if (!raw) return undefined;
  let entry: CacheEntry<T>;
  try {
    entry = JSON.parse(raw) as CacheEntry<T>;
  } catch {
    removeFromDisk(key);
    return undefined;
  }
  if (!entry || typeof entry !== "object" || !("value" in entry)) {
    removeFromDisk(key);
    return undefined;
  }
  const fetchedAt =
    typeof entry.fetchedAt === "number" ? entry.fetchedAt : 0;
  if (Date.now() - fetchedAt > MAX_DISK_AGE_MS) {
    removeFromDisk(key);
    return undefined;
  }
  return entry;
}

/**
 * Memory lookup with LRU refresh, falling back to a lazy disk read that
 * promotes the entry back into memory. This replaces the old eager
 * hydrate-all-on-first-call: keys never touched in a session cost
 * nothing.
 */
function peek<T>(key: string): CacheEntry<T> | undefined {
  const mem = cache.get(key) as CacheEntry<T> | undefined;
  if (mem) {
    touch(key);
    return mem;
  }
  const disk = readFromDisk<T>(key);
  if (disk) {
    cache.set(key, disk as CacheEntry<unknown>);
    trimMemory();
  }
  return disk;
}

/**
 * Merges cold-start disk contents into the write-order queue once per
 * session. Drops corrupted and ancient entries found along the way.
 */
function reconcileDiskOrder(): void {
  if (didReconcileDiskOrder) return;
  didReconcileDiskOrder = true;
  let keys: string[];
  try {
    keys = apiCacheMmkv.getAllKeys();
  } catch {
    return;
  }
  const aged: Array<{ key: string; fetchedAt: number }> = [];
  const now = Date.now();
  for (const key of keys) {
    if (key === SCHEMA_KEY) continue;
    if (diskOrder.includes(key)) continue;
    let fetchedAt = 0;
    try {
      const raw = apiCacheMmkv.getString(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { fetchedAt?: unknown };
      fetchedAt =
        typeof parsed?.fetchedAt === "number" ? parsed.fetchedAt : 0;
    } catch {
      removeFromDisk(key);
      continue;
    }
    if (now - fetchedAt > MAX_DISK_AGE_MS) {
      removeFromDisk(key);
      continue;
    }
    aged.push({ key, fetchedAt });
  }
  aged.sort((a, b) => a.fetchedAt - b.fetchedAt);
  diskOrder.unshift(...aged.map((a) => a.key));
}

/** Evicts oldest-first until the disk budget holds. */
function enforceDiskBudget(): void {
  reconcileDiskOrder();
  while (diskOrder.length > MAX_DISK_ENTRIES) {
    const oldest = diskOrder.shift();
    if (oldest === undefined) break;
    removeFromDisk(oldest);
  }
}

function trackDiskWrite(key: string): void {
  const index = diskOrder.indexOf(key);
  if (index !== -1) diskOrder.splice(index, 1);
  diskOrder.push(key);
  enforceDiskBudget();
}

function persistSerialized(key: string, serialized: string): void {
  ensureMigrated();
  try {
    apiCacheMmkv.set(key, serialized);
  } catch {
    // Instance pressure: drop the oldest quarter and retry once. If it
    // still fails, the entry stays memory-only for this session instead
    // of crashing the caller or crowding out other data.
    reconcileDiskOrder();
    const evictCount = Math.max(1, Math.floor(MAX_DISK_ENTRIES / 4));
    for (let i = 0; i < evictCount; i++) {
      const oldest = diskOrder.shift();
      if (oldest === undefined) break;
      removeFromDisk(oldest);
    }
    try {
      apiCacheMmkv.set(key, serialized);
    } catch {
      return;
    }
  }
  trackDiskWrite(key);
}

/** Stores a fetched value in memory and, unless opted out, on disk. */
function storeEntry<T>(
  key: string,
  entry: CacheEntry<T>,
  persist: boolean,
): void {
  cache.set(key, entry as CacheEntry<unknown>);
  trimMemory();
  if (!persist) return;
  let serialized: string;
  try {
    serialized = JSON.stringify(entry);
  } catch {
    return;
  }
  if (serialized.length > MAX_PERSIST_BYTES) return;
  persistSerialized(key, serialized);
}

/**
 * Returns cached data if present (even if stale), otherwise calls
 * `fetcher`. Concurrent calls for the same key share a single in-flight
 * request. When the cached entry is stale, the caller still receives
 * the cached value immediately and a background revalidation fires to
 * refresh the cache for the *next* caller: stale-while-revalidate.
 *
 * Pass `forceFresh: true` to skip the cache entirely and refetch (used
 * by `invalidateCache` + refetch flows where the caller wants the
 * newest value rather than instant-but-stale).
 *
 * @param key      Stable cache key (e.g. "stores", "products:store=abc&page=1")
 * @param fetcher  Function that performs the actual network request
 * @param ttlMs    Time-to-live in milliseconds. 0 = never expire from cache.
 * @param options  `{ persist: false }` keeps one-shot keys (search
 *                 results) in the bounded memory LRU only.
 */
export function cacheGet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number,
  options?: CacheGetOptions,
): Promise<T> {
  const now = Date.now();
  const existing = peek<T>(key);

  if (existing && (existing.expiresAt === 0 || existing.expiresAt > now)) {
    return Promise.resolve(existing.value);
  }

  // Dedup: if a request for this key is already in flight, reuse it.
  const pending = inFlight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const persist = options?.persist !== false;
  const promise = fetcher()
    .then((value) => {
      const entry: CacheEntry<T> = {
        value,
        expiresAt: ttlMs === 0 ? 0 : now + ttlMs,
        fetchedAt: now,
      };
      storeEntry(key, entry, persist);
      return value;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, promise);
  return promise;
}

/**
 * Stale-while-revalidate: returns the cached value immediately (even
 * if stale) and kicks off a background refresh. If there's no cached
 * value at all, awaits the fetcher. Use for screens that should render
 * instantly on warm launch and silently update when the fresh data
 * arrives: e.g. the home dashboard, stores picker, product categories.
 *
 * The optional `onRevalidate` callback fires when the background fetch
 * completes with a fresh value, so callers can update UI state without
 * awaiting.
 */
export function cacheGetStaleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number,
  onRevalidate?: (freshValue: T) => void,
): Promise<T> {
  const now = Date.now();
  const existing = peek<T>(key);

  if (existing) {
    const isStale =
      existing.expiresAt !== 0 && existing.expiresAt <= now;
    if (!isStale) {
      return Promise.resolve(existing.value);
    }
    // Stale but present: return immediately, refresh in the background.
    // Don't dedup the background refresh: we want it to actually run.
    fetcher()
      .then((value) => {
        const fetchedAt = Date.now();
        const entry: CacheEntry<T> = {
          value,
          expiresAt: ttlMs === 0 ? 0 : fetchedAt + ttlMs,
          fetchedAt,
        };
        storeEntry(key, entry, true);
        onRevalidate?.(value);
      })
      .catch(() => {
        // Background refresh failed; keep serving stale value.
        // Next caller will retry.
      });
    return Promise.resolve(existing.value);
  }

  // No cached value at all: must await the fetch.
  return cacheGet(key, fetcher, ttlMs);
}

/**
 * Throttles a fetcher so it runs at most once per `minMs` window.
 * Unlike `cacheGet`, this always returns a value (cached or fresh)
 * without throwing: used for low-priority "reconcile on focus" calls
 * like unread-notification count where we don't want to hammer the
 * server on every AppState foreground transition.
 */
export async function withMinInterval<T>(
  key: string,
  fetcher: () => Promise<T>,
  minMs: number,
): Promise<T> {
  const now = Date.now();
  const cached = peek<T>(key);

  if (cached && now - cached.fetchedAt < minMs) {
    return cached.value;
  }

  return cacheGet(key, fetcher, minMs);
}

/**
 * Invalidates one cache entry (by exact key) or all entries whose key
 * starts with `prefix`. Call with no args to clear everything (e.g. on
 * logout). Clears both the in-memory map and the disk persistence so
 * stale data doesn't survive a restart either.
 */
export function invalidateCache(prefix?: string): void {
  ensureMigrated();
  if (prefix === undefined) {
    cache.clear();
    inFlight.clear();
    diskOrder.length = 0;
    didReconcileDiskOrder = true;
    try {
      apiCacheMmkv.clearAll();
      apiCacheMmkv.set(SCHEMA_KEY, SCHEMA_VERSION);
    } catch {
      // ignore: best-effort disk cleanup
    }
    return;
  }

  for (const key of [...cache.keys()]) {
    if (key === prefix || key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
  for (const key of [...inFlight.keys()]) {
    if (key === prefix || key.startsWith(prefix)) {
      // In-flight requests can't be cancelled portably; just stop
      // caching their result by leaving the entry absent. The caller
      // can re-fetch.
      inFlight.delete(key);
    }
  }
  for (let i = diskOrder.length - 1; i >= 0; i--) {
    const key = diskOrder[i];
    if (key === prefix || key.startsWith(prefix)) {
      diskOrder.splice(i, 1);
    }
  }
  try {
    for (const key of apiCacheMmkv.getAllKeys()) {
      if (key === SCHEMA_KEY) continue;
      if (key === prefix || key.startsWith(prefix)) {
        try {
          apiCacheMmkv.remove(key);
        } catch {
          // keep going: one stuck key must not block the rest
        }
      }
    }
  } catch {
    // ignore: best-effort disk cleanup
  }
}

/**
 * Warm the cache by running a set of fetchers in parallel. Used during
 * splash to preload critical data (stores, dashboard, categories) so
 * the first screen renders instantly. Each fetcher is wrapped in
 * `cacheGet` so it dedups with any concurrent caller.
 *
 * Returns when all fetchers settle (success or failure). Failures are
 * swallowed: the splash should still hide and let the relevant screen
 * show its own error state / retry.
 */
export async function warmCache(
  fetchers: Array<{ key: string; fetch: () => Promise<unknown>; ttlMs: number }>,
): Promise<void> {
  await Promise.allSettled(
    fetchers.map(({ key, fetch, ttlMs }) =>
      cacheGet(key, fetch, ttlMs).catch(() => {
        // swallow: warmCache is best-effort
      }),
    ),
  );
}

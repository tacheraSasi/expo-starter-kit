/**
 * MMKV instances with an in-memory fallback for Expo Go.
 *
 * `react-native-mmkv` contains native code that is NOT bundled in Expo Go
 * and throws there. The fallback shim keeps the starter kit fully testable
 * in Expo Go (data lasts for the JS session only). In dev/production builds
 * the real MMKV instances are used and data persists across restarts.
 */
import { createMMKV as createMMKVNative } from "react-native-mmkv";
import logger from "../logger";

interface KVStore {
  getString(key: string): string | undefined;
  set(key: string, value: string | number | boolean): void;
  getNumber(key: string): number | undefined;
  remove(key: string): void;
  getAllKeys(): string[];
  clearAll(): void;
}

function createMemoryStore(): KVStore {
  const map = new Map<string, string | number | boolean>();
  return {
    getString: (key) =>
      typeof map.get(key) === "string"
        ? (map.get(key) as string)
        : undefined,
    set: (key, value) => {
      map.set(key, value);
    },
    getNumber: (key) =>
      typeof map.get(key) === "number"
        ? (map.get(key) as number)
        : undefined,
    remove: (key) => {
      map.delete(key);
    },
    getAllKeys: () => [...map.keys()],
    clearAll: () => {
      map.clear();
    },
  };
}

function createStore(id: string): KVStore {
  try {
    const store = createMMKVNative({ id }) as unknown as KVStore;
    // Probe: in Expo Go the native module is missing and the throw
    // happens on first use rather than at creation time.
    const probe = "__storage_probe__";
    store.set(probe, "1");
    store.getString(probe);
    store.remove(probe);
    return store;
  } catch (e) {
    logger.warn(
      `[storage] MMKV unavailable (Expo Go?). Using in-memory fallback for "${id}".`,
    );
    return createMemoryStore();
  }
}

export const mmkv = createStore("template-app");

/**
 * Dedicated instance for the API response cache (lib/api/cache.ts).
 *
 * Keeping the cache in its own instance means cache pressure can never
 * crowd out login state, and wiping the cache (logout, pull-to-refresh)
 * never touches auth data.
 */
export const apiCacheMmkv = createStore("template-app-api-cache");

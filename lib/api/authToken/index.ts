import logger from "../../logger";
import { mmkv } from "../../storage/mmkv";
import { isJwtExpired } from "../../utils";

/**
 * Generic current-user shape for the starter kit.
 * Backends differ (id as number|string, name vs fullName, single role
 * vs roles array); this interface accepts the common superset and the
 * `currentUser()` migration below normalizes legacy caches.
 */
export interface CurrentUser {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  role?: string | null;
  avatar_url?: string | null;
  [key: string]: any;
}

export const LAST_REFRESH_KEY = "template-app:last-refresh-timestamp";

const storage = {
  getItem: (key: string): string | null => {
    return mmkv.getString(key) ?? null;
  },
  setItem: (key: string, value: string): void => {
    mmkv.set(key, value);
  },
  removeItem: (key: string): void => {
    mmkv.remove(key);
  },
  clear: (): void => {
    mmkv.clearAll();
  },
};

export const authToken = async (tokenType: string) => {
  const _key = `template-app:${tokenType}-token`;
  return storage.getItem(_key) || null;
};

export const setAuthToken = async (tokens: {
  [key: string]: string | null;
}) => {
  try {
    for (const [key, value] of Object.entries(tokens)) {
      if (value !== null) {
        storage.setItem(`template-app:${key}-token`, value);
      } else {
        // Remove token if value is null
        storage.removeItem(`template-app:${key}-token`);
      }
    }
  } catch (error) {
    logger.error("Error saving auth tokens:", error);
    throw error;
  }
};

export const saveUser = async (user: CurrentUser) => {
  storage.setItem("template-app:user", JSON.stringify(user));
};

export const saveUserData = async (user: any) => {
  storage.setItem("template-app:user-data", JSON.stringify(user));
};

export const currentUser = async (): Promise<CurrentUser | null> => {
  const raw = storage.getItem("template-app:user");
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  let migrated = false;
  // Normalize id to string
  if (parsed.id !== undefined && typeof parsed.id !== "string") {
    parsed.id = String(parsed.id);
    migrated = true;
  }
  // Accept either name or fullName; keep both populated
  if (!parsed.fullName && parsed.name) {
    parsed.fullName = parsed.name;
    migrated = true;
  }
  if (!parsed.name && parsed.fullName) {
    parsed.name = parsed.fullName;
    migrated = true;
  }
  // Fold legacy roles[] into single role
  if (parsed.role === undefined && Array.isArray(parsed.roles)) {
    parsed.role = parsed.roles[0] ?? null;
    delete parsed.roles;
    migrated = true;
  }
  if (migrated) {
    storage.setItem("template-app:user", JSON.stringify(parsed));
  }
  return parsed;
};

export const userData = async () => {
  const user = storage.getItem("template-app:user-data");
  return user ? JSON.parse(user) : null;
};

export const userLocation = async () => {
  const user = storage.getItem("template-app:user-data");
  return user ? JSON.parse(user).userInfo?.location ?? null : null;
};

export const isLoggedIn = async () => {
  const user = await currentUser();
  return user !== null && (user.fullName ?? user.name) != null;
};

export interface TokenExpirationInfo {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  accessTokenExpired: boolean | null;
  refreshTokenExpired: boolean | null;
}

/** True when an access token exists and is not expired. */
export const hasValidTokens = async (): Promise<boolean> => {
  const access = await authToken("access");
  if (!access) return false;
  return !isJwtExpired(access);
};

export const getTokenExpirationInfo =
  async (): Promise<TokenExpirationInfo> => {
    const [access, refresh] = await Promise.all([
      authToken("access"),
      authToken("refresh"),
    ]);
    return {
      hasAccessToken: access !== null,
      hasRefreshToken: refresh !== null,
      accessTokenExpired: access ? isJwtExpired(access) : null,
      refreshTokenExpired: refresh ? isJwtExpired(refresh) : null,
    };
  };

export const clearCache = async () => {
  storage.clear();
};

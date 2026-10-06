import { create } from "zustand";

interface NotificationState {
  unreadCount: number;
  /** Last successful server fetch (epoch ms). 0 means never. */
  lastSyncedAt: number;
  /** True while a server fetch is in flight. */
  isFetching: boolean;
  setCount: (count: number) => void;
  bump: (delta: number) => void;
  reset: () => void;
  setFetching: (fetching: boolean) => void;
}

/**
 * Global unread-notification counter.
 *
 * Sources of truth (in order of freshness):
 *  - Push notification received in-app   → `bump(+1)` from usePushNotifications
 *  - Local OTA reminder that fires later → `bump(+1)` from useOTAUpdates
 *  - User marks a single item as read    → `bump(-1)` from notifications screen
 *  - User marks all as read              → `reset()`   from notifications screen
 *  - App foregrounds / home focuses      → refetch via `Api.getUnreadNotificationCount`
 *
 * The store is intentionally NOT persisted — the server is the source of truth,
 * and stale local counts are reconciled on the next foreground transition.
 */
export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  lastSyncedAt: 0,
  isFetching: false,

  setCount: (count) =>
    set(() => ({
      unreadCount: Math.max(0, count),
      lastSyncedAt: Date.now(),
    })),

  bump: (delta) =>
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount + delta),
    })),

  reset: () => set(() => ({ unreadCount: 0 })),

  setFetching: (fetching) => set(() => ({ isFetching: fetching })),
}));

export const notificationStore = useNotificationStore;

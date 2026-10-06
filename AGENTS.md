# Starter Kit — Agent Guide

## Quick start

```sh
bun install
bun start -c          # dev (clear cache)
bun run android       # native Android
bun run ios           # native iOS
```

No backend needed: `lib/api/index.ts` is a **mock API** (simulated latency,
persists to MMKV). Any email + password signs in; all OTP screens accept
`123456`.

Build (via EAS, see `Makefile`):
```sh
make build-apk              # Android APK preview
make build-production       # Android production
make build-ios-production   # iOS production
make ota msg="fix"          # OTA update on production branch
```

To wire a real backend: see `lib/api/config.ts` (axios + JWT refresh) and
replace the method bodies in `lib/api/index.ts`. Keep method names so
screens/hooks keep working.

## Architecture

**Expo SDK 56** — file-based routing via **expo-router**.

Three route groups:
- `app/(auth)/` — login, register, forgot/reset, verify, terms
- `app/(onboarding)/` — step1, step2 (shown once per fresh install or after logout)
- `app/(core)/` — authenticated screens behind `Stack.Protected guard={!!session}`

Core sub-routes:
- `(drawer)/(tabs)/` — home, profile (main screens)
- `(modals)/` — `presentation: "modal"` (full-screen overlays)
- `(formsheets)/` — `presentation: "formSheet"` (iOS native sheet)

**Prefer screens over bottom sheets.** `NativeAppBottomSheet` (from
`@expo/ui/community/bottom-sheet`) is the canonical sheet component, for
secondary actions only — never primary create/edit flows.

## API layer (`lib/api/`)

`lib/api/index.ts` is currently a **mock facade** with the same surface a
real backend client would expose. `config.ts` (axios singleton pair,
JWT single-flight refresh, HMAC mobile headers) is kept ready for the swap.
`mobileAuth.ts` headers are no-ops unless `EXPO_PUBLIC_MOBILE_API_KEY/SECRET`
are set.

- Shared response helpers (`normalizePaginated`, `handleError`,
  `mergeSummaries`) live in `lib/api/helpers.ts`.
- Bounded persistent cache (`cacheGet`, `cacheGetStaleWhileRevalidate`,
  `withMinInterval`, `invalidateCache`, `warmCache`) in `lib/api/cache.ts`.
- Data hooks in `hooks/useApi/` (`useApiList`, `useApiItem`, `useApiAction`,
  `useDebouncedValue`). Demo source: `Api.listDemoItems`.

## Storage layers

| Data | Storage | Access |
|------|---------|--------|
| Auth tokens, user | MMKV (`react-native-mmkv`, id `template-app`; in-memory fallback in Expo Go) | `lib/api/authToken/` |
| API cache | MMKV (`template-app-api-cache`) | `lib/api/cache.ts` |
| Session key, onboarding | `expo-secure-store` | `hooks/useStorageState.ts` |
| Settings, language | `@react-native-async-storage/async-storage` via zustand/persist | `stores/settings`, `stores/language` |

**Never mix layers.** `clearCache()` clears MMKV only (not SecureStore).

## Auth flow

`SessionProvider` (`context/ctx.tsx`) with three split contexts
(`useAuthUser` / `useAuthSession` / `useAuthActions`; `useAuth` combined).

- **`signOut()` already calls `router.replace("/(auth)/login")`** — do not add a second navigation after calling it.
- The axios request interceptor (`lib/api/config.ts`) calls
  `router.replace("/(auth)/login")` on 401 / refresh failure. **Guard
  background API calls with `authToken("access")` checks.**
- Startup composition lives in `hooks/_init/useAppInit.ts`
  (fonts, i18n readiness, push, OTA, token refresh).

## Styling

**Every screen uses `createStyles` from `context/CentralTheme.tsx`:**

```tsx
const useStyles = createStyles((theme) => ({
  container: { flex: 1, backgroundColor: theme.background },
}));
function MyScreen() {
  const styles = useStyles();
  ...
}
```

`useCurrentTheme()` returns all semantic tokens — never use raw hex values
(defined in `constants/Colors.ts`).

**Never use box shadows.** No `shadowColor`/`shadowOffset`/`shadowOpacity`/
`shadowRadius` or Android `elevation`. Use borders (`borderWidth` +
`borderColor` with theme tokens like `theme.divider`/`theme.border`).

## Reusable components

| Component | Usage |
|-----------|-------|
| `ScreenLayout` | Root wrapper for every screen |
| `ScreenHeader` | Back button + title header for sub-screens |
| `HapticTouchableOpacity` | Every pressable (`hapticType` light/medium/heavy/selection) |
| `NativeAppBottomSheet` | Bottom sheet (secondary actions only) |
| `appAlert.dialog(title, message, buttons)` | Alert dialogs (native-styled via provider) |
| `toast` (from `yooo-native`) | Toast notifications |
| `FormField`, `DatePickerInput`, `OtpInput` | Form inputs |
| `LoadingState`, `ErrorState`, `EmptyState` | Async states |
| `OfflineBanner` | Offline indicator (NetInfo) |
| `ErrorBoundary` | Crash + report + reload |

## i18n

Two languages: English (`locales/en/`) and Swahili (`locales/sw/`).
English bundled eagerly; Swahili lazy-loaded. Namespace-based keys:

```tsx
import { useTranslation } from "react-i18next";
const { t } = useTranslation();
t("auth:login.title")    // namespace:key
t("common:status.loading")
```

## Path aliases

`@/*` maps to the repo root (see `tsconfig.json`):
```tsx
import Api from "@/lib/api";
import { useAuth } from "@/context/ctx";
```

## Important gotchas

- **`signOut()` navigates to login.** Callers should NOT navigate after it.
- **Expo Go fallback:** MMKV is unavailable in Expo Go, so storage falls
  back to an in-memory shim (data lasts for the session only). Remote push
  also needs a dev build. Everything else works in Expo Go.
- `logger.log/warn/error` only outputs in `__DEV__` — no-op in production.
- The `@expo/vector-icons` `Ionicons` and `Feather` families are used throughout.

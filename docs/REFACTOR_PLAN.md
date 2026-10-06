# Starter Kit Structure Guide

> Conventions to keep this template clean as you build your app on top of it.

## Goals

- No screen file > 400 lines (extract sections into `components/`).
- No component/hook file > 150 lines except by explicit exception.
- All server-style fetching through `hooks/useApi/` + `lib/api/cache.ts`
  (no hand-rolled `useState` + `useEffect` fetch boilerplate per screen).
- `lib/api/index.ts` stays a thin facade: one method per backend endpoint,
  shared helpers in `lib/api/helpers.ts`.

## Structure

```
app/                       # THIN screens: routing + composition only
  (auth)/                  # login, register, forgot/reset, verify
  (onboarding)/            # first-run screens
  (core)/                  # authenticated area (drawer + tabs + settings + help)
components/                # reusable UI (generic only — no business logic)
  OtpInput/  skeletons/  notifications/
hooks/
  _init/useAppInit.ts      # startup composer (fonts, i18n, push, OTA, token)
  useApi/                  # useApiList / useApiItem / useApiAction
lib/
  api/                     # config (axios) + helpers + cache + mobileAuth + mock facade
  storage/mmkv.ts          # MMKV with in-memory fallback for Expo Go
  ui/                      # appAlert presenter
  logger.ts  crashReporter.ts  a11y.ts  utils.ts
stores/                    # settings, language, notifications (zustand+persist)
locales/en+sw/             # one JSON per namespace (auth, common, settings, ...)
styles/auth-styles.ts      # shared auth-screen styles
```

## Rules

- Every screen uses `createStyles` from `context/CentralTheme.tsx` and
  semantic tokens — never raw hex values.
- Every pressable uses `HapticTouchableOpacity` (or `SpringPressable`).
- Prefer screens over bottom sheets. `NativeAppBottomSheet` is for
  secondary actions, never primary create/edit flows.
- Never use box shadows. Use borders (`borderWidth` + theme `border`/`divider`)
  and background contrast for separation between surfaces.
- `signOut()` already navigates to login — do not navigate again after it.
- Guard background API calls with `authToken("access")` checks: the axios
  interceptor redirects to login on 401, which remounts the login screen
  if you are already there.
- `clearCache()` clears MMKV only (never SecureStore). Never mix storage layers:
  tokens+user → MMKV, session+onboarding → SecureStore, settings+language →
  AsyncStorage via zustand/persist.
- Screens < 400 lines, hooks for data, small domain components.

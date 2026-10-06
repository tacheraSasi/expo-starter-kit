# Expo Starter Kit

Batteries-included Expo (SDK 56) starter with **no backend required** - a
built-in mock API simulates auth, OTP, uploads, and paginated
lists with realistic latency, persisting to on-device storage.

## Quick start

```sh
bun install
bun start -c
```

## Demo credentials

| Flow | What to enter |
|------|---------------|
| Sign in | Any email + any password |
| Verify / forgot / reset | Code is always `123456` |

## What's included

- **Auth shell** - login, register, verify, forgot/reset, split-context
  session provider, onboarding gate, dummy-user shortcut
- **Theming** - light/dark/system, semantic tokens, memoized `createStyles`,
  transition overlay, themed primitives
- **Data layer** - axios client with JWT single-flight refresh + HMAC headers,
  bounded persistent cache (memory + disk LRU), `useApiList/useApiItem/useApiAction`
- **i18n** - English bundled, Swahili lazy-loaded, typed keys, persisted choice
- **Push** - deferred permission prompt, token registration, badge sync,
  type-registry deep-link routing
- **OTA** - silent download, toast + haptic + reminder notification
- **Resilience** - error boundary, crash reports, global error handler,
  offline banner, empty/error/loading states, skeletons
- **UX** - haptics everywhere, native-styled alerts, toasts, biometric app
  lock, store-review prompts, unsaved-changes guard
- **Release** - EAS profiles, OTA pusher + version bumper (Go), store
  submission guides

## Docs

- [App Store Submission Guide](docs/APPSTORE_SUBMISSION_GUIDE.md)
- [Play Store Submission Guide](docs/PLAYSTORE_SUBMISSION_GUIDE.md)
- [Internationalization (i18n)](docs/I18N_IMPLEMENTATION.md)
- [Theming](docs/dynamic_theming.md)
- [Structure Guide](docs/REFACTOR_PLAN.md)

## Wiring a real backend

1. Set `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_API_VERSION` (see `.env.example`).
2. Implement the endpoints behind `lib/api/config.ts`.
3. Replace the mock bodies in `lib/api/index.ts`, keeping method names.

## Expo Go vs dev build

Everything works in Expo Go **except**: storage falls back to an in-memory
shim (MMKV needs native code) and remote push needs a dev build
(`expo-notifications` remote on Android requires it since SDK 53).

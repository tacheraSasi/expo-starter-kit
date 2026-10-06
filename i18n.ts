import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// English translations (default + fallback language) are bundled eagerly
// so the auth/onboarding flow renders with zero translation-loading delay.
import commonEn from './locales/en/common.json';
import authEn from './locales/en/auth.json';
import drawerEn from './locales/en/drawer.json';
import onboardingEn from './locales/en/onboarding.json';
import profileEn from './locales/en/profile.json';
import settingsEn from './locales/en/settings.json';
import validationEn from './locales/en/validation.json';
import errorsEn from './locales/en/errors.json';
import homeEn from './locales/en/home.json';
import helpEn from './locales/en/help.json';
import tabsEn from './locales/en/tabs.json';

// Second language is lazy-loaded on demand via dynamic import so a purely
// English install never parses those JSON files during startup. The
// type-only imports below keep translation-key typing without runtime cost.
import type commonSw from './locales/sw/common.json';
import type authSw from './locales/sw/auth.json';
import type drawerSw from './locales/sw/drawer.json';
import type onboardingSw from './locales/sw/onboarding.json';
import type profileSw from './locales/sw/profile.json';
import type settingsSw from './locales/sw/settings.json';
import type validationSw from './locales/sw/validation.json';
import type errorsSw from './locales/sw/errors.json';
import type homeSw from './locales/sw/home.json';
import type helpSw from './locales/sw/help.json';
import type tabsSw from './locales/sw/tabs.json';

export const defaultNS = 'common';

const en = {
  common: commonEn,
  auth: authEn,
  drawer: drawerEn,
  onboarding: onboardingEn,
  profile: profileEn,
  settings: settingsEn,
  validation: validationEn,
  errors: errorsEn,
  home: homeEn,
  help: helpEn,
  tabs: tabsEn,
};

/**
 * Exported for i18n.d.ts type augmentation.
 */
export const resources = {
  en,
  sw: null as unknown as {
    common: typeof commonSw;
    auth: typeof authSw;
    drawer: typeof drawerSw;
    onboarding: typeof onboardingSw;
    profile: typeof profileSw;
    settings: typeof settingsSw;
    validation: typeof validationSw;
    errors: typeof errorsSw;
    home: typeof homeSw;
    help: typeof helpSw;
    tabs: typeof tabsSw;
  },
} as const;

const namespaces = Object.keys(en) as Array<keyof typeof en>;

// Metro only supports dynamic imports with literal specifiers (template
// literals fail transform-time static analysis). Each loader is a literal
// import(), which Metro emits as a lazily-evaluated module.
const loaders = {
  common: () => import('./locales/sw/common.json'),
  auth: () => import('./locales/sw/auth.json'),
  drawer: () => import('./locales/sw/drawer.json'),
  onboarding: () => import('./locales/sw/onboarding.json'),
  profile: () => import('./locales/sw/profile.json'),
  settings: () => import('./locales/sw/settings.json'),
  validation: () => import('./locales/sw/validation.json'),
  errors: () => import('./locales/sw/errors.json'),
  home: () => import('./locales/sw/home.json'),
  help: () => import('./locales/sw/help.json'),
  tabs: () => import('./locales/sw/tabs.json'),
} satisfies Record<keyof typeof en, () => Promise<{ default: unknown }>>;

let loading: Promise<void> | null = null;

async function loadSecondLanguage(): Promise<void> {
  if (i18n.hasResourceBundle('sw', defaultNS)) return;
  if (loading) return loading;

  loading = (async () => {
    const entries = await Promise.all(
      namespaces.map(async (namespace) => {
        const mod = await loaders[namespace]();
        return [namespace, mod.default ?? mod] as const;
      }),
    );
    for (const [namespace, value] of entries) {
      i18n.addResourceBundle('sw', namespace, value, true, true);
    }
  })();

  return loading;
}

/**
 * Ensures the resources for `language` are loaded into i18next.
 * English is always bundled; the second language is fetched via dynamic
 * import on first need (device locale or user switching in settings).
 */
export async function ensureLanguageLoaded(language: string): Promise<void> {
  if (language === 'sw') {
    await loadSecondLanguage();
  }
}

/**
 * Resolves once the resources for the device's active language are
 * ready. The root gate waits for this before mounting screens so the
 * first paint never shows raw translation keys.
 */
export const i18nReady: Promise<void> = (async () => {
  const initialLanguage = Localization.getLocales()[0]?.languageCode || 'en';
  await ensureLanguageLoaded(initialLanguage);
})();

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3' as any,
    resources: { en },
    lng: Localization.getLocales()[0]?.languageCode || 'en',
    fallbackLng: 'en',
    defaultNS,
    partialBundledLanguages: true,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

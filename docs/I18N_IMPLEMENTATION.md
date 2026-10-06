# Internationalization (i18n) Implementation Summary

## Overview
This document summarizes the production-grade internationalization (i18n) system implemented for this starter kit.

## Architecture Decisions

### 1. **Technology Stack**
- **i18next** (v25.8.13): Core i18n framework
- **react-i18next** (v16.5.4): React bindings for i18next
- **expo-localization**: Device language detection

**Rationale**: i18next is the industry standard for React/React Native i18n with excellent TypeScript support and extensive features.

### 2. **Namespace Organization**
Translations are organized into semantic namespaces to improve maintainability and reduce bundle size:

```
/locales
  /en
    - common.json       (Shared UI elements, actions, statuses)
    - auth.json         (Authentication flow)
    - drawer.json       (Navigation drawer)
    - home.json         (Dashboard/home screen)
    - pos.json          (Point of Sale features)
    - profile.json      (User profile)
    - settings.json     (App settings)
    - onboarding.json   (Onboarding flow)
    - validation.json   (Form validation messages)
    - errors.json       (Error messages)
  /sw (Same structure, Swahili translations)
```

**Rationale**: Namespace separation allows lazy loading of translations and better organization of related keys.

### 3. **Language Support**
- **Primary Language**: English (en)
- **Secondary Language**: Swahili (sw)
- **Device Detection**: Automatically detects user's device language on first launch
- **Fallback**: English is used when a translation is missing

### 4. **State Management**
Language preference is managed using:
- **Zustand**: Lightweight state management
- **AsyncStorage**: Persistent storage across app restarts
- **Auto-hydration**: Language restored from storage before first render

**Rationale**: Zustand is already used in the app, maintaining consistency. AsyncStorage ensures language preference survives app restarts.

### 5. **Type Safety**
TypeScript module augmentation ensures type-safe translation keys:

```typescript
// i18n.d.ts
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: typeof resources['en'];
  }
}
```

**Rationale**: Prevents typos in translation keys and provides autocomplete in IDEs.

---

## Files Created/Updated

### Core Configuration
- **`/i18n.ts`**: Main i18n configuration and initialization
- **`/i18n.d.ts`**: TypeScript type definitions
- **`/stores/language.ts`**: Language state management with Zustand
- **`/stores/index.ts`**: Export language store

### Translation Files (20 files total)
- **English (10 files)**: `/locales/en/*.json`
- **Swahili (10 files)**: `/locales/sw/*.json`

### Updated Components/Screens (15+ files)
#### Infrastructure
- `app/_layout.tsx`: Import i18n at root level

#### Authentication Flow
- `app/(auth)/login.tsx`
- `app/(auth)/forgot.tsx`
- `app/(auth)/reset.tsx`
- `app/(auth)/verify.tsx`

#### Onboarding
- `app/(onboarding)/step1.tsx`

#### Main App
- `app/(core)/(drawer)/_layout.tsx`: Drawer menu translations
- `app/(core)/(drawer)/(tabs)/home.tsx`: Home screen
- `app/(core)/settings.tsx`: Settings with language switcher

#### Common Components
- `components/EmptyState.tsx`
- `components/ErrorState.tsx`
- `components/LoadingState.tsx`

---

## Usage Examples

### 1. Basic Translation
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <Text>{t('common:actions.save')}</Text>;
}
```

### 2. Interpolation
```tsx
// In component
<Text>{t('pos:cart.items', { count: 5 })}</Text>

// In translation file
{
  "cart": {
    "items": "{{count}} item",
    "items_plural": "{{count}} items"
  }
}
```

### 3. Multiple Namespaces
```tsx
// Specify namespace in key
t('auth:login.title')
t('settings:language.changed')

// Or pass namespace array
const { t } = useTranslation(['auth', 'common']);
t('login.title')      // From auth namespace
t('actions.save')     // From common namespace
```

### 4. Language Switching
```tsx
import { useLanguageStore } from '@/stores';

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageStore();
  
  return (
    <Button onPress={() => setLanguage(language === 'en' ? 'sw' : 'en')}>
      Switch to {language === 'en' ? 'Swahili' : 'English'}
    </Button>
  );
}
```

---

## Adding New Translations

### Step 1: Add Translation Keys
Update the relevant namespace files in both languages:

**`/locales/en/common.json`**
```json
{
  "newFeature": {
    "title": "New Feature",
    "description": "This is a new feature"
  }
}
```

**`/locales/sw/common.json`**
```json
{
  "newFeature": {
    "title": "Kipengele Kipya",
    "description": "Hiki ni kipengele kipya"
  }
}
```

### Step 2: Use in Component
```tsx
import { useTranslation } from 'react-i18next';

export default function NewFeature() {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('common:newFeature.title')}</Text>
      <Text>{t('common:newFeature.description')}</Text>
    </View>
  );
}
```

### Step 3: TypeScript Auto-Complete
TypeScript will automatically pick up the new keys thanks to module augmentation. No additional steps needed.

---

## Future Scaling Considerations

### 1. **Remote Translations (OTA Updates)**
For over-the-air translation updates without app releases:

```typescript
// Future implementation
import i18next from 'i18next';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .init({
    backend: {
      loadPath: 'https://api.akili.com/translations/{{lng}}/{{ns}}.json',
    },
    // ... other config
  });
```

### 2. **CMS Integration**
For non-technical translation management:
- Integrate with services like Lokalise, Phrase, or Crowdin
- Export translations to JSON
- Automated CI/CD pipeline to update translation files

### 3. **Additional Languages**
To add a new language (e.g., French):
1. Create `/locales/fr/` directory with all namespace files
2. Update `i18n.ts` to import French translations
3. Add `fr` to resources object
4. Update `Language` type in `stores/language.ts`

### 4. **Translation Workflow**
Recommended workflow for managing translations:
1. Developers add English keys during development
2. Export translation keys to CSV/JSON
3. Professional translators provide translations
4. Import translations back into JSON files
5. CI/CD validates JSON structure

### 5. **Performance Optimization**
For apps with many languages/translations:
- Use namespace splitting to lazy load translations
- Implement dynamic imports for large namespaces
- Cache translations in AsyncStorage

---

## Quality Assurance

### Tests Performed
✅ Code review: Addressed all feedback  
✅ Language switching: Verified live updates without restart  
✅ Persistence: Confirmed language persists across app restarts  
✅ Missing keys: Falls back to English gracefully  
✅ TypeScript: Type safety verified for translation keys  

### Known Limitations
- Some pre-existing TypeScript errors in the codebase (unrelated to i18n)
- CodeQL scan timed out (manual review showed no security concerns)
- Some screens not yet translated (can be done incrementally)

---

## Developer Guidelines

### Best Practices
1. **Use semantic keys**: `auth:login.title` not `auth:loginTitle`
2. **Keep keys stable**: Don't rename keys after translations are done
3. **Group related keys**: Use nested objects for related content
4. **Avoid concatenation**: Use interpolation instead
5. **Provide context**: Use descriptive key names

### Anti-Patterns to Avoid
❌ Don't concatenate translated strings  
❌ Don't use translation keys as user-facing text  
❌ Don't translate API payloads or business logic  
❌ Don't hardcode text after i18n is implemented  

### Code Review Checklist
- [ ] All user-facing strings use `t()` function
- [ ] Translation keys exist in all language files
- [ ] Keys are semantically named
- [ ] Interpolation used for dynamic content
- [ ] No hardcoded strings in UI components

---

## Support

For questions or issues with i18n:
1. Check this documentation
2. Review i18next documentation: https://www.i18next.com/
3. Check react-i18next docs: https://react.i18next.com/
4. Contact the development team

---

## Changelog

### Version 1.0.0 (Current)
- ✅ Initial i18n infrastructure setup
- ✅ English and Swahili translations
- ✅ Auth flow fully translated
- ✅ Home/Dashboard translated
- ✅ Settings with language switcher
- ✅ Common components translated
- ✅ Drawer navigation translated
- ✅ Language persistence with AsyncStorage

### Future Versions
- Remote translation loading
- Additional languages
- Professional translation integration
- Performance optimizations

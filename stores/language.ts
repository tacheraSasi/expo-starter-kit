import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import i18n, { ensureLanguageLoaded } from "../i18n";

export type Language = "en" | "sw";

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: async (language: Language) => {
        await ensureLanguageLoaded(language);
        await i18n.changeLanguage(language);
        set({ language });
      },
    }),
    {
      name: "template-language",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // When hydrated from storage, sync i18n with stored language
        if (state?.language) {
          void ensureLanguageLoaded(state.language).then(() => {
            i18n.changeLanguage(state.language);
          });
        }
      },
    }
  )
);

// Convenience hook
export const useCurrentLanguage = () => {
  const language = useLanguageStore((state) => state.language);
  return language;
};

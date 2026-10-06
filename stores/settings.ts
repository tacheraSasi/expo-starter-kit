import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SettingsState {
  // Theme
  themeMode: "light" | "dark" | "system";

  // Interaction
  hapticsEnabled: boolean;
  soundEffectsEnabled: boolean;

  // Security
  biometricLockEnabled: boolean;

  // Actions
  updateSetting: <T extends keyof Omit<SettingsState, "updateSetting" | "resetToDefaults">>(
    key: T,
    value: SettingsState[T]
  ) => void;
  resetToDefaults: () => void;
}

const defaultSettings: Omit<SettingsState, "updateSetting" | "resetToDefaults"> = {
  // Theme
  themeMode: "system",

  // Interaction
  hapticsEnabled: true,
  soundEffectsEnabled: true,

  // Security
  biometricLockEnabled: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateSetting: (key, value) => {
        set((state) => ({
          ...state,
          [key]: value,
        }));
      },

      resetToDefaults: () => {
        set(defaultSettings);
      },
    }),
    {
      name: "template-settings",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        const { updateSetting, resetToDefaults, ...settings } = state;
        return settings;
      },
    }
  )
);


export const useThemeSettings = () => {
  const themeMode = useSettingsStore((state) => state.themeMode);
  return { themeMode };
};
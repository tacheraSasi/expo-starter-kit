import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation, useRouter } from "expo-router";

import { appAlert } from "@/lib/ui/appAlert";

/**
 * Guards form-screen exits against silent data loss.
 *
 * Returns `handleBack` for header-back / cancel / close buttons: goes back
 * immediately when the form is pristine, otherwise prompts with a discard
 * confirmation. While dirty, the native swipe-back / formSheet
 * swipe-dismiss gesture is disabled so the guarded close path is the only
 * way out (prevents bypassing the prompt via gesture).
 */
export function useUnsavedChangesGuard(isDirty: boolean) {
  const router = useRouter();
  const navigation = useNavigation();
  const { t } = useTranslation();

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !isDirty });
  }, [navigation, isDirty]);

  const handleBack = useCallback(() => {
    if (!isDirty) {
      router.back();
      return;
    }
    appAlert.dialog(
      t("common:discardChanges.title"),
      t("common:discardChanges.message"),
      [
        { text: t("common:discardChanges.keepEditing"), style: "cancel" },
        {
          text: t("common:discardChanges.discard"),
          style: "destructive",
          onPress: () => router.back(),
        },
      ],
    );
  }, [isDirty, router, t]);

  return { handleBack };
}

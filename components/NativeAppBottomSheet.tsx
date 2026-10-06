import React, { forwardRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  Pressable,
  View,
  Keyboard,
  Platform,
  FlatList,
  type FlatListProps,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from "@expo/ui/community/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrentTheme } from "@/context/CentralTheme";
import { brandColor } from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";

/**
 * Props for the {@link NativeAppBottomSheet} component.
 */
export interface AppBottomSheetProps<T = unknown> {
  /** Title displayed in the sheet header. */
  title: string;
  /**
   * Content rendered inside the sheet body. Used when the sheet is in
   * `scrollable` (or default) mode. For long lists prefer the
   * `data` + `renderItem` API which uses a virtualized FlatList under
   * the hood so each item can scroll independently of the sheet.
   */
  children?: React.ReactNode;
  /** Custom snap points (e.g. `["50%", "75%"]`). When omitted, dynamic sizing is enabled. */
  snapPoints?: (string | number)[];
  /** Callback fired when the sheet is dismissed (pan-down or close button). */
  onClose?: () => void;
  /** Optional element rendered to the left of the close button in the header. */
  headerRight?: React.ReactNode;
  /** Whether the content area is scrollable. @default true */
  scrollable?: boolean;
  /**
   * When provided, the sheet renders a virtualized list instead of a plain
   * `ScrollView`. Use this for any sheet whose content is "a list of items"
   * - the items scroll inside the sheet even when expanded to full screen
   * and the sheet itself is at its largest snap point.
   */
  data?: readonly T[];
  renderItem?: FlatListProps<T>["renderItem"];
  keyExtractor?: FlatListProps<T>["keyExtractor"];
  ListHeaderComponent?: FlatListProps<T>["ListHeaderComponent"];
  ListEmptyComponent?: FlatListProps<T>["ListEmptyComponent"];
  ListFooterComponent?: FlatListProps<T>["ListFooterComponent"];
  contentContainerStyle?: FlatListProps<T>["contentContainerStyle"];
  onEndReached?: FlatListProps<T>["onEndReached"];
  onEndReachedThreshold?: FlatListProps<T>["onEndReachedThreshold"];
  refreshing?: FlatListProps<T>["refreshing"];
  onRefresh?: FlatListProps<T>["onRefresh"];
}

/**
 * A themed bottom sheet component wrapping `@expo/ui/community/bottom-sheet`.
 *
 * Supports dynamic sizing, custom snap points, scrollable content, and an
 * integrated header with title, optional actions, and a close button.
 *
 * @example
 * ```tsx
 * const sheetRef = useRef<BottomSheetRef>(null);
 *
 * // Form / static content - wrapped in a scrollable view by default.
 * <NativeAppBottomSheet ref={sheetRef} title="Edit Item" snapPoints={["50%"]}>
 *   <Text>Sheet content</Text>
 * </NativeAppBottomSheet>
 *
 * // Long list - uses a virtualized FlatList under the hood so the
 * // items stay scrollable even when the sheet is fully expanded.
 * <NativeAppBottomSheet
 *   ref={sheetRef}
 *   title="Select Item"
 *   data={items}
 *   keyExtractor={(item) => item.uuid}
 *   renderItem={({ item }) => (
 *     <Pressable onPress={() => sheetRef.current?.close()}>
 *       <Text>{item.name}</Text>
 *     </Pressable>
 *   )}
 * />
 *
 * // Open:
 * sheetRef.current?.present();
 * // Close:
 * sheetRef.current?.dismiss();
 * ```
 */
const NativeAppBottomSheet = forwardRef<BottomSheetModal, AppBottomSheetProps>(
  function NativeAppBottomSheetInner(
    {
      title,
      children,
      snapPoints: customSnap,
      onClose,
      headerRight,
      scrollable = true,
      data,
      renderItem,
      keyExtractor,
      ListHeaderComponent,
      ListEmptyComponent,
      ListFooterComponent,
      contentContainerStyle: listContentContainerStyle,
      onEndReached,
      onEndReachedThreshold,
      refreshing,
      onRefresh,
    },
    ref,
  ) {
    const theme = useCurrentTheme();
    const insets = useSafeAreaInsets();

    const handleClose = useCallback(() => {
      Keyboard.dismiss();
      onClose?.();
    }, [onClose]);

    const bgColor = theme.sheetBackground;

    const isDynamic = !customSnap;

    const bottomPadding = Math.max(60, insets.bottom + 32);

    const useList = Array.isArray(data);

    const renderBody = () => {
      if (useList) {
        return (
          <FlatList
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data={data as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            renderItem={renderItem as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            keyExtractor={keyExtractor as any}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={ListEmptyComponent}
            ListFooterComponent={ListFooterComponent}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: bottomPadding, flexGrow: 1 },
              listContentContainerStyle as any,
            ]}
            onEndReached={onEndReached}
            onEndReachedThreshold={onEndReachedThreshold}
            refreshing={refreshing}
            onRefresh={onRefresh}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
            nestedScrollEnabled
            style={{ flex: 1 }}
          />
        );
      }

      if (scrollable) {
        return (
          <BottomSheetScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[
              styles.content,
              // flexGrow: 1 lets the ScrollView keep scrolling when its
              // content height matches the available height exactly
              // (e.g. when the user expands to the largest snap point and
              // the rendered children fit but should still be scrollable).
              { paddingBottom: bottomPadding, flexGrow: 1 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
            nestedScrollEnabled
          >
            {children}
          </BottomSheetScrollView>
        );
      }

      return (
        <BottomSheetView
          style={[styles.content, { paddingBottom: bottomPadding }]}
        >
          {children}
        </BottomSheetView>
      );
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={customSnap}
        enablePanDownToClose
        enableDynamicSizing={isDynamic}
        onClose={handleClose}
        backgroundStyle={{ backgroundColor: bgColor }}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            <View style={styles.headerActions}>
              {headerRight}
              <Pressable
                onPress={() =>
                  (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss()
                }
                style={({ pressed }) => [
                  styles.closeBtn,
                  {
                    backgroundColor: theme.isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.05)",
                    opacity: pressed ? 0.6 : 1,
                  },
                ]}
              >
                <Feather name="x" size={18} color={theme.textMuted} />
              </Pressable>
            </View>
          </View>
          {renderBody()}
        </View>
      </BottomSheetModal>
    );
  },
);

NativeAppBottomSheet.displayName = "AppBottomSheet";
export default NativeAppBottomSheet;
/** Re-exported text input that works inside a bottom sheet (handles keyboard avoidance). */
export { BottomSheetTextInput };
/** Ref type for controlling the bottom sheet imperatively (`present()`, `dismiss()`, etc.). */
export type { BottomSheetModal as BottomSheetRef };

/* ─── Shared form components ─── */

/** Props for the {@link SheetInput} form component. */
interface SheetInputProps {
  /** Label displayed above the input field. */
  label: string;
  /** Current input value. */
  value: string;
  /** Callback when the input text changes. */
  onChangeText: (t: string) => void;
  /** Placeholder text shown when the input is empty. */
  placeholder?: string;
  /** Keyboard type for the input. @default "default" */
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  /** Auto-capitalisation behaviour. @default "sentences" */
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

/**
 * A themed text input designed for use inside {@link NativeAppBottomSheet}.
 * Uses `BottomSheetTextInput` internally so keyboard avoidance works correctly.
 */
export function SheetInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
}: SheetInputProps) {
  const theme = useCurrentTheme();
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
        {label}
      </Text>
      <BottomSheetTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.03)",
            borderColor: theme.border,
          },
        ]}
      />
    </View>
  );
}

/** Props for the {@link SheetPicker} form component. */
interface SheetPickerProps {
  /** Label displayed above the picker chips. */
  label: string;
  /** Available options rendered as selectable chips. */
  options: { label: string; value: string }[];
  /** Currently selected option value. */
  selected: string;
  /** Callback when an option chip is pressed. */
  onSelect: (v: string) => void;
}

/**
 * A horizontal chip-style single-select picker for use inside {@link NativeAppBottomSheet}.
 * The selected chip is highlighted with the brand colour.
 */
export function SheetPicker({
  label,
  options,
  selected,
  onSelect,
}: SheetPickerProps) {
  const theme = useCurrentTheme();
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
        {label}
      </Text>
      <View style={styles.pickerRow}>
        {options.map((o) => (
          <Pressable
            key={o.value}
            onPress={() => onSelect(o.value)}
            style={[
              styles.pickerChip,
              {
                backgroundColor:
                  selected === o.value
                    ? brandColor
                    : theme.isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)",
              },
            ]}
          >
            <Text
              style={[
                styles.pickerChipText,
                { color: selected === o.value ? "#fff" : theme.text },
              ]}
            >
              {o.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** Props for the {@link SheetButton} form component. */
interface SheetButtonProps {
  /** Button label text. Replaced with "Saving…" when `loading` is true (primary variant). */
  label: string;
  /** Callback when the button is pressed. */
  onPress: () => void;
  /** Disables the button and shows a loading label. @default false */
  loading?: boolean;
  /** Visual style - `"primary"` uses brand fill, `"outline"` uses a bordered look. @default "primary" */
  variant?: "primary" | "outline";
}

/**
 * A themed action button for use inside {@link NativeAppBottomSheet}.
 * Supports primary (filled) and outline variants.
 */
export function SheetButton({
  label,
  onPress,
  loading,
  variant = "primary",
}: SheetButtonProps) {
  const theme = useCurrentTheme();
  const isPrimary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.sheetBtn,
        {
          backgroundColor: isPrimary ? brandColor : "transparent",
          borderWidth: isPrimary ? 0 : 1.5,
          borderColor: isPrimary ? undefined : theme.border,
          opacity: pressed ? 0.8 : loading ? 0.5 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.sheetBtnText,
          { color: isPrimary ? "#fff" : theme.text },
        ]}
      >
        {loading ? "Saving…" : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  fieldWrap: { gap: 6 },
  fieldLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  input: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pickerChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  pickerChipText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  sheetBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  sheetBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});

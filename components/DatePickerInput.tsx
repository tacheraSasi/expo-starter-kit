import { useCurrentTheme, createStyles } from "@/context/CentralTheme";
import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface DatePickerInputProps {
  label?: string;
  value: string; // "YYYY-MM-DD"
  onChange: (dateStr: string) => void;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  const month = d.toLocaleDateString("en-US", { month: "long" });
  return `${month} ${getOrdinal(d.getDate())}, ${d.getFullYear()}`;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface CalendarDay {
  date: Date;
  dayNum: number;
  isCurrentMonth: boolean;
  dateStr: string;
}

function getCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay();
  const days: CalendarDay[] = [];

  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({
      date: d,
      dayNum: d.getDate(),
      isCurrentMonth: false,
      dateStr: toDateStr(d),
    });
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    days.push({
      date: d,
      dayNum: i,
      isCurrentMonth: true,
      dateStr: toDateStr(d),
    });
  }

  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        dayNum: d.getDate(),
        isCurrentMonth: false,
        dateStr: toDateStr(d),
      });
    }
  }

  return days;
}

const useStyles = createStyles((theme) => ({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.textSecondary,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 14,
    backgroundColor: theme.isDark
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.03)",
  },
  triggerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: theme.text,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 16,
    backgroundColor: theme.card,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.isDark
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.04)",
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
  },
  weekRow: {
    flexDirection: "row",
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.textSecondary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "400",
    color: theme.text,
  },
  outsideText: {
    color: theme.textSecondary,
    opacity: 0.4,
  },
  disabledText: {
    color: theme.textSecondary,
    opacity: 0.25,
  },
  todayCell: {
    borderWidth: 1,
    borderColor: theme.border,
  },
  todayText: {
    fontWeight: "600",
  },
  selectedCell: {
    backgroundColor: theme.text,
  },
  selectedText: {
    color: theme.background,
    fontWeight: "600",
  },
}));

export default function DatePickerInput({
  label,
  value,
  onChange,
  placeholder = "Select date",
  maximumDate,
  minimumDate,
}: DatePickerInputProps) {
  const theme = useCurrentTheme();
  const styles = useStyles();
  const [open, setOpen] = useState(false);

  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const today = new Date();

  const initial = selectedDate ?? today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const calendarDays = useMemo(
    () => getCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" },
  );

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isDisabled = (d: Date): boolean => {
    if (maximumDate && d > maximumDate) return true;
    if (minimumDate && d < minimumDate) return true;
    return false;
  };

  const handleSelectDay = (day: CalendarDay) => {
    if (isDisabled(day.date)) return;
    onChange(day.dateStr);
    setOpen(false);
  };

  const handleOpen = () => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
    setOpen(true);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Trigger */}
      <Pressable
        style={({ pressed }) => [styles.trigger, { opacity: pressed ? 0.7 : 1 }]}
        onPress={handleOpen}
      >
        <Feather name="calendar" size={16} color={theme.textSecondary} />
        <Text
          style={[
            styles.triggerText,
            !value && { color: theme.textSecondary },
          ]}
        >
          {value ? formatDisplay(value) : placeholder}
        </Text>
        <Feather name="chevron-down" size={14} color={theme.textSecondary} />
      </Pressable>

      {/* Modal dialog with calendar */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dialog}>
                {/* Month nav */}
                <View style={styles.monthNav}>
                  <Pressable
                    onPress={goToPrevMonth}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.navBtn,
                      { opacity: pressed ? 0.5 : 1 },
                    ]}
                  >
                    <Feather
                      name="chevron-left"
                      size={18}
                      color={theme.text}
                    />
                  </Pressable>
                  <Text style={styles.monthLabel}>{monthLabel}</Text>
                  <Pressable
                    onPress={goToNextMonth}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.navBtn,
                      { opacity: pressed ? 0.5 : 1 },
                    ]}
                  >
                    <Feather
                      name="chevron-right"
                      size={18}
                      color={theme.text}
                    />
                  </Pressable>
                </View>

                {/* Weekday headers */}
                <View style={styles.weekRow}>
                  {DAYS.map((d) => (
                    <View key={d} style={styles.dayCell}>
                      <Text style={styles.weekDayText}>{d}</Text>
                    </View>
                  ))}
                </View>

                {/* Day grid */}
                {Array.from(
                  { length: Math.ceil(calendarDays.length / 7) },
                  (_, rowIdx) => (
                    <View key={rowIdx} style={styles.weekRow}>
                      {calendarDays
                        .slice(rowIdx * 7, rowIdx * 7 + 7)
                        .map((day) => {
                          const isSelected =
                            selectedDate && isSameDay(day.date, selectedDate);
                          const isToday = isSameDay(day.date, today);
                          const disabled = isDisabled(day.date);
                          return (
                            <Pressable
                              key={day.dateStr}
                              style={[
                                styles.dayCell,
                                isToday && !isSelected && styles.todayCell,
                                isSelected && styles.selectedCell,
                              ]}
                              onPress={() => handleSelectDay(day)}
                              disabled={disabled}
                            >
                              <Text
                                style={[
                                  styles.dayText,
                                  !day.isCurrentMonth && styles.outsideText,
                                  disabled && styles.disabledText,
                                  isToday && !isSelected && styles.todayText,
                                  isSelected && styles.selectedText,
                                ]}
                              >
                                {day.dayNum}
                              </Text>
                            </Pressable>
                          );
                        })}
                    </View>
                  ),
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

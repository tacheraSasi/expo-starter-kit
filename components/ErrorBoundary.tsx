import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet, Text, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Updates from "expo-updates";
import HapticTouchableOpacity from "./HapticTouchableOpacity";
import logger from "@/lib/logger";
import { sendCrashReport, wasReportSent } from "@/lib/crashReporter";
import { StatusBar } from "expo-status-bar";

type ReportState = "sending" | "sent" | "failed" | "idle";

export function ErrorBoundary({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  const { t } = useTranslation();
  const [reportState, setReportState] = useState<ReportState>(() =>
    wasReportSent() ? "sent" : "idle",
  );
  const [userNotes, setUserNotes] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);

  // Auto-send the (technical) report silently in the background on mount.
  useEffect(() => {
    if (wasReportSent()) return;
    void runReport(false);
  }, []);

  async function runReport(includeNotes: boolean) {
    setReportState("sending");
    const result = await sendCrashReport(error, {
      userDescription: includeNotes && userNotes.trim() ? userNotes.trim() : undefined,
    });
    setReportState(result.ok ? "sent" : "failed");
  }

  async function reloadApp() {
    try {
      await Updates.reloadAsync();
    } catch (e) {
      logger.warn("Updates.reloadAsync failed, falling back to retry():", e);
      retry();
    }
  }

  const statusLabel = {
    sending: t("common:errorBoundary.statusSending"),
    sent: t("common:errorBoundary.statusSent"),
    failed: t("common:errorBoundary.statusFailed"),
    idle: null,
  }[reportState];

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark"/>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <View style={s.iconWrap}>
            <Text style={s.icon}>😌</Text>
          </View>
          <Text style={s.title}>{t("common:errorBoundary.title")}</Text>
          <Text style={s.subtitle}>{t("common:errorBoundary.subtitle")}</Text>
        </View>

        {/* Gentle status pill (only when not idle) */}
        {statusLabel && (
          <View style={[
            s.statusPill,
            reportState === "sending" && s.statusSendingPill,
            reportState === "sent" && s.statusSentPill,
            reportState === "failed" && s.statusFailedPill,
          ]}>
            <Text style={[
              s.statusPillText,
              reportState === "sending" && s.statusSendingText,
              reportState === "sent" && s.statusSentText,
              reportState === "failed" && s.statusFailedText,
            ]}>
              {statusLabel}
            </Text>
          </View>
        )}

        {/* Optional: "What were you doing?" - gentle expand/collapse */}
        {!notesOpen ? (
          <HapticTouchableOpacity
            style={s.addNotesLink}
            onPress={() => setNotesOpen(true)}
            activeOpacity={0.7}
            hapticType="light"
          >
            <Text style={s.addNotesLinkText}>
              {t("common:errorBoundary.addNotesLink")}
            </Text>
          </HapticTouchableOpacity>
        ) : (
          <View style={s.notesCard}>
            <Text style={s.notesLabel}>{t("common:errorBoundary.notesLabel")}</Text>
            <TextInput
              style={s.notesInput}
              multiline
              placeholder={t("common:errorBoundary.notesPlaceholder")}
              placeholderTextColor="#9ca3af"
              value={userNotes}
              onChangeText={setUserNotes}
              textAlignVertical="top"
              autoFocus
            />
            {reportState === "failed" ? (
              <PrimaryButton
                label={t("common:errorBoundary.resendWithNotes")}
                onPress={() => runReport(true)}
              />
            ) : (
              <SecondaryButton
                label={t("common:errorBoundary.sendWithNotes")}
                onPress={() => runReport(true)}
                disabled={reportState === "sending"}
              />
            )}
          </View>
        )}

        {/* Two simple actions */}
        <View style={s.actions}>
          <PrimaryButton label={t("common:errorBoundary.retry")} onPress={retry} />
          <SecondaryButton
            label={t("common:errorBoundary.reloadApp")}
            onPress={reloadApp}
          />
        </View>

        <Text style={s.footer}>{t("common:errorBoundary.footer")}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* --------- buttons (unchanged structurally, only styles updated) --------- */

function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <HapticTouchableOpacity
      style={[s.button, s.primaryButton, disabled && s.buttonDisabled]}
      onPress={onPress}
      activeOpacity={0.85}
      hapticType="medium"
      disabled={disabled}
    >
      <Text style={s.primaryButtonText}>{label}</Text>
    </HapticTouchableOpacity>
  );
}

function SecondaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <HapticTouchableOpacity
      style={[s.button, s.secondaryButton, disabled && s.buttonDisabled]}
      onPress={onPress}
      activeOpacity={0.85}
      hapticType="light"
      disabled={disabled}
    >
      <Text style={s.secondaryButtonText}>{label}</Text>
    </HapticTouchableOpacity>
  );
}

/* ---------- calm & intuitive styles ---------- */

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",          // soft, airy background
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 28,
    paddingBottom: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#eef2f7",          // subtle cool grey
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  icon: {
    fontSize: 42,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: "90%",
  },
  // Soft pill for status messages
  statusPill: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginBottom: 20,
  },
  statusPillText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  statusSendingPill: {
    backgroundColor: "#e0eaf8",
  },
  statusSendingText: {
    color: "#3b6cb4",
  },
  statusSentPill: {
    backgroundColor: "#e4f0e4",
  },
  statusSentText: {
    color: "#3b7a4b",
  },
  statusFailedPill: {
    backgroundColor: "#fde8e8",
  },
  statusFailedText: {
    color: "#b45454",
  },
  addNotesLink: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addNotesLinkText: {
    fontSize: 14,
    color: "#5b7f95",                   // calming teal-blue
    fontWeight: "500",
  },
  notesCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#e9edf2",
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  notesInput: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    fontSize: 14,
    color: "#1e293b",
    backgroundColor: "#f8fafc",
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  button: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#4b8b6b",         // soft sage green
    shadowColor: "#4b8b6b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d9e0e6",
  },
  secondaryButtonText: {
    color: "#1e293b",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  footer: {
    marginTop: 28,
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
  },
});
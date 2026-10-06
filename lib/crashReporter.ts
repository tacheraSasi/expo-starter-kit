import { Platform } from "react-native";
import * as Application from "expo-application";
import * as Device from "expo-device";
import * as Updates from "expo-updates";
import Constants from "expo-constants";
import { APP_VERSION } from "@/constants/version";
import { currentUser } from "./api/authToken";
import logger from "./logger";

let _reportSent = false;

export function markReportSent() {
  _reportSent = true;
}

export function wasReportSent() {
  return _reportSent;
}

export function resetReportSent() {
  _reportSent = false;
}

export interface CrashReport {
  error: {
    name: string;
    message: string;
    stack?: string;
    cause?: unknown;
  };
  app: {
    version: string | null;
    nativeBuildVersion: string | null;
    nativeAppVersion: string | null;
    buildNumber: string | null;
    runtimeVersion: string | null;
    environment: string;
    isDebug: boolean;
    isDev: boolean;
  };
  updates: {
    channel: string | null;
    updateId: string | null;
    createdAt: string | null;
    isEmbeddedLaunch: boolean | null;
  };
  device: {
    modelName: string | null;
    osName: string | null;
    osVersion: string | null;
    osBuildId: string | null;
    osInternalBuildId: string | null;
    platformApiLevel: number | null;
    deviceName: string | null;
    deviceType: string | null;
    isDevice: boolean | null;
    manufacturer: string | null;
    brand: string | null;
  };
  user: {
    id?: string;
    email?: string;
    role?: string | null;
  } | null;
  platform: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

/**
 * Build a structured crash report object from an error.
 * Never throws — diagnostics are best-effort.
 */
export async function buildCrashReport(
  error: Error,
  extras: Record<string, unknown> = {},
): Promise<CrashReport> {
  let user: CrashReport["user"] = null;
  try {
    const u = await currentUser();
    if (u) {
      user = {
        id: u.id,
        email: u.email,
        role: u.role,
      };
    }
  } catch {
    /* ignore */
  }

  return {
    error: {
      name: error?.name ?? "Error",
      message: error?.message ?? String(error),
      stack: error?.stack,
      cause: (error as any)?.cause ?? undefined,
    },
    app: {
      version: APP_VERSION ?? Application.nativeApplicationVersion ?? null,
      nativeBuildVersion: Application.nativeBuildVersion ?? null,
      nativeAppVersion: Application.nativeApplicationVersion ?? null,
      buildNumber: Application.nativeBuildVersion ?? null,
      runtimeVersion: Updates.runtimeVersion ?? null,
      environment: Updates.channel ?? "default",
      isDebug: __DEV__,
      isDev: __DEV__,
    },
    updates: {
      channel: Updates.channel ?? null,
      updateId: Updates.updateId ?? null,
      createdAt: Updates.createdAt
        ? new Date(Updates.createdAt).toISOString()
        : null,
      isEmbeddedLaunch: Updates.isEmbeddedLaunch ?? null,
    },
    device: {
      modelName: Device.modelName ?? null,
      osName: Device.osName ?? Platform.OS,
      osVersion: Device.osVersion ?? Platform.Version?.toString?.() ?? null,
      osBuildId: Device.osBuildId ?? null,
      osInternalBuildId: Device.osInternalBuildId ?? null,
      platformApiLevel: Device.platformApiLevel ?? null,
      deviceName: Device.deviceName ?? null,
      deviceType: Device.deviceType != null ? String(Device.deviceType) : null,
      isDevice: Device.isDevice ?? null,
      manufacturer: Device.manufacturer ?? null,
      brand: Device.brand ?? null,
    },
    user,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
    metadata: {
      ...extras,
      constants: {
        sessionId: Constants.sessionId ?? null,
        expoConfigName: Constants.expoConfig?.name ?? null,
        expoConfigSlug: Constants.expoConfig?.slug ?? null,
        exehookNames: Constants.expoConfig?.extra ?? null,
      },
    },
  };
}

/**
 * Serialize a crash report into a single string (markdown-ish) suitable for
 * copying to the clipboard, sending in chat, or pasting into a ticket.
 */
export function formatCrashReport(report: CrashReport): string {
  const lines: string[] = [];
  lines.push("# Crash Report");
  lines.push("");
  lines.push(`Timestamp: ${report.timestamp}`);
  lines.push(`Platform: ${report.platform}`);
  lines.push("");
  lines.push("## Error");
  lines.push(`Name: ${report.error.name}`);
  lines.push(`Message: ${report.error.message}`);
  if (report.error.stack) {
    lines.push("");
    lines.push("### Stack");
    lines.push("```");
    lines.push(report.error.stack);
    lines.push("```");
  }
  if (report.error.cause) {
    lines.push("");
    lines.push("### Cause");
    lines.push("```");
    lines.push(JSON.stringify(report.error.cause, null, 2));
    lines.push("```");
  }
  lines.push("");
  lines.push("## App");
  lines.push(`Version: ${report.app.version}`);
  lines.push(`Native Build: ${report.app.nativeBuildVersion}`);
  lines.push(`Runtime Version: ${report.app.runtimeVersion}`);
  lines.push(`Channel: ${report.app.environment}`);
  lines.push(`__DEV__: ${report.app.isDev}`);
  lines.push("");
  lines.push("## Update");
  lines.push(`Update ID: ${report.updates.updateId ?? "—"}`);
  lines.push(`Created: ${report.updates.createdAt ?? "—"}`);
  lines.push(`Embedded: ${report.updates.isEmbeddedLaunch ?? "—"}`);
  lines.push("");
  lines.push("## Device");
  lines.push(`Model: ${report.device.modelName ?? "—"}`);
  lines.push(`OS: ${report.device.osName} ${report.device.osVersion ?? ""}`.trim());
  lines.push(`Build: ${report.device.osBuildId ?? "—"}`);
  lines.push(`Manufacturer: ${report.device.manufacturer ?? "—"}`);
  lines.push(`Brand: ${report.device.brand ?? "—"}`);
  lines.push(`Real Device: ${report.device.isDevice ?? "—"}`);
  if (report.device.platformApiLevel) {
    lines.push(`API Level: ${report.device.platformApiLevel}`);
  }
  lines.push("");
  if (report.user) {
    lines.push("## User");
    lines.push(`ID: ${report.user.id ?? "—"}`);
    lines.push(`Email: ${report.user.email ?? "—"}`);
    lines.push(`Role: ${report.user.role ?? "—"}`);
    lines.push("");
  }
  if (Object.keys(report.metadata ?? {}).length > 0) {
    lines.push("## Metadata");
    lines.push("```json");
    lines.push(JSON.stringify(report.metadata, null, 2));
    lines.push("```");
  }
  return lines.join("\n");
}

export type SendCrashResult =
  | { ok: true; report: CrashReport }
  | { ok: false; report: CrashReport; error: unknown };

/**
 * Submits a structured crash report.
 * By default logs locally; wire to your backend by passing a sender
 * or implementing Api.submitFeedback in lib/api.
 * Returns the report (and any network error) so the UI can show details.
 */
export async function sendCrashReport(
  error: Error,
  opts: {
    userDescription?: string;
    extras?: Record<string, unknown>;
    sender?: (report: CrashReport, message: string) => Promise<void>;
  } = {},
): Promise<SendCrashResult> {
  if (_reportSent && !opts.userDescription) {
    // Already reported silently; skip duplicate auto-report.
    return { ok: true, report: await buildCrashReport(error) };
  }

  const report = await buildCrashReport(error, opts.extras);

  try {
    const messageParts = [
      `[Auto-reported crash] ${error.name}: ${error.message}`,
      opts.userDescription ? `\nUser notes:\n${opts.userDescription}` : "",
    ];

    if (opts.sender) {
      await opts.sender(report, messageParts.join(""));
    } else {
      // No backend wired: log locally in dev, no-op in production.
      logger.error(formatCrashReport(report));
    }
    _reportSent = true;
    return { ok: true, report };
  } catch (e) {
    logger.error("Failed to send crash report:", e);
    return { ok: false, report, error: e };
  }
}
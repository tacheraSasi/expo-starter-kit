import { useEffect } from "react";
import { Platform } from "react-native";
import { sendCrashReport } from "@/lib/crashReporter";

export function useGlobalErrorHandler() {
  useEffect(() => {
    if (Platform.OS === "web") return;

    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      sendCrashReport(error);
      originalHandler(error, isFatal);
    });

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));
      sendCrashReport(error);
    };

    if (typeof window !== "undefined" && "addEventListener" in window) {
      window.addEventListener("unhandledrejection", rejectionHandler);
    }

    return () => {
      ErrorUtils.setGlobalHandler(originalHandler);
      if (typeof window !== "undefined" && "removeEventListener" in window) {
        window.removeEventListener("unhandledrejection", rejectionHandler);
      }
    };
  }, []);
}

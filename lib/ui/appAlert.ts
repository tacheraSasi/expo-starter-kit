import { Alert as RNAlert, Platform } from "react-native";

export type AppAlertButtonStyle = "default" | "cancel" | "destructive";

export interface AppAlertButton {
  text: string;
  style?: AppAlertButtonStyle;
  onPress?: () => void;
}

export interface AppAlertRequest {
  title: string;
  message?: string;
  buttons?: AppAlertButton[];
}

type AppAlertPresenter = (request: AppAlertRequest) => void;

let presenter: AppAlertPresenter | null = null;

export function setAppAlertPresenter(next: AppAlertPresenter | null) {
  presenter = next;
}

function fallbackDialog({ title, message, buttons }: AppAlertRequest) {
  if (Platform.OS === "web") {
    if (!buttons || buttons.length === 0) {
      window.alert(message ? `${title}\n\n${message}` : title);
      return;
    }

    const cancelBtn = buttons.find((b) => b.style === "cancel");
    const primaryBtn = buttons.find((b) => b.style !== "cancel") ?? buttons[0];

    if (cancelBtn && primaryBtn) {
      const accepted = window.confirm(message ? `${title}\n\n${message}` : title);
      if (accepted) {
        primaryBtn.onPress?.();
      } else {
        cancelBtn.onPress?.();
      }
      return;
    }

    primaryBtn.onPress?.();
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }

  RNAlert.alert(title, message, buttons as any);
}

export const appAlert = {
  dialog(title: string, message?: string, buttons?: AppAlertButton[]) {
    const request: AppAlertRequest = { title, message, buttons };
    if (presenter) {
      presenter(request);
      return;
    }
    fallbackDialog(request);
  },
};

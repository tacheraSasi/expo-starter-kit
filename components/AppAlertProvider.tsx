import {
  appAlert,
  AppAlertButton,
  AppAlertRequest,
  setAppAlertPresenter,
} from "@/lib/ui/appAlert";
import React, { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import {
  Alert as SwiftUIAlert,
  Button as SwiftUIButton,
  Host as SwiftHost,
  Text as SwiftText,
} from "@expo/ui/swift-ui";
import { frame as swiftUIFrame } from "@expo/ui/swift-ui/modifiers";
import {
  AlertDialog,
  Host as ComposeHost,
  Text as ComposeText,
  TextButton,
} from "@expo/ui/jetpack-compose";

interface AppAlertProviderProps {
  children: React.ReactNode;
}

function normalizeButtons(buttons?: AppAlertButton[]): AppAlertButton[] {
  if (!buttons || buttons.length === 0) {
    return [{ text: "OK" }];
  }
  return buttons;
}

export default function AppAlertProvider({ children }: AppAlertProviderProps) {
  const [request, setRequest] = useState<AppAlertRequest | null>(null);
  const [isPresented, setIsPresented] = useState(false);

  useEffect(() => {
    if (
      Platform.OS !== "ios" &&
      Platform.OS !== "android"
    ) {
      setAppAlertPresenter(null);
      return;
    }

    setAppAlertPresenter((next) => {
      setRequest(next);
      setIsPresented(true);
    });
    return () => {
      setAppAlertPresenter(null);
    };
  }, []);

  const close = () => setIsPresented(false);

  useEffect(() => {
    if (!isPresented) {
      setRequest(null);
    }
  }, [isPresented]);

  const buttons = useMemo(() => normalizeButtons(request?.buttons), [request]);

  const handleButtonPress = (button?: AppAlertButton) => {
    close();
    button?.onPress?.();
  };

  const cancelButton = buttons.find((b) => b.style === "cancel");
  const primaryButton = buttons.find((b) => b.style !== "cancel") ?? buttons[0];

  return (
    <>
      {children}

      {Platform.OS === "ios" ? (
        <SwiftHost matchContents>
          <SwiftUIAlert
            title={request?.title ?? ""}
            isPresented={isPresented}
            onIsPresentedChange={setIsPresented}
          >
            <SwiftUIAlert.Trigger>
              <SwiftUIButton
                modifiers={[swiftUIFrame({ width: 0, height: 0 })]}
              />
            </SwiftUIAlert.Trigger>
            <SwiftUIAlert.Actions>
              {buttons.map((button, index) => (
                <SwiftUIButton
                  key={`${button.text}-${index}`}
                  label={button.text}
                  role={
                    button.style === "cancel"
                      ? "cancel"
                      : button.style === "destructive"
                        ? "destructive"
                        : undefined
                  }
                  onPress={() => handleButtonPress(button)}
                />
              ))}
            </SwiftUIAlert.Actions>
            {request?.message ? (
              <SwiftUIAlert.Message>
                <SwiftText>{request.message}</SwiftText>
              </SwiftUIAlert.Message>
            ) : null}
          </SwiftUIAlert>
        </SwiftHost>
      ) : null}

      {Platform.OS === "android" && isPresented && request ? (
        <ComposeHost matchContents>
          <AlertDialog onDismissRequest={close}>
            <AlertDialog.Title>
              <ComposeText>{request.title}</ComposeText>
            </AlertDialog.Title>
            {request.message ? (
              <AlertDialog.Text>
                <ComposeText>{request.message}</ComposeText>
              </AlertDialog.Text>
            ) : null}

            {primaryButton ? (
              <AlertDialog.ConfirmButton>
                <TextButton onClick={() => handleButtonPress(primaryButton)}>
                  <ComposeText>{primaryButton.text}</ComposeText>
                </TextButton>
              </AlertDialog.ConfirmButton>
            ) : null}

            {cancelButton ? (
              <AlertDialog.DismissButton>
                <TextButton onClick={() => handleButtonPress(cancelButton)}>
                  <ComposeText>{cancelButton.text}</ComposeText>
                </TextButton>
              </AlertDialog.DismissButton>
            ) : null}
          </AlertDialog>
        </ComposeHost>
      ) : null}
    </>
  );
}

export { appAlert };

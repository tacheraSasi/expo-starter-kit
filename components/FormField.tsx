import { createStyles } from "@/context/CentralTheme";
import React, { forwardRef } from "react";
import {
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

export interface FormFieldProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
  helper?: string;
  multiline?: boolean;
}

/**
 * Shared form field with label, TextInput and an error or helper slot.
 * Ref is forwarded so screens can chain keyboard focus with
 * returnKeyType="next" and focus the next field on submit.
 * Error styling uses theme tokens only.
 */
const FormField = forwardRef<TextInput, FormFieldProps>(function FormField(
  { label, required, error, helper, style, multiline, ...inputProps },
  ref,
) {
  const st = useStyles();
  const message = error || helper;

  return (
    <View>
      <Text style={st.label}>
        {label}
        {required ? <Text style={st.required}> *</Text> : null}
      </Text>
      <TextInput
        ref={ref}
        style={[
          st.input,
          multiline && st.multiline,
          !!error && st.inputError,
          style as object,
        ]}
        multiline={multiline}
        placeholderTextColor={st._placeholder as string}
        {...inputProps}
      />
      {!!message && (
        <Text style={[st.message, !!error && st.messageError]}>{message}</Text>
      )}
    </View>
  );
});

export default FormField;

const useStyles = createStyles((theme) => ({
  label: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: theme.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },
  required: {
    color: theme.error,
  },
  input: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.textPrimary,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: theme.error,
  },
  message: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 6,
  },
  messageError: {
    color: theme.error,
  },
  _placeholder: theme.textMuted,
}));

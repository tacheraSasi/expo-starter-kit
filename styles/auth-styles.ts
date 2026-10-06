/**
 * Shared themed styles for all auth screens (login, forgot, reset, verify).
 *
 * Each screen calls `useAuthStyles()` and gets a memoized, theme-aware StyleSheet.
 */

import { createStyles } from "@/context/CentralTheme";

export const useAuthStyles = createStyles((theme) => ({
  // Extra tokens for JSX props (consumed inline, not valid RN styles)
  _primary: theme.primary as any,
  _inputPlaceholder: theme.inputPlaceholder as any,
  _textSecondary: theme.textSecondary as any,
  _textMuted: theme.textMuted as any,
  _textInverse: theme.textInverse as any,

  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  backgroundPattern: {
    position: "absolute" as const,
    width: "100%",
    height: "100%",
  },
  patternCircle1: {
    position: "absolute" as const,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.surface,
    top: -100,
    right: -50,
  },
  patternCircle2: {
    position: "absolute" as const,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.surface,
    bottom: 100,
    left: -75,
  },
  patternCircle3: {
    position: "absolute" as const,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.elevatedSurface,
    top: "40%",
    right: 30,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 40,
    backgroundColor: theme.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center" as const,
  },
  header: {
    alignItems: "center" as const,
    marginBottom: 48,
  },
  logoContainer: {
    alignItems: "center" as const,
    marginBottom: 24,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 20,
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.shadowOpacity,
    shadowRadius: 8,
    elevation: 4,
  },
  iconImage: {
    position: "absolute" as const,
    width: 64,
    borderRadius: 32,
    height: 64,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "200" as const,
    letterSpacing: 6,
    color: theme.textPrimary,
    textTransform: "uppercase" as const,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: theme.textPrimary,
    marginBottom: 8,
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: "center" as const,
    fontWeight: "400" as const,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: theme.textPrimary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: theme.inputBackground,
    borderWidth: 1,
    borderColor: theme.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: theme.inputText,
  },
  passwordContainer: {
    position: "relative" as const,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: "absolute" as const,
    right: 16,
    top: 16,
    padding: 4,
  },
  infoContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.warningBg,
    borderWidth: 1,
    borderColor: theme.warning + "33",
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center" as const,
    color: theme.textSecondary,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end" as const,
    marginTop: 12,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: theme.textPrimary,
    textDecorationLine: "underline" as const,
  },
  actions: {
    gap: 20,
  },
  primaryButton: {
    width: "100%",
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: theme.textInverse,
    letterSpacing: 1,
    marginRight: 12,
  },
  buttonArrow: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: "center" as const,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  linkText: {
    color: theme.textPrimary,
    fontWeight: "600" as const,
    textDecorationLine: "underline" as const,
  },
  affiliateLink: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.inputBackground,
  },
  affiliateLinkText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: theme.textPrimary,
  },
  // OTP specific
  otpContainer: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    gap: 12,
    marginBottom: 24,
  },
  otpInput: {
    width: 56,
    height: 64,
    borderWidth: 2,
    borderColor: theme.border,
    borderRadius: 16,
    fontSize: 24,
    fontWeight: "700" as const,
    color: theme.textPrimary,
    textAlign: "center" as const,
    backgroundColor: theme.inputBackground,
  },
  otpInputFocused: {
    borderColor: theme.primary,
    backgroundColor: theme.primarySoft,
  },
  otpInputFilled: {
    borderColor: theme.primary,
    backgroundColor: theme.primarySoft,
  },
  resendContainer: {
    alignItems: "center" as const,
    marginTop: 8,
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  resendLink: {
    color: theme.primary,
    fontWeight: "600" as const,
  },
  timerText: {
    fontSize: 14,
    color: theme.textMuted,
  },
}));

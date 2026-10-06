import {
  useAuthUser,
  useAuthSession,
  useAuthActions,
} from "@/context/ctx";

/**
 * Simplified auth methods with { success, error } results for screens.
 */
export function useAuthOperations() {
  const { user } = useAuthUser();
  const { isAuthenticated, isLoading } = useAuthSession();
  const {
    signIn,
    signUp,
    signOut,
    verifyAccount,
    sendVerificationEmail,
    resetPassword,
    forgotPassword,
    verifyResetCode,
  } = useAuthActions();

  const login = async (email: string, password: string) => {
    try {
      await signIn({ email, password });
      return { success: true as const };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      await signUp({ email, password, name, phoneNumber: "" } as any);
      return { success: true as const };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await signOut();
      return { success: true as const };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : "Logout failed",
      };
    }
  };

  const verifyAccountOp = async (email: string, otp: string) => {
    try {
      await verifyAccount({ email, otp });
      return { success: true as const };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : "Verification failed",
      };
    }
  };

  const sendVerificationCode = async (email: string) => {
    try {
      await sendVerificationEmail(email);
      return { success: true as const };
    } catch (error) {
      return {
        success: false as const,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send verification code",
      };
    }
  };

  const resetPasswordOp = async (
    email: string,
    otp: string,
    newPassword: string,
  ) => {
    try {
      await resetPassword({ email, otp, new_password: newPassword });
      return { success: true as const };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : "Password reset failed",
      };
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      await forgotPassword({ email });
      return { success: true as const };
    } catch (error) {
      return {
        success: false as const,
        error:
          error instanceof Error
            ? error.message
            : "Failed to request password reset",
      };
    }
  };

  const verifyResetCodeOp = async (email: string, otp: string) => {
    try {
      await verifyResetCode({ email, otp });
      return { success: true as const };
    } catch (error) {
      return {
        success: false as const,
        error:
          error instanceof Error
            ? error.message
            : "Reset code verification failed",
      };
    }
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading,

    // Operations
    login,
    register,
    logout,
    verifyAccount: verifyAccountOp,
    sendVerificationCode,
    resetPassword: resetPasswordOp,
    requestPasswordReset,
    verifyResetCode: verifyResetCodeOp,
  };
}

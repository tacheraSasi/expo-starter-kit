import logger from "@/lib/logger";
import { router } from "expo-router";
import {
  createContext,
  useCallback,
  useMemo,
  type PropsWithChildren,
  use,
  useEffect,
  useState,
} from "react";

import { useOnboardingState } from "../hooks/useOnboardingState";
import { useStorageState } from "../hooks/useStorageState";

import Api from "../lib/api";
import { currentUser } from "../lib/api/authToken";
import { registerForPushNotificationsAsync } from "../hooks/usePushNotifications";
import { appAlert } from "../lib/ui/appAlert";
import {
  AuthResponse,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  User,
  VerifyOtpDto,
  VerifyResetCodeDto,
} from "../lib/api/types";

// ============================
// Contexts (split by change frequency)
// ============================
// Three narrow contexts so a change in one slice only re-renders the
// consumers that actually read that slice:
//  - UserContext: user + derived flags (changes on user refresh)
//  - SessionContext: session/auth loading/onboarding (changes on login/logout)
//  - ActionsContext: action callbacks (stable, never re-renders consumers)

interface AuthUserContextType {
  user: User | null;
  isAdmin: boolean;
}

interface AuthSessionContextType {
  session: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isOnboardingLoading: boolean;
  completeOnboarding: () => void;
}

interface AuthActionsContextType {
  signIn: (credentials: LoginDto) => Promise<AuthResponse | undefined>;
  signUp: (credentials: RegisterDto) => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationEmail: (email: string) => Promise<void>;
  verifyAccount: (payload: VerifyOtpDto) => Promise<void>;
  forgotPassword: (payload: ForgotPasswordDto) => Promise<void>;
  verifyResetCode: (payload: VerifyResetCodeDto) => Promise<void>;
  resetPassword: (payload: ResetPasswordDto) => Promise<void>;
  refreshUserData: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  signInWithDummyUser: () => void;
}

const AuthUserContext = createContext<AuthUserContextType>({
  user: null,
  isAdmin: false,
});

const AuthSessionContext = createContext<AuthSessionContextType>({
  session: null,
  isLoading: false,
  isAuthenticated: false,
  isOnboarded: false,
  isOnboardingLoading: false,
  completeOnboarding: () => {},
});

const AuthActionsContext = createContext<AuthActionsContextType>({
  signIn: async () => undefined,
  signUp: async () => {},
  signOut: async () => {},
  sendVerificationEmail: async () => {},
  verifyAccount: async () => {},
  forgotPassword: async () => {},
  verifyResetCode: async () => {},
  resetPassword: async () => {},
  refreshUserData: async () => {},
  deleteAccount: async () => {},
  signInWithDummyUser: () => {},
});

// Narrow hooks: subscribe to one slice only. Prefer these over `useAuth`.
export function useAuthUser() {
  return use(AuthUserContext);
}

export function useAuthSession() {
  return use(AuthSessionContext);
}

export function useAuthActions() {
  return use(AuthActionsContext);
}

// Combined hook: re-renders on any auth slice change.
export function useAuth() {
  return {
    ...useAuthUser(),
    ...useAuthSession(),
    ...useAuthActions(),
  };
}

// For backward compatibility
export const useSession = useAuth;

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isStorageLoading, session], setSession] = useStorageState("session");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Helper to clear all auth state
  const clearAuthState = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setSession(null);
  }, [setSession]);

  // Onboarding state
  const {
    isLoading: isOnboardingLoading,
    isOnboarded,
    completeOnboarding: setOnboardingComplete,
    resetOnboarding,
  } = useOnboardingState();

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      // currentUser() is the single source of truth.
      const userData = await currentUser();

      if (userData && (userData.fullName ?? (userData as any).name) != null) {
        setUser(userData as any);
        setIsAuthenticated(true);
        setSession("authenticated");
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setSession(null);
      }
    } catch (error) {
      logger.error("Auth initialization error:", error);
      setUser(null);
      setIsAuthenticated(false);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Shared "login completed" routine. Stores the user, marks the session as
  // authenticated, fires push-token registration, and navigates to the app.
  const completeLogin = useCallback(
    (backendUser: User) => {
      setUser(backendUser);
      setIsAuthenticated(true);
      setSession("authenticated");

      // Complete onboarding on successful login
      setOnboardingComplete();

      // Register push notification token after successful login
      registerForPushNotificationsAsync()
        .then((token) => {
          if (token) {
            Api.registerPushToken(token).catch((err) =>
              logger.warn("Failed to register push token:", err),
            );
          }
        })
        .catch((err) => logger.warn("Push token registration skipped:", err));

      // Navigate to main app
      router.replace("/");
    },
    [setSession, setOnboardingComplete],
  );

  const signIn = useCallback(
    async (credentials: LoginDto) => {
      try {
        setIsLoading(true);
        const response = await Api.login(credentials);

        if (response.user) {
          completeLogin(response.user);
          return response;
        }
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [completeLogin],
  );

  const signUp = useCallback(
    async (credentials: RegisterDto) => {
      try {
        setIsLoading(true);
        const response = await Api.register(credentials);

        const newUser =
          (response as any).data?.user ?? (response as any).user;
        if (newUser) {
          setUser(newUser);
          // Don't mark as authenticated until the account is verified
          setIsAuthenticated(false);
          setSession(null);
          setOnboardingComplete();
        }
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [setOnboardingComplete],
  );

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);

      // Remove push token before logout so the user stops receiving notifications
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          await Api.removePushToken(token);
        }
      } catch (err) {
        logger.warn("Failed to remove push token:", err);
      }

      await Api.logout();
    } catch (error) {
      logger.warn("Logout error:", error);
    } finally {
      // Clear all auth state and session
      clearAuthState();
      setIsLoading(false);

      // Reset onboarding when user signs out
      resetOnboarding();

      // Navigate to auth screen
      router.replace("/(auth)/login");
    }
  }, [clearAuthState, resetOnboarding]);

  const sendVerificationEmail = useCallback(async (email: string) => {
    await Api.sendVerificationEmail(email);
  }, []);

  const verifyAccount = useCallback(async (payload: VerifyOtpDto) => {
    try {
      setIsLoading(true);
      await Api.verifyAccount(payload);
      await refreshUserData();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (payload: ForgotPasswordDto) => {
    await Api.forgotPassword(payload);
  }, []);

  const verifyResetCode = useCallback(async (payload: VerifyResetCodeDto) => {
    await Api.verifyResetCode(payload);
  }, []);

  const resetPassword = useCallback(async (payload: ResetPasswordDto) => {
    try {
      await Api.resetPassword(payload);

      // After successful password reset, navigate to sign in
      router.replace("/(auth)/login");
    } catch (error) {
      throw error;
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    try {
      const userData = await currentUser();
      if (userData) {
        setUser(userData as any);
      }
    } catch (error) {
      logger.error("Error refreshing user data:", error);
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    appAlert.dialog(
      "Delete account?",
      "This will sign you out and clear local data. (Demo mode: no server deletion.)",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await Api.logout();
              } finally {
                clearAuthState();
                resetOnboarding();
                router.replace("/(auth)/login");
              }
            })();
          },
        },
      ],
    );
  }, [clearAuthState, resetOnboarding]);

  const signInWithDummyUser = useCallback(() => {
    const now = new Date().toISOString();
    const dummyUser = {
      id: "demo-user",
      name: "Demo User",
      fullName: "Demo User",
      display_name: "Demo User",
      email: "demo@example.com",
      role: "user",
      is_active: true,
      created_at: now,
      updated_at: now,
      metadata: {},
    } as unknown as User;

    setUser(dummyUser);
    setIsAuthenticated(true);
    setSession("authenticated");
    setOnboardingComplete();

    router.replace("/(core)/(drawer)/(tabs)/home" as any);
  }, [setOnboardingComplete, setSession]);

  const normalizedRole = ((user as any)?.role ?? "")
    .toLowerCase()
    .replace(/-/g, "_");
  const isAdmin = ["admin", "owner", "super_admin", "business_owner"].includes(
    normalizedRole,
  );

  const userContextValue = useMemo(
    () => ({ user, isAdmin }),
    [user, isAdmin],
  );

  const sessionContextValue = useMemo(
    () => ({
      session,
      isLoading: isLoading || isStorageLoading,
      isAuthenticated,
      isOnboarded,
      isOnboardingLoading,
      completeOnboarding: setOnboardingComplete,
    }),
    [
      session,
      isLoading,
      isStorageLoading,
      isAuthenticated,
      isOnboarded,
      isOnboardingLoading,
      setOnboardingComplete,
    ],
  );

  const actionsContextValue = useMemo<AuthActionsContextType>(
    () => ({
      signIn,
      signUp,
      signOut,
      sendVerificationEmail,
      verifyAccount,
      forgotPassword,
      verifyResetCode,
      resetPassword,
      refreshUserData,
      deleteAccount,
      signInWithDummyUser,
    }),
    [
      signIn,
      signUp,
      signOut,
      sendVerificationEmail,
      verifyAccount,
      forgotPassword,
      verifyResetCode,
      resetPassword,
      refreshUserData,
      deleteAccount,
      signInWithDummyUser,
    ],
  );

  return (
    <AuthUserContext.Provider value={userContextValue}>
      <AuthSessionContext.Provider value={sessionContextValue}>
        <AuthActionsContext.Provider value={actionsContextValue}>
          {children}
        </AuthActionsContext.Provider>
      </AuthSessionContext.Provider>
    </AuthUserContext.Provider>
  );
}

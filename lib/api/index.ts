/**
 * Dummy / mock API for the starter kit.
 *
 * No backend required: every method simulates network latency and persists
 * to the on-device MMKV store (via ./authToken) so the full auth flow -
 * register, login, verify, forgot/reset, logout - can be exercised offline.
 *
 * Test accounts:
 * - Any email + any password signs in successfully.
 * - OTP / reset codes are always `123456`.
 *
 * To wire a real backend later:
 * 1. See `lib/api/config.ts` (axios instance with JWT refresh + HMAC headers).
 * 2. Replace the bodies below with `api(true|false).get/post/...` calls.
 * 3. Keep the method names/signatures so screens and hooks keep working.
 */
import {
  ApiResponse,
  AuthResponse,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  UpdateUserDto,
  UploadResponse,
  VerifyOtpDto,
  VerifyResetCodeDto,
} from "@/lib/api/types";
import {
  authToken,
  clearCache,
  currentUser,
  saveUser,
} from "./authToken";
import { appAlert } from "@/lib/ui/appAlert";
import logger from "@/lib/logger";

const MOCK_DELAY_MS = 700;
export const MOCK_OTP = "123456";

function delay(ms = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function base64UrlEncode(obj: object): string {
  const json = JSON.stringify(obj);
  return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Unsigned fake JWT with a real `exp` claim so `isJwtExpired()` works. */
function makeDummyJwt(expiresInSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode({ alg: "none", typ: "JWT" });
  const payload = base64UrlEncode({
    sub: "demo-user",
    iat: now,
    exp: now + expiresInSeconds,
  });
  return `${header}.${payload}.dummy-signature`;
}

function displayNameFromEmail(email: string): string {
  const prefix = email.split("@")[0] || "Demo User";
  return prefix
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

const SEVEN_DAYS_S = 7 * 24 * 60 * 60;
const THIRTY_DAYS_S = 30 * 24 * 60 * 60;

class Api {
  static async register(payload: RegisterDto): Promise<AuthResponse> {
    await delay();
    const name = payload.name?.trim() || displayNameFromEmail(payload.email);
    const user = {
      id: "user-1",
      ID: "user-1",
      name,
      display_name: name,
      fullName: name,
      email: payload.email,
      role: "user",
      roles: ["user"],
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      email_verified_at: null,
    } as any;

    // Registration does not auto-authenticate: store the profile only,
    // mirroring backends that require email verification first.
    await saveUser({
      id: user.id,
      name: user.name,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
    logger.log(`[mock] registered ${payload.email}`);

    return {
      success: true,
      message: "Registration successful. Please verify your email.",
      data: {
        user,
        tokens: {
          access_token: makeDummyJwt(SEVEN_DAYS_S),
          refresh_token: makeDummyJwt(THIRTY_DAYS_S),
          token_type: "Bearer",
          expires_in: SEVEN_DAYS_S,
        },
      },
      user,
    } as unknown as AuthResponse;
  }

  static async login(payload: LoginDto): Promise<AuthResponse> {
    await delay();

    const name = displayNameFromEmail(payload.email);
    const access = makeDummyJwt(SEVEN_DAYS_S);
    const refresh = makeDummyJwt(THIRTY_DAYS_S);
    await import("./authToken").then(({ setAuthToken }) =>
      setAuthToken({ access, refresh }),
    );
    const user = {
      id: "user-1",
      ID: "user-1",
      name,
      display_name: name,
      fullName: name,
      email: payload.email,
      role: "user",
      roles: ["user"],
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      email_verified_at: new Date().toISOString(),
    } as any;
    await saveUser({
      id: user.id,
      name: user.name,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
    logger.log(`[mock] login ${payload.email}`);

    return {
      success: true,
      message: "Login successful",
      data: {
        user,
        tokens: {
          access_token: access,
          refresh_token: refresh,
          token_type: "Bearer",
          expires_in: SEVEN_DAYS_S,
        },
      },
      user,
      token: access,
      refresh_token: refresh,
    } as unknown as AuthResponse;
  }

  static async logout(): Promise<void> {
    await delay(300);
    try {
      const token = await authToken("access").catch(() => null);
      if (token) logger.log("[mock] push token detached");
    } finally {
      await clearCache();
    }
  }

  static async getCurrentUser(): Promise<any> {
    await delay(300);
    return currentUser();
  }

  static async updateCurrentUser(payload: UpdateUserDto): Promise<any> {
    await delay();
    const existing = (await currentUser()) ?? {
      id: "user-1",
      email: "",
      role: "user",
    };
    const updated = {
      ...existing,
      ...payload,
      name: payload.name ?? (existing as any).name ?? (existing as any).fullName,
      fullName:
        payload.name ?? (existing as any).fullName ?? (existing as any).name,
      updated_at: new Date().toISOString(),
    };
    await saveUser(updated as any);
    return updated;
  }

  static async refreshToken(): Promise<{
    token: string;
    refresh_token: string;
    refresh_token_expires_at: string;
  }> {
    await delay(300);
    const access = makeDummyJwt(SEVEN_DAYS_S);
    const refresh = makeDummyJwt(THIRTY_DAYS_S);
    const { setAuthToken } = await import("./authToken");
    await setAuthToken({ access, refresh });
    return {
      token: access,
      refresh_token: refresh,
      refresh_token_expires_at: new Date(
        Date.now() + THIRTY_DAYS_S * 1000,
      ).toISOString(),
    };
  }

  static async sendVerificationEmail(email: string): Promise<ApiResponse> {
    await delay();
    logger.log(`[mock] verification code ${MOCK_OTP} sent to ${email}`);
    appAlert.dialog(
      "Mock verification",
      `Demo mode: use code ${MOCK_OTP} for ${email}.`,
    );
    return { success: true, message: "Verification code sent." };
  }

  static async verifyAccount(payload: VerifyOtpDto): Promise<ApiResponse> {
    await delay();
    if (payload.otp !== MOCK_OTP) throw new Error("Invalid code. Hint: use 123456.");
    appAlert.dialog("Success", "Account verified successfully!");
    return { success: true, message: "Account verified successfully!" };
  }

  static async forgotPassword(
    payload: ForgotPasswordDto,
  ): Promise<ApiResponse> {
    await delay();
    logger.log(`[mock] reset code ${MOCK_OTP} sent to ${payload.email}`);
    appAlert.dialog(
      "Mock reset code",
      `Demo mode: use code ${MOCK_OTP} for ${payload.email}.`,
    );
    return { success: true, message: "Password reset code sent." };
  }

  static async verifyResetCode(
    payload: VerifyResetCodeDto,
  ): Promise<ApiResponse> {
    await delay();
    if (payload.otp !== MOCK_OTP) throw new Error("Invalid code. Hint: use 123456.");
    appAlert.dialog("Success", "Reset code verified successfully!");
    return { success: true, message: "Reset code verified." };
  }

  static async resetPassword(payload: ResetPasswordDto): Promise<ApiResponse> {
    await delay();
    if (payload.otp !== MOCK_OTP) throw new Error("Invalid code. Hint: use 123456.");
    if (!payload.new_password || payload.new_password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }
    appAlert.dialog("Success", "Password reset successful!");
    return { success: true, message: "Password reset successful!" };
  }

  // Media Upload (mock: echoes a fake remote URL, no network)
  static async uploadFile(
    fileUri: string,
    fileName: string,
    _mimeType: string,
  ): Promise<UploadResponse> {
    await delay();
    if (!fileUri) throw new Error("File URI is required");
    if (!fileName) throw new Error("File name is required");
    logger.log(`[mock] upload ${fileName}`);
    return {
      status: "success",
      url: `https://example.com/uploads/${encodeURIComponent(fileName)}`,
      message: "File uploaded (mock).",
    };
  }

  // ---- Push / notifications (mock) ----

  static async registerPushToken(_token: string): Promise<void> {
    logger.log("[mock] push token registered");
  }

  static async removePushToken(_token: string): Promise<void> {
    logger.log("[mock] push token removed");
  }

  static async getUnreadNotificationCount(): Promise<number> {
    await delay(200);
    return 3;
  }

  /** Mock feedback submission (logs locally, no network). */
  static async submitFeedback(payload: {
    type?: string;
    message: string;
    [key: string]: any;
  }): Promise<{ uuid: string; type: string; status: string; created: string }> {
    await delay(400);
    logger.log(`[mock] feedback (${payload.type ?? "other"}): ${payload.message}`);
    return {
      uuid: `feedback-${Date.now()}`,
      type: payload.type ?? "other",
      status: "received",
      created: new Date().toISOString(),
    };
  }

  /** Demo paginated list for testing `useApiList` without a backend. */
  static async listDemoItems(
    params: { page?: number; per_page?: number; search?: string } = {},
  ): Promise<{
    data: { id: string; uuid: string; title: string }[];
    meta: any;
  }> {
    await delay(400);
    const per = params.per_page ?? 20;
    const page = params.page ?? 1;
    const total = 45;
    const q = (params.search ?? "").toLowerCase();
    const all = Array.from({ length: total }, (_, i) => ({
      id: String(i + 1),
      uuid: `demo-${i + 1}`,
      title: `Demo item ${i + 1}`,
    })).filter((r) => !q || r.title.toLowerCase().includes(q));
    const start = (page - 1) * per;
    return {
      data: all.slice(start, start + per),
      meta: {
        current_page: page,
        from: start + 1,
        per_page: per,
        to: Math.min(start + per, all.length),
        total: all.length,
        last_page: Math.max(1, Math.ceil(all.length / per)),
        total_items: all.length,
        total_pages: Math.max(1, Math.ceil(all.length / per)),
        has_next_page: start + per < all.length,
        has_previous_page: page > 1,
      },
    };
  }
}

export default Api;

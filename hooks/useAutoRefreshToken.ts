import { useEffect, useRef } from "react";
import { authToken, LAST_REFRESH_KEY, setAuthToken } from "@/lib/api/authToken";
import { mmkv } from "@/lib/storage/mmkv";
import axios from "axios";
import { BASE_URL } from "@/constants/constants";
import { getMobileAuthHeaders } from "@/lib/api/mobileAuth";
import logger from "@/lib/logger";

export function useAutoRefreshToken(session: string | null) {
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current || !session) return;
    didRun.current = true;

    const lastRefresh = mmkv.getNumber(LAST_REFRESH_KEY) ?? 0;
    const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;

    if (Date.now() - lastRefresh > fiveDaysMs) {
      authToken("refresh").then(async (rt) => {
        if (!rt) return;
        try {
          const requestBody = { refresh_token: rt };
          const res = await axios.post(`${BASE_URL}auth/mobile/refresh`, requestBody, {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              ...getMobileAuthHeaders("POST", "auth/mobile/refresh", requestBody),
            },
            timeout: 10000,
          });
          const { success, data } = res.data;
          if (success && data?.tokens) {
            await setAuthToken({
              access: data.tokens.access_token,
              refresh: data.tokens.refresh_token,
            });
            mmkv.set(LAST_REFRESH_KEY, Date.now());
          }
        } catch (e) {
          logger.warn("Cold-start token refresh failed (existing tokens preserved):", e);
        }
      });
    }
  }, [session]);
}

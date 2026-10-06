export const API_PREFIX = "/api/";
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL
    ? `${process.env.EXPO_PUBLIC_API_URL}${API_PREFIX}${process.env.EXPO_PUBLIC_API_VERSION || "v1"}`
    : "http://localhost:8080/api/v1";
export const DEFAULT_THEME = "light";
export const SUPPORTED_THEMES = ["light", "dark"] as const;

export const PRIVACY_URL = "https://example.com/privacy";
export const TERMS_URL = "https://example.com/terms";

export const BLURHASH =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export { APP_VERSION } from "./version";

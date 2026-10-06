import Constants from "expo-constants";

const commitHash =
  process.env.EXPO_PUBLIC_COMMIT_HASH || "0000000";
const appVersion = Constants.expoConfig?.version || "0.0.0";

export const APP_VERSION = `${appVersion} (${commitHash})`;

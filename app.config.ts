import type { ExpoConfig } from "expo/config";
import {
  type ConfigPlugin,
  withProjectBuildGradle,
  withAndroidManifest,
} from "@expo/config-plugins";

const appJson = require("./app.json");

const baseConfig = appJson.expo as ExpoConfig;

const config: ExpoConfig = {
  ...baseConfig,
};

const WORK_MANAGER_ALIGNMENT_BLOCK = `
  configurations.all {
    resolutionStrategy {
      force 'androidx.work:work-runtime:2.8.1'
      force 'androidx.work:work-runtime-ktx:2.8.1'
      eachDependency { details ->
        if (details.requested.group == 'androidx.work') {
          details.useVersion '2.8.1'
        }
      }
    }
  }
`;

const withWorkManagerAlignment: ConfigPlugin = (expoConfig) =>
  withProjectBuildGradle(expoConfig, (gradleConfig) => {
    const contents = gradleConfig.modResults.contents;

    if (contents.includes("androidx.work:work-runtime-ktx:2.8.1")) {
      return gradleConfig;
    }

    gradleConfig.modResults.contents = contents.replace(
      /allprojects\s*\{([\s\S]*?)\n\}/,
      (match) => {
        const insertionPoint = match.lastIndexOf("\n}");
        if (insertionPoint < 0) {
          return match;
        }
        return (
          match.slice(0, insertionPoint) +
          "\n" +
          WORK_MANAGER_ALIGNMENT_BLOCK +
          match.slice(insertionPoint)
        );
      },
    );

    return gradleConfig;
  });

/**
 * Config plugin to set `windowSoftInputMode="adjustResize"` on the main activity.
 * This ensures KeyboardAvoidingView can properly push content up on Android.
 */
const withAdjustResize: ConfigPlugin = (expoConfig) =>
  withAndroidManifest(expoConfig, (manifestConfig) => {
    const mainActivity =
      manifestConfig.modResults.manifest.application?.[0]?.activity?.find(
        (activity) => activity.$["android:name"] === ".MainActivity",
      );

    if (mainActivity) {
      mainActivity.$["android:windowSoftInputMode"] = "adjustResize";
    }

    return manifestConfig;
  });

export default withAdjustResize(withWorkManagerAlignment(config));

# Apple App Store Submission Guide - Starter Kit

This guide walks through every step required to submit Starter Kit to the Apple App Store using **Expo Application Services (EAS)**.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Apple Developer Account Setup](#2-apple-developer-account-setup)
3. [App Store Connect Configuration](#3-app-store-connect-configuration)
4. [EAS Configuration for iOS](#4-eas-configuration-for-ios)
5. [Push Notifications (APNs) Setup](#5-push-notifications-apns-setup)
6. [Certificates & Provisioning](#6-certificates--provisioning)
7. [Privacy & Compliance](#7-privacy--compliance)
8. [Building for iOS](#8-building-for-ios)
9. [Submitting to App Store](#9-submitting-to-app-store)
10. [App Store Review Guidelines Checklist](#10-app-store-review-guidelines-checklist)
11. [App Store Metadata](#11-app-store-metadata)
12. [Post-Submission](#12-post-submission)
13. [Common Rejection Reasons & Fixes](#13-common-rejection-reasons--fixes)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Prerequisites

Before you begin, ensure you have:

- [ ] **Apple Developer Account** ($99/year) - [developer.apple.com](https://developer.apple.com)
- [ ] **Expo account** linked to the project (`owner: template-app2024`)
- [ ] **EAS CLI** installed: `npm install -g eas-cli`
- [ ] **Xcode** installed (for local testing on simulator, optional if using EAS Build)
- [ ] **Node.js** 18+ and **Bun** package manager
- [ ] A physical iOS device for testing push notifications

### Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### Verify Project Setup

```bash
eas whoami
# Should show: template-app2024

eas project:info
# Should show project ID: 2de23c10-25cf-4a4b-8adc-36020bdce16f
```

---

## 2. Apple Developer Account Setup

### 2.1 Enroll in Apple Developer Program

1. Go to [developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll/)
2. Sign in with your Apple ID
3. Complete enrollment ($99/year for individuals, $299/year for organizations)
4. Wait for approval (usually 24–48 hours)

### 2.2 Accept Agreements

1. Sign in to [App Store Connect](https://appstoreconnect.apple.com)
2. Go to **Agreements, Tax, and Banking**
3. Accept the **Apple Developer Agreement**
4. Complete **Paid Apps agreement** if you plan to charge or use in-app purchases
5. Enter bank and tax information

> **Important:** Apple will reject your submission if agreements are not fully signed.

---

## 3. App Store Connect Configuration

### 3.1 Create the App

1. Go to [App Store Connect → My Apps](https://appstoreconnect.apple.com/apps)
2. Click **"+"** → **"New App"**
3. Fill in:
   - **Platforms:** iOS
   - **Name:** Starter Kit
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** `com.template.starter` (must match `app.json → ios.bundleIdentifier`)
   - **SKU:** `com.template.starter` (unique identifier, can be the same as bundle ID)
4. Click **Create**

### 3.2 Note Your App's Apple ID

After creating the app, find the **Apple ID** (numeric) in the App Information page. You'll need this for `eas.json`:

```
App Store Connect → Your App → App Information → General Information → Apple ID
```

Update `eas.json` with this value:

```json
{
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "YOUR_NUMERIC_APPLE_ID_HERE",
        "appleTeamId": "YOUR_APPLE_TEAM_ID_HERE"
      }
    }
  }
}
```

To find your **Apple Team ID**:
- Go to [developer.apple.com/account](https://developer.apple.com/account)
- Your Team ID is shown under **Membership Details**

---

## 4. EAS Configuration for iOS

### 4.1 app.json - iOS Configuration

The app is already configured with these critical iOS settings in `app.json`:

```json
{
  "expo": {
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.template.starter",
      "buildNumber": "1",
      "icon": "./assets/images/ios/AppIcon~ios-marketing.png",
      "privacyManifests": {
        "NSPrivacyAccessedAPITypes": [
          {
            "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
            "NSPrivacyAccessedAPITypeReasons": ["CA92.1"]
          },
          {
            "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryFileTimestamp",
            "NSPrivacyAccessedAPITypeReasons": ["C617.1"]
          },
          {
            "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryDiskSpace",
            "NSPrivacyAccessedAPITypeReasons": ["E174.1"]
          },
          {
            "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategorySystemBootTime",
            "NSPrivacyAccessedAPITypeReasons": ["35F9.1"]
          }
        ]
      },
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"],
        "NSPhotoLibraryUsageDescription": "...",
        "NSCameraUsageDescription": "...",
        "NSMicrophoneUsageDescription": "...",
        "NSFaceIDUsageDescription": "...",
        "NSUserTrackingUsageDescription": "..."
      }
    }
  }
}
```

**Key fields explained:**

| Field | Purpose |
|-------|---------|
| `bundleIdentifier` | Must match App Store Connect exactly |
| `buildNumber` | Auto-incremented by EAS on each build |
| `icon` | 1024×1024 marketing icon (no alpha channel) |
| `privacyManifests` | Required since iOS 17 - declares API usage reasons |
| `infoPlist.UIBackgroundModes` | Enables background push notification processing |
| `infoPlist.NSFaceIDUsageDescription` | Required since the app uses `expo-secure-store` (Face ID/Touch ID) |
| `infoPlist.NSUserTrackingUsageDescription` | Required if using any tracking-related APIs |

### 4.2 eas.json - Build & Submit Profiles

```json
{
  "build": {
    "production": {
      "autoIncrement": true,
      "channel": "production"
    },
    "ios-simulator": {
      "ios": {
        "simulator": true
      },
      "channel": "development"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_APPLE_TEAM_ID"
      }
    }
  }
}
```

---

## 5. Push Notifications (APNs) Setup

Starter Kit uses **Expo Push Notifications** which route through Apple Push Notification service (APNs) on iOS. Setup requires an **APNs key**.

### 5.1 Create an APNs Key

1. Go to [developer.apple.com/account/resources/authkeys](https://developer.apple.com/account/resources/authkeys/list)
2. Click **"+"** to create a new key
3. Enter a name: `Starter Kit Push Key`
4. Check **"Apple Push Notifications service (APNs)"**
5. Click **Continue** → **Register**
6. **Download the `.p8` file** - you can only download it once!
7. Note the **Key ID** shown on the confirmation page

### 5.2 Configure APNs in Expo

Upload the APNs key to Expo so EAS can use it for push notifications:

```bash
eas credentials
```

Select:
1. **iOS**
2. **production** (distribution)
3. **Push Notifications: Set up**
4. Upload the `.p8` file when prompted
5. Enter the **Key ID** and your **Apple Team ID**

Alternatively, upload directly:

```bash
eas credentials --platform ios
```

Then select **Push Key** → **Set up a new Push Key** → follow the prompts.

### 5.3 Verify Push Notification Configuration

The app already has push notifications configured:

- **`app.json`**: `expo-notifications` plugin with `enableBackgroundRemoteNotifications: true`
- **`hooks/usePushNotifications.ts`**: Handles registration, permission requests, and listeners
- **`app/_layout.tsx`**: Initializes push notifications globally via `usePushNotifications()` hook

### 5.4 Testing Push Notifications

After building and installing on a physical iOS device:

1. The app will request push notification permission on first launch
2. An Expo push token will be logged (e.g., `ExponentPushToken[...]`)
3. Test sending a notification via Expo's push notification tool:
   - Go to [expo.dev/notifications](https://expo.dev/notifications)
   - Enter the push token
   - Send a test notification

> **Note:** Push notifications do NOT work on the iOS Simulator - use a physical device.

---

## 6. Certificates & Provisioning

EAS handles certificates and provisioning profiles automatically. When you run your first iOS build, EAS will:

1. Create or reuse a **Distribution Certificate**
2. Create a **Provisioning Profile** for your bundle identifier
3. Handle code signing automatically

### 6.1 Automatic (Recommended)

```bash
eas build -p ios --profile production
```

EAS will prompt you to sign in to your Apple Developer account and handle everything.

### 6.2 Manual Certificate Management

If you need to manage certificates manually:

```bash
eas credentials --platform ios
```

Options available:
- View existing credentials
- Create new distribution certificate
- Create new provisioning profile
- Upload existing certificates
- Revoke/remove credentials

### 6.3 Check Existing Credentials

```bash
eas credentials --platform ios
```

This shows all iOS credentials associated with your project.

---

## 7. Privacy & Compliance

### 7.1 Privacy Manifests (iOS 17+)

Starting in 2024, Apple requires all apps to declare privacy-sensitive API usage in a **Privacy Manifest**. This is configured in `app.json` under `ios.privacyManifests`.

The app declares usage of these required API categories:

| API Category | Reason Code | Usage |
|-------------|-------------|-------|
| `UserDefaults` | `CA92.1` | AsyncStorage data persistence |
| `FileTimestamp` | `C617.1` | File modification date access |
| `DiskSpace` | `E174.1` | Storage availability checks |
| `SystemBootTime` | `35F9.1` | React Native performance timing |

### 7.2 Privacy Policy URL

Apple requires a **Privacy Policy URL** for all apps. You must provide this in App Store Connect:

1. Go to **App Store Connect → Your App → App Privacy**
2. Enter your privacy policy URL: `https://template-apperp.com/privacy`
3. Complete the **App Privacy** questionnaire

### 7.3 Data Collection Declarations

In App Store Connect, declare what data your app collects:

1. Go to **App Store Connect → Your App → App Privacy**
2. Click **"Get Started"**
3. For each data type, declare:
   - **Contact Info** (name, email) - Used for account functionality
   - **Identifiers** (user ID) - Used for app functionality
   - **Usage Data** - Used for analytics (if applicable)
   - **Diagnostics** (crash data) - Used for app functionality

### 7.4 Permission Usage Descriptions

All iOS permission strings are configured in `app.json → ios.infoPlist`:

| Permission | Description |
|-----------|-------------|
| Photo Library | Attach images to products/documents |
| Camera | Scan barcodes and capture product images |
| Microphone | Voice-related features |
| Face ID | Secure authentication for business data |
| Notifications | Business alerts for orders, inventory, system notifications |
| User Tracking | Personalized experience |

> **Apple rejects apps with generic permission descriptions.** Each description must clearly explain why the app needs the permission.

---

## 8. Building for iOS

### 8.1 Development Build (with dev client)

```bash
make build-ios-dev
# or
bunx eas build -p ios --profile dev
```

### 8.2 Simulator Build

```bash
make build-ios-simulator
# or
bunx eas build -p ios --profile ios-simulator
```

### 8.3 Preview Build (Internal Distribution)

```bash
make build-ios-preview
# or
bunx eas build -p ios --profile preview4
```

Internal distribution requires registering test devices. Add devices with:

```bash
eas device:create
```

### 8.4 Production Build

```bash
make build-ios-production
# or
bunx eas build -p ios --profile production
```

### 8.5 Build + Auto Submit

```bash
make build-ios-submit
# or
bunx eas build -p ios --profile production --auto-submit
```

### 8.6 Build Both Platforms

```bash
make build-all-production
# or
bunx eas build --profile production
```

---

## 9. Submitting to App Store

### 9.1 First-Time Setup

Before your first submission, update `eas.json` with your actual Apple IDs:

```json
{
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDE12345"
      }
    }
  }
}
```

### 9.2 Submit Using EAS

**Option A: Build and submit in one command**

```bash
make build-ios-submit
```

**Option B: Submit an existing build**

```bash
make submit-ios
# or
bunx eas submit -p ios --profile production
```

EAS will prompt you to:
1. Sign in to your Apple Developer account (first time only)
2. Select the build to submit
3. Upload to App Store Connect

### 9.3 Submit via App Store Connect

After the build is uploaded via EAS Submit:

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select **Starter Kit**
3. Click **"+ Version or Platform"** → **iOS**
4. Enter version number (e.g., `1.1.30`)
5. Select the uploaded build
6. Fill in all required metadata (see [Section 11](#11-app-store-metadata))
7. Answer the export compliance questions
8. Click **"Submit for Review"**

---

## 10. App Store Review Guidelines Checklist

Before submitting, verify your app meets these requirements:

### Account & Authentication
- [x] App supports account creation and login
- [x] Account deletion is accessible (Settings → Account Deletion)
- [x] Terms of Service are displayed during signup
- [x] Privacy Policy is accessible

### Functionality
- [x] App does not crash on launch
- [x] All navigation paths work correctly
- [x] Error states are handled gracefully
- [x] Loading states are shown during network requests
- [x] App works without network (graceful offline handling)

### Push Notifications
- [x] Notifications are requested with a pre-permission dialog explaining value
- [x] App functions without notification permission
- [x] Notification permission is requested at an appropriate time (not on first launch before context)

### Privacy
- [x] Privacy manifests are configured for required API categories
- [x] All permission usage descriptions are specific and descriptive
- [x] Privacy Policy URL is provided
- [x] Face ID usage description is included (required for `expo-secure-store`)

### UI/UX
- [x] App supports both light and dark mode (`userInterfaceStyle: "automatic"`)
- [x] App supports iPad (`supportsTablet: true`)
- [x] App runs in portrait orientation
- [x] Safe area insets are properly handled
- [x] App uses iOS-native navigation patterns

### Content
- [ ] Screenshots are prepared for all required device sizes
- [ ] App description is complete and accurate
- [ ] Keywords are set (up to 100 characters)
- [ ] Support URL is provided
- [ ] Marketing URL is provided (optional but recommended)

---

## 11. App Store Metadata

Prepare the following before submitting:

### 11.1 Screenshots

Required sizes (provide at least one set):

| Device | Size (pixels) | Required? |
|--------|--------------|-----------|
| iPhone 6.9" (16 Pro Max) | 1320 × 2868 | Yes (one of 6.9" or 6.7") |
| iPhone 6.7" (15 Pro Max) | 1290 × 2796 | Yes (one of 6.9" or 6.7") |
| iPhone 6.5" (11 Pro Max) | 1284 × 2778 or 1242 × 2688 | Yes |
| iPhone 5.5" (8 Plus) | 1242 × 2208 | Yes |
| iPad Pro 12.9" (6th gen) | 2048 × 2732 | Yes (if `supportsTablet: true`) |
| iPad Pro 12.9" (2nd gen) | 2048 × 2732 | Yes (if `supportsTablet: true`) |

**Recommended screenshots:**
1. Onboarding flow
2. Login screen
3. Home screen
4. Demo list (pagination)
5. Settings / Profile

> **Tip:** Use [screenshots.pro](https://screenshots.pro) or Xcode's Simulator to capture screenshots. Add marketing frames with tools like [AppMockUp](https://app-mockup.com).

### 11.2 App Information

| Field | Value |
|-------|-------|
| **App Name** | Starter Kit |
| **Subtitle** | Starter template for Expo apps |
| **Category** | Business |
| **Secondary Category** | Finance (optional) |
| **Content Rating** | 4+ (no objectionable content) |
| **Price** | Free (or your pricing) |

### 11.3 Description

```
Starter Kit is a batteries-included Expo starter with auth, theming (light/dark/system), offline-ready caching, push
notifications, OTA updates, biometric app lock, and multi-language support
(English + Swahili) - all running against a built-in mock API so you can
evaluate it with no backend.
```

### 11.4 Keywords

```
starter,template,expo,offline,theme,i18n,auth,notifications
```

### 11.5 URLs

| URL | Value |
|-----|-------|
| **Privacy Policy** | `https://template-apperp.com/privacy` |
| **Terms of Service** | `https://template-apperp.com/terms` |
| **Support URL** | `https://template-apperp.com/support` |
| **Marketing URL** | `https://template-apperp.com` |

### 11.6 Review Information

Provide Apple review team with:
- **Demo account** credentials (email and password for a test account)
- **Contact information** for the review team to reach you
- **Notes** explaining any non-obvious app functionality

---

## 12. Post-Submission

### 12.1 Review Timeline

- **Typical review time:** 24–48 hours
- **First submission:** May take longer (up to 7 days)
- You can check status in App Store Connect

### 12.2 Review Statuses

| Status | Meaning |
|--------|---------|
| Waiting for Review | Submitted, in queue |
| In Review | Being reviewed by Apple |
| Pending Developer Release | Approved, ready for you to release |
| Ready for Sale | Live on App Store |
| Rejected | Issues found (see Resolution Center) |

### 12.3 OTA Updates After Release

Once the app is live, you can push over-the-air updates for JS changes using Expo Updates:

```bash
eas update --branch production --message "Bug fix for..."
```

OTA updates do **not** require a new App Store review. However, you **cannot** change native code (plugins, permissions, native modules) via OTA - those require a new binary submission.

### 12.4 Version Updates

For new version submissions:

1. Bump version in `package.json`
2. Run: `make build-ios-submit`
3. In App Store Connect, create a new version
4. Select the new build
5. Submit for review

---

## 13. Common Rejection Reasons & Fixes

### 13.1 Guideline 5.1.1 - Data Collection and Storage (Privacy)

**Problem:** Missing privacy manifest or incomplete privacy declarations.

**Fix:** Privacy manifests are configured in `app.json → ios.privacyManifests`. Ensure all third-party SDKs also include their privacy manifests. Complete the App Privacy questionnaire in App Store Connect.

### 13.2 Guideline 5.1.2 - Data Use and Sharing

**Problem:** Not clearly describing how user data is used.

**Fix:** Ensure your Privacy Policy URL is valid and comprehensive. Complete all App Privacy declarations in App Store Connect.

### 13.3 Guideline 2.1 - App Completeness

**Problem:** App crashes, has broken links, or includes placeholder content.

**Fix:** Test all flows thoroughly. Ensure all WebView URLs (`https://template-apperp.com/terms`, account deletion page) are accessible. Test on both iPhone and iPad.

### 13.4 Guideline 4.0 - Design (Login Requirements)

**Problem:** App requires login but doesn't offer account creation or demo mode.

**Fix:** The app includes both login and registration. Provide demo credentials to the App Store review team.

### 13.5 Guideline 5.1.1 (v2) - Account Deletion

**Problem:** Apple requires that apps offering account creation must also offer account deletion.

**Fix:** The app has an account deletion flow at `(core)/account-deletion.tsx` accessible from Settings. Ensure the web page at `https://template-apperp.com/dashboard/company-settings?tab=account-deletion` works correctly.

### 13.6 Guideline 2.5.4 - Background Modes

**Problem:** App declares `UIBackgroundModes` but doesn't actually use them.

**Fix:** The app uses `remote-notification` background mode for push notifications, which is legitimate. Do not declare any unused background modes.

### 13.7 Guideline 5.1.2 - Permission Requests

**Problem:** Permission descriptions are too vague or not relevant to the app's functionality.

**Fix:** All permission descriptions in `app.json → ios.infoPlist` clearly explain why each permission is needed with specific use cases.

---

## 14. Troubleshooting

### Build Fails

```bash
# Check build logs
eas build:list --platform ios

# View detailed logs for a specific build
eas build:view <BUILD_ID>
```

### Credential Issues

```bash
# Reset and reconfigure iOS credentials
eas credentials --platform ios

# Clear cached credentials
eas credentials --platform ios --clear
```

### Push Notification Not Working

1. Verify APNs key is uploaded: `eas credentials --platform ios`
2. Ensure `enableBackgroundRemoteNotifications` is `true` in the expo-notifications plugin config
3. Confirm `UIBackgroundModes` includes `remote-notification`
4. Test on a physical device (not simulator)
5. Check that notification permissions are granted in iOS Settings

### Submission Rejected

1. Read the rejection reason carefully in **App Store Connect → Resolution Center**
2. Fix the identified issues
3. Resubmit by creating a new build or updating metadata
4. Reply to the review team with a clear explanation of changes

### "Missing Compliance" Warning

When submitting, you may be asked about **Export Compliance** (encryption):

- If your app only uses HTTPS (which Starter Kit does via axios), select **"Yes"** for using encryption
- Then select **"Yes"** for the exemption (standard HTTPS/TLS encryption is exempt)
- This avoids needing an ERN (Encryption Registration Number)

Alternatively, add to `app.json → ios.infoPlist`:

```json
{
  "ITSAppUsesNonExemptEncryption": false
}
```

This tells Apple the app only uses standard encryption and automates compliance.

---

## Quick Reference - Command Cheat Sheet

```bash
# Build for iOS
make build-ios-production      # Production build
make build-ios-dev             # Development client build
make build-ios-simulator       # Simulator build
make build-ios-submit          # Build + auto submit to App Store

# Submit to App Store
make submit-ios                # Submit latest production build

# Build both platforms
make build-all-production      # Android + iOS production
make build-all-submit          # Android + iOS build + submit

# Manage credentials
eas credentials --platform ios

# Push OTA update (JS-only changes)
eas update --branch production --message "description"

# Check build status
eas build:list --platform ios
```

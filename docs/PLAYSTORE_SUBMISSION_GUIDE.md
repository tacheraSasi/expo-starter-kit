# Starter Kit — Complete Google Play Store Submission Guide

This guide walks you through every step of submitting the Starter Kit app to the Google Play Store using **Expo Application Services (EAS)**, from configuring environment variables to publishing your release.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Configure Environment Variables for EAS](#2-configure-environment-variables-for-eas)
3. [EAS Build Configuration](#3-eas-build-configuration)
4. [Build for Production](#4-build-for-production)
5. [Google Play Console Setup](#5-google-play-console-setup)
6. [Create Your App in Google Play Console](#6-create-your-app-in-google-play-console)
7. [Fill Out the Store Listing](#7-fill-out-the-store-listing)
8. [Content Rating Questionnaire](#8-content-rating-questionnaire)
9. [Data Safety Section](#9-data-safety-section)
10. [App Content and Target Audience](#10-app-content-and-target-audience)
11. [Ads Declaration](#11-ads-declaration)
12. [App Access Instructions](#12-app-access-instructions)
13. [Pricing and Distribution](#13-pricing-and-distribution)
14. [Upload Your Build and Create a Release](#14-upload-your-build-and-create-a-release)
15. [Automated Submission with EAS Submit](#15-automated-submission-with-eas-submit)
16. [App Review Process](#16-app-review-process)
17. [Post-Launch Checklist](#17-post-launch-checklist)
18. [Updating Your App](#18-updating-your-app)
19. [Troubleshooting](#19-troubleshooting)
20. [Quick Reference Commands](#20-quick-reference-commands)

---

## 1. Prerequisites

Before you begin, make sure you have the following ready:

### Accounts

| Requirement | Details |
|---|---|
| **Expo Account** | Sign up at [expo.dev](https://expo.dev). The project owner is `template-app2024`. |
| **Google Play Developer Account** | Register at [play.google.com/console](https://play.google.com/console). One-time fee of **$25 USD**. |
| **EAS CLI** | Install globally: `npm install -g eas-cli` |

### Tools

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Verify installation
eas --version

# Log in to your Expo account
eas login
```

### Project Verification

```bash
# Ensure the project is linked to the correct Expo project
eas project:info
```

You should see:
- **Owner**: `template-app2024`
- **Slug**: `akili-soft`
- **Project ID**: `2de23c10-25cf-4a4b-8adc-36020bdce16f`

---

## 2. Configure Environment Variables for EAS

Starter Kit uses `EXPO_PUBLIC_*` environment variables for runtime configuration. For production builds, these must be set as **EAS Secrets** so they are injected at build time.

### 2.1 Understanding EAS Environment Variables

EAS supports two types of environment variables:

| Type | Prefix | Accessible At | Use Case |
|---|---|---|---|
| **Public** | `EXPO_PUBLIC_` | Build time + runtime (bundled into JS) | API URLs, feature flags |
| **Secret** | No prefix | Build time only (native code, configs) | API keys, signing credentials |

> **Important**: All `EXPO_PUBLIC_` variables are embedded in the JavaScript bundle and visible to users. Never put truly secret values (passwords, private keys) in `EXPO_PUBLIC_` variables.

### 2.2 Set Production Environment Variables on EAS

Push each production environment variable to EAS using the CLI:

```bash
# Required: API Configuration
eas secret:create --name EXPO_PUBLIC_API_URL --value "https://api.template-app.com" --scope project
eas secret:create --name EXPO_PUBLIC_API_VERSION --value "v1" --scope project
eas secret:create --name EXPO_PUBLIC_ENVIRONMENT --value "production" --scope project

# Required: Auth Configuration
eas secret:create --name EXPO_PUBLIC_AUTH_DOMAIN --value "auth.template-app.com" --scope project

# Required: Storage Configuration
eas secret:create --name EXPO_PUBLIC_STORAGE_BUCKET --value "your-production-bucket" --scope project

# Required: Mobile API Credentials
eas secret:create --name EXPO_PUBLIC_MOBILE_API_KEY --value "your-production-api-key" --scope project
eas secret:create --name EXPO_PUBLIC_MOBILE_API_SECRET --value "your-production-api-secret" --scope project

# Required: Feature Flags
eas secret:create --name EXPO_PUBLIC_ENABLE_ANALYTICS --value "true" --scope project
eas secret:create --name EXPO_PUBLIC_ENABLE_CRASH_REPORTING --value "true" --scope project

# Required: Debug (disable for production)
eas secret:create --name EXPO_PUBLIC_DEBUG --value "false" --scope project

# Optional: Social Media / OAuth
eas secret:create --name EXPO_PUBLIC_GOOGLE_CLIENT_ID --value "your-google-client-id" --scope project
eas secret:create --name EXPO_PUBLIC_FACEBOOK_APP_ID --value "your-facebook-app-id" --scope project

# Optional: Analytics
eas secret:create --name EXPO_PUBLIC_GOOGLE_ANALYTICS_ID --value "your-ga-id" --scope project
eas secret:create --name EXPO_PUBLIC_MIXPANEL_TOKEN --value "your-mixpanel-token" --scope project
```

### 2.3 Verify Secrets

```bash
# List all secrets to verify they were set correctly
eas secret:list
```

### 2.4 Update or Delete Secrets

```bash
# Update an existing secret (delete and recreate)
eas secret:delete --name EXPO_PUBLIC_API_URL
eas secret:create --name EXPO_PUBLIC_API_URL --value "https://new-api.template-app.com" --scope project

# Or use the push command to update
eas secret:push --env-file .env.production --scope project
```

### 2.5 Bulk Push from a File

Create a `.env.production` file (do **not** commit this file):

```bash
# .env.production
EXPO_PUBLIC_API_URL=https://api.template-app.com
EXPO_PUBLIC_API_VERSION=v1
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_AUTH_DOMAIN=auth.template-app.com
EXPO_PUBLIC_STORAGE_BUCKET=your-production-bucket
EXPO_PUBLIC_MOBILE_API_KEY=your-production-api-key
EXPO_PUBLIC_MOBILE_API_SECRET=your-production-api-secret
EXPO_PUBLIC_ENABLE_ANALYTICS=true
EXPO_PUBLIC_ENABLE_CRASH_REPORTING=true
EXPO_PUBLIC_DEBUG=false
```

Push all at once:

```bash
eas secret:push --env-file .env.production --scope project
```

> **Security**: Ensure `.env.production` is listed in `.gitignore` and never committed to version control.

---

## 3. EAS Build Configuration

### 3.1 Understanding Build Profiles

The `eas.json` file defines build profiles. Here's what each profile does:

| Profile | Purpose | Output | Use Case |
|---|---|---|---|
| `preview` | Internal testing | `.apk` file | Share with testers directly |
| `production` | Play Store release | `.aab` file (default) | Upload to Google Play |

### 3.2 Current `eas.json` Configuration

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account-key.json",
        "track": "internal"
      }
    }
  }
}
```

Key settings for production:
- **`autoIncrement`**: Automatically increments the `versionCode` on each build, which is required by Google Play.
- **Output format**: Production builds default to `.aab` (Android App Bundle), which is required by Google Play.

### 3.3 Set Up Android App Signing

EAS manages your app signing key automatically. On the **first production build**, EAS will:

1. Generate a new Android Keystore
2. Store it securely on Expo's servers
3. Use it for all subsequent builds

> **Critical**: If you already have a keystore (e.g., from a previous build), you can upload it:
> ```bash
> eas credentials
> ```
> Follow the prompts to select Android → production → Keystore → upload.

---

## 4. Build for Production

### 4.1 Bump Version (Before Each Release)

Update the version in `app.json` before building:

```bash
# Using the project's version bump tool
make update-version
```

Or manually edit `app.json`:
```json
{
  "expo": {
    "version": "1.0.12"
  }
}
```

> **Note**: `version` is the user-facing version (e.g., `1.0.12`). The `versionCode` (integer for Google Play) is auto-incremented by EAS when `autoIncrement` is set to `true`.

### 4.2 Start the Production Build

```bash
# Build AAB for Google Play Store
eas build --platform android --profile production
```

Or use the Makefile shortcut:

```bash
make build-production
```

### 4.3 Monitor the Build

After running the build command:

1. EAS shows a build URL — open it to monitor progress
2. Build typically takes **10–20 minutes**
3. Once complete, you can download the `.aab` file

```bash
# Check build status
eas build:list --platform android

# Download the latest build artifact
eas build:list --platform android --status finished --limit 1
```

### 4.4 Download the AAB

```bash
# The build URL will be displayed after completion
# You can also find it at: https://expo.dev/accounts/template-app2024/projects/akili-soft/builds
```

---

## 5. Google Play Console Setup

### 5.1 Create a Google Play Developer Account

1. Go to [play.google.com/console/signup](https://play.google.com/console/signup)
2. Sign in with the Google account you want to use as the developer account
3. Accept the Developer Distribution Agreement
4. Pay the one-time **$25 USD** registration fee
5. Complete your developer profile:
   - **Developer name**: `Starter Kit Limited`
   - **Email address**: Your support email
   - **Phone number**: Your contact number
   - **Website**: `https://template-app.com` (if available)

### 5.2 Set Up a Google Cloud Service Account (for automated submissions)

To use `eas submit` for automated uploads:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Go to **IAM & Admin** → **Service Accounts**
4. Click **Create Service Account**:
   - Name: `eas-submit`
   - Description: `EAS automated Play Store submissions`
5. Click **Create and Continue**
6. Skip the role assignment (we'll do this in Play Console)
7. Click **Done**
8. Click on the service account → **Keys** tab → **Add Key** → **Create new key** → **JSON**
9. Download the JSON key file and save it as `google-service-account-key.json` in the project root

> **Security**: Add `google-service-account-key.json` to `.gitignore`. Never commit this file.

10. Go to **Google Play Console** → **Settings** → **API access**
11. Click **Link** to link your Google Cloud project
12. Find your service account and click **Manage Play Console permissions**
13. Grant the following permissions:
    - **App access**: Add the Starter Kit app (or grant access to all apps)
    - **Account permissions**:
      - ✅ View app information and download bulk reports
      - ✅ Create, edit, and delete draft apps
      - ✅ Release to production, exclude devices, and use Play App Signing
      - ✅ Release apps to testing tracks
      - ✅ Manage testing tracks and edit tester lists
14. Click **Invite user** → **Send invite**

---

## 6. Create Your App in Google Play Console

### 6.1 Create the App

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **Create app**
3. Fill in the details:

| Field | Value |
|---|---|
| **App name** | `Starter Kit` |
| **Default language** | English (United States) - en-US |
| **App or game** | App |
| **Free or paid** | Free *(or Paid if applicable)* |

4. Check the declarations:
   - ✅ Developer Program Policies
   - ✅ US export laws
5. Click **Create app**

---

## 7. Fill Out the Store Listing

Navigate to **Grow** → **Store presence** → **Main store listing**.

### 7.1 App Details

| Field | Value | Notes |
|---|---|---|
| **App name** | `Starter Kit` | Max 30 characters |
| **Short description** | `Batteries-included Expo starter with offline mock API.` | Max 80 characters |
| **Full description** | See below | Max 4000 characters |

#### Suggested Full Description

```
Starter Kit is a batteries-included Expo starter with auth, theming (light/dark/system), offline-ready caching, push
notifications, OTA updates, biometric app lock, and multi-language support
(English + Swahili) — all running against a built-in mock API so you can
evaluate it with no backend.

KEY FEATURES:

🔐 Auth demo — sign in with any email
🎨 Theming — light, dark, and system modes with semantic tokens
📡 Offline-ready — persistent cache, offline banner, retry states
🔔 Notifications — push registration + deep-link routing skeleton
🌍 Multi-language — English + Swahili, lazy-loaded
```

### 7.2 Graphics Assets

You need to prepare and upload the following:

| Asset | Requirements | Notes |
|---|---|---|
| **App icon** | 512 × 512 px, PNG, 32-bit, up to 1 MB | Already exists: `assets/images/android/play_store_512.png` |
| **Feature graphic** | 1024 × 500 px, PNG or JPEG | Displayed at the top of the store listing. Create one showcasing the app. |
| **Phone screenshots** | Min 2, max 8. Min 320px, max 3840px on any side, 16:9 or 9:16 aspect ratio | Take screenshots from different screens of the app |
| **7-inch tablet screenshots** | Optional but recommended. Same specs as phone. | |
| **10-inch tablet screenshots** | Optional but recommended. Same specs as phone. | |

#### How to Take Screenshots

```bash
# Run the app in an emulator or on a physical device
bun start

# Take screenshots of key screens:
# 1. Onboarding flow
# 2. Login screen
# 3. Home screen
# 4. Demo list (pagination)
# 5. Settings screen
# 6. Profile screen

# Use the emulator's screenshot tool or:
adb exec-out screencap -p > screenshot.png
```

### 7.3 Categorization

| Field | Value |
|---|---|
| **App category** | Business |
| **Tags** | Starter, Template, Offline, Auth |

### 7.4 Contact Details

| Field | Value |
|---|---|
| **Email** | Your support email (required) |
| **Phone** | Your support phone number (optional) |
| **Website** | `https://template-app.com` (optional) |

---

## 8. Content Rating Questionnaire

Navigate to **Policy** → **App content** → **Content rating**.

Google uses the **IARC (International Age Rating Coalition)** system. You'll answer a questionnaire about your app's content.

### 8.1 Start the Questionnaire

1. Click **Start questionnaire**
2. Enter your **email address**
3. Select your **app category**: **Utility, Productivity, Communication, or Other**

### 8.2 Answer the Questions

For Starter Kit (a utility/template app), here are the recommended answers:

| Question | Answer | Reason |
|---|---|---|
| **Does the app contain violence?** | No | Business app, no violent content |
| **Does the app contain sexual content or nudity?** | No | Business app |
| **Does the app promote or facilitate the sale of marijuana/drugs?** | No | Utility template only |
| **Does the app contain profanity or crude humor?** | No | Professional business app |
| **Does the app allow users to interact or exchange information?** | No | *(Unless Starter Kit has chat/messaging)* |
| **Does the app share the user's location with other users?** | No | Location is used for maps/stores, not shared |
| **Does the app allow users to purchase digital goods?** | No | *(Unless the app has in-app purchases)* |
| **Does the app contain gambling elements?** | No | Business app |
| **Does the app contain simulated gambling?** | No | Business app |
| **Does the app contain horror or fear-inducing content?** | No | Business app |
| **Does the app allow users to create content?** | No | *(Unless the app has UGC features)* |
| **Does the app contain references to tobacco, alcohol?** | No | Business app |
| **Does the app contain real or realistic violence?** | No | Business app |

### 8.3 Rating Result

After completing the questionnaire, you'll receive ratings from multiple organizations:
- **ESRB**: Likely **Everyone**
- **PEGI**: Likely **PEGI 3**
- **USK**: Likely **0+**
- **IARC Generic**: Likely **3+**

Click **Apply rating** to confirm.

---

## 9. Data Safety Section

Navigate to **Policy** → **App content** → **Data safety**.

This is a critical section where you declare what data your app collects and how it's used. Be accurate — Google reviews this.

### 9.1 Data Collection Overview

Click **Start** and answer the initial questions:

| Question | Answer | Reason |
|---|---|---|
| **Does your app collect or share any user data?** | **Yes** | The app collects location, authentication data |
| **Is all data encrypted in transit?** | **Yes** | API calls should use HTTPS |
| **Do you provide a way for users to request data deletion?** | **Yes** | *(Ensure this is available in your backend)* |

### 9.2 Data Types Collected

For each data type, declare whether it's **collected** and/or **shared**:

#### Location

| Field | Value |
|---|---|
| **Approximate location** | ✅ Collected, ❌ Not shared |
| **Precise location** | ✅ Collected, ❌ Not shared |
| **Purpose** | App functionality (showing nearby stores on map) |
| **Is this data required?** | No (app works without location) |
| **Is processing ephemeral?** | Yes (not stored permanently) |

#### Personal Info

| Field | Value |
|---|---|
| **Name** | ✅ Collected, ❌ Not shared |
| **Email address** | ✅ Collected, ❌ Not shared |
| **Phone number** | Depends on your auth flow |
| **Purpose** | Account management, App functionality |
| **Is this data required?** | Yes (required for authentication) |

#### Financial Info

| Field | Value |
|---|---|
| **Purchase history** | ❌ Not collected |
| **Purpose** | App functionality |
| **Is this data required?** | No |

#### App Activity

| Field | Value |
|---|---|
| **App interactions** | ✅ Collected (if analytics enabled), ❌ Not shared |
| **Purpose** | Analytics |
| **Is this data required?** | No |

#### Device or Other IDs

| Field | Value |
|---|---|
| **Device or other IDs** | ✅ Collected (push notification tokens), ❌ Not shared |
| **Purpose** | App functionality (notifications) |
| **Is this data required?** | No |

### 9.3 Data Handling Practices

| Question | Answer |
|---|---|
| **Is data encrypted in transit?** | Yes |
| **Can users request data deletion?** | Yes |
| **Is the app compliant with the Families Policy?** | N/A (not a children's app) |

Click **Save** and then **Submit**.

---

## 10. App Content and Target Audience

Navigate to **Policy** → **App content** → **Target audience and content**.

### 10.1 Target Age Group

| Question | Answer |
|---|---|
| **Target age group** | **18 and over** *(Business professionals)* |
| **Does your app appeal to children?** | **No** |

> **Important**: Do NOT select any age group under 13 unless your app is specifically designed for children and complies with the Families Policy. Starter Kit is a business app and should target 18+.

### 10.2 Store Presence

| Question | Answer |
|---|---|
| **Is your app made specifically for children?** | No |
| **Does your app unintentionally appeal to children?** | No |

---

## 11. Ads Declaration

Navigate to **Policy** → **App content** → **Ads**.

| Question | Answer |
|---|---|
| **Does your app contain ads?** | **No** *(Unless you've added ads)* |

If your app does contain ads, you must:
- Declare the ad SDKs used
- Comply with Google's ad policies
- If targeting children, use only certified ad networks

---

## 12. App Access Instructions

Navigate to **Policy** → **App content** → **App access**.

Since Starter Kit requires authentication to use:

1. Select **All or some functionality is restricted**
2. Click **Add new instructions**
3. Provide test/demo credentials:

| Field | Value |
|---|---|
| **Name** | Starter Kit Demo Account |
| **Username/email** | *(Provide a demo account email)* |
| **Password** | *(Provide the demo account password)* |
| **Other instructions** | `Demo mode: sign in with any email address. All OTP codes are 123456.` |

> **Important**: Google reviewers need to be able to log in and test your app. Without valid credentials, your app will be rejected.

---

## 13. Pricing and Distribution

### 13.1 Countries/Regions

Navigate to **Grow** → **Store presence** → **Main store listing** → **Manage countries/regions**.

1. Click **Add countries/regions**
2. Select the countries where you want to distribute:
   - Publish worldwide, or limit to your launch countries
   - Or select **All countries** for worldwide distribution
3. Click **Add countries/regions**

### 13.2 Pricing

Navigate to **Monetize** → **Products** → **App pricing**.

| Setting | Value |
|---|---|
| **App pricing** | Free *(or set a price if applicable)* |

> **Warning**: If you set the app as **Free**, you cannot change it to **Paid** later. You would need to create a new app listing.

---

## 14. Upload Your Build and Create a Release

### 14.1 Manual Upload

1. Navigate to **Release** → **Testing** → **Internal testing** (recommended for first release)
2. Click **Create new release**
3. **App signing**: Google Play will manage your app signing (recommended)
   - On first upload, you'll set up Play App Signing
   - Click **Continue** to accept
4. **Upload your AAB**:
   - Download the `.aab` file from [EAS builds dashboard](https://expo.dev/accounts/template-app2024/projects/akili-soft/builds)
   - Drag and drop the `.aab` file or click **Upload**
5. **Release details**:
   - **Release name**: Auto-generated (e.g., `1.0.12 (1)`)
   - **Release notes**: Describe what's in this release

#### Suggested Release Notes (for first release)

```
Initial release of Starter Kit.

• Point of Sale (POS) system for fast transactions
• Interactive maps to find nearby stores
• Real-time push notifications
• Multi-language support (English & Swahili)
• Secure authentication
```

6. Click **Review release**
7. Review any warnings or errors
8. Click **Start rollout to Internal testing**

### 14.2 Testing Tracks

Google Play has multiple release tracks:

| Track | Purpose | Audience |
|---|---|---|
| **Internal testing** | Quick testing, no review needed | Up to 100 testers you specify |
| **Closed testing** | Broader testing | Testers you invite via email or link |
| **Open testing** | Public beta | Anyone can join |
| **Production** | Full public release | All users |

**Recommended release path**:
1. **Internal testing** → Fix bugs → 
2. **Closed testing** → Get feedback →
3. **Production** (you can skip Open testing)

### 14.3 Add Testers (Internal Testing)

1. Go to **Release** → **Testing** → **Internal testing**
2. Click the **Testers** tab
3. Create a new email list or select an existing one
4. Add tester email addresses (must be Google accounts)
5. Share the opt-in link with testers

---

## 15. Automated Submission with EAS Submit

Instead of manually downloading and uploading the AAB, you can automate with `eas submit`.

### 15.1 Configure EAS Submit

The `eas.json` file includes a `submit` section:

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account-key.json",
        "track": "internal"
      }
    }
  }
}
```

### 15.2 Run EAS Submit

```bash
# Submit the latest production build to Google Play (internal testing track)
eas submit --platform android --profile production

# Or build and submit in one command
eas build --platform android --profile production --auto-submit
```

### 15.3 Change the Track

To submit to different tracks, modify `eas.json` or use the CLI flag:

```bash
# Submit to closed testing (alpha)
eas submit --platform android --profile production

# In eas.json, change "track" to one of:
# "internal" - Internal testing
# "alpha" - Closed testing
# "beta" - Open testing
# "production" - Production release
```

### 15.4 Build and Submit Together

Use the Makefile shortcut:

```bash
# Build AAB and auto-submit to Play Store
make build-submit
```

---

## 16. App Review Process

### 16.1 What to Expect

| Stage | Timeline | Notes |
|---|---|---|
| **Internal testing** | Minutes | No Google review required |
| **Closed/Open testing** | A few hours to a few days | Google reviews the app |
| **First Production release** | Up to 7 days | Thorough review for new apps |
| **Subsequent updates** | 1–3 days | Faster for established apps |

### 16.2 Common Rejection Reasons and How to Avoid Them

| Reason | Solution |
|---|---|
| **No login credentials provided** | Always provide demo/test account credentials in App Access |
| **Crashes on launch** | Test thoroughly on multiple devices/emulators before submitting |
| **Missing privacy policy** | Add a privacy policy URL to your store listing |
| **Incomplete store listing** | Fill in ALL required fields (description, screenshots, etc.) |
| **Permissions not justified** | Only request permissions you actually use and explain why |
| **Data safety inaccurate** | Accurately declare all data you collect |
| **Broken features** | Ensure all advertised features work as expected |
| **Placeholder content** | Replace all placeholder text and images (e.g., `YOUR_GOOGLE_MAPS_API_KEY`) |

### 16.3 If Your App Is Rejected

1. Read the rejection email carefully — Google describes the specific violation
2. Fix the issues mentioned
3. Build a new version with the fixes
4. Resubmit
5. Reply to the appeal if you believe the rejection was a mistake

---

## 17. Post-Launch Checklist

After your app is published, complete these tasks:

- [ ] **Verify the listing**: Search for "Starter Kit" on Google Play and confirm it appears correctly
- [ ] **Test the download**: Download and install the app from Google Play on a real device
- [ ] **Monitor crashes**: Check **Quality** → **Android Vitals** in Play Console
- [ ] **Monitor reviews**: Check **Ratings and reviews** regularly and respond to user feedback
- [ ] **Set up alerts**: Configure email alerts for reviews, crashes, and policy issues in Play Console settings
- [ ] **Enable pre-registration** (if planning a major update): Allows users to sign up for notifications

---

## 18. Updating Your App

### 18.1 Release a New Version

```bash
# 1. Bump the version number
make update-version

# 2. Build the new production AAB
eas build --platform android --profile production

# 3. Submit to Google Play
eas submit --platform android --profile production

# Or do steps 2 and 3 together:
make build-submit
```

### 18.2 Staged Rollouts

For production releases, use staged rollouts to minimize risk:

1. Go to **Release** → **Production**
2. Create a new release with the updated AAB
3. Set the rollout percentage (e.g., start with 10%)
4. Monitor crashes and feedback
5. Gradually increase to 100%

### 18.3 Over-the-Air (OTA) Updates

For minor JavaScript-only changes, you can use EAS Update to push updates without a new Play Store release:

```bash
# Push an OTA update to production
eas update --branch production --message "Fix: corrected translation typo"
```

> **Note**: OTA updates only work for JavaScript/asset changes. Native code changes (new permissions, new native modules) require a full build and Play Store release.

---

## 19. Troubleshooting

### Build Fails

```bash
# View build logs
eas build:list --platform android --status errored

# Clear cache and rebuild
eas build --platform android --profile production --clear-cache
```

### Environment Variables Not Working

```bash
# Verify secrets are set
eas secret:list

# Ensure variable names match exactly (case-sensitive)
# Variables must be prefixed with EXPO_PUBLIC_ to be accessible in JS
```

### Version Code Conflict

If Google Play rejects your AAB because of a duplicate `versionCode`:

```bash
# EAS auto-increment handles this, but if you need to set it manually,
# add to app.json:
# "android": { "versionCode": 15 }

# Or ensure autoIncrement is enabled in eas.json:
# "production": { "autoIncrement": true }
```

### App Not Appearing on Play Store

- New apps can take a few hours to appear in search results after publishing
- Ensure you've selected the correct countries/regions
- Check that the app status is "Published" in Play Console

### Google Maps Not Working

Replace the placeholder API key in `app.json`:

```json
"config": {
  "googleMaps": {
    "apiKey": "YOUR_ACTUAL_GOOGLE_MAPS_API_KEY"
  }
}
```

To get a key:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the **Maps SDK for Android** API
3. Create an API key and restrict it to Android apps with your package name (`com.template.starter`)

---

## 20. Quick Reference Commands

```bash
# === Account & Project ===
eas login                                    # Log in to Expo
eas project:info                             # View project details

# === Environment Variables ===
eas secret:list                              # List all secrets
eas secret:create --name KEY --value VAL --scope project  # Create a secret
eas secret:delete --name KEY                 # Delete a secret
eas secret:push --env-file .env.production --scope project  # Bulk push secrets

# === Building ===
make build-apk                               # Build APK for testing
make build-production                        # Build AAB for Play Store
eas build --platform android --profile production  # Same as above
eas build:list --platform android            # List all builds

# === Submitting ===
eas submit --platform android --profile production  # Submit to Play Store
make build-submit                            # Build + auto-submit

# === Credentials ===
eas credentials                              # Manage signing credentials

# === OTA Updates ===
eas update --branch production --message "description"  # Push OTA update

# === Version Management ===
make update-version                          # Bump version number
```

---

## Complete Workflow Summary

Here is the end-to-end workflow from development to Play Store:

```
1. Development Complete
        │
        ▼
2. Push Environment Variables to EAS
   └── eas secret:push --env-file .env.production --scope project
        │
        ▼
3. Bump Version
   └── make update-version
        │
        ▼
4. Build Production AAB
   └── eas build --platform android --profile production
        │
        ▼
5. (First time) Set Up Google Play Console
   └── Create app, fill store listing, content rating, data safety
        │
        ▼
6. Submit to Internal Testing
   └── eas submit --platform android --profile production
        │
        ▼
7. Test with Internal Testers
   └── Fix bugs, iterate
        │
        ▼
8. Promote to Production
   └── Google Play Console → Release → Production → Create release
        │
        ▼
9. Google Review (1-7 days for first release)
        │
        ▼
10. App Published on Play Store! 🎉
```

---

## Privacy Policy Requirement

Google Play **requires** a privacy policy URL for apps that collect user data. You must:

1. Create a privacy policy page hosted at a public URL (e.g., `https://template-app.com/privacy`)
2. The policy must describe:
   - What data you collect (location, personal info, financial data)
   - How you use the data
   - How you store and protect the data
   - How users can request data deletion
   - Third-party services used (Google Maps, analytics, etc.)
3. Add the URL in:
   - **Google Play Console** → Store listing → Privacy policy
   - **app.json** → (recommended to link in the app too)

---

*Guide last updated: March 2026*
*Starter Kit Version: 1.0.11*
*Expo SDK: 54*
*EAS CLI: latest*

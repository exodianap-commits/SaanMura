# SaanMura Mobile — Android Build & Deployment Guide

This guide details how to build and release the **SaanMura Mobile Application** for Android devices, targeting Android 14+ (API 34) while maintaining backward compatibility down to Android 8.0 (API 26).

---

## 1. Prerequisites

- **Node.js**: v20+ or v24+
- **pnpm**: v9+ or v11+
- **Java Development Kit (JDK)**: OpenJDK 17 (recommended for Expo SDK 52)
- **Android Studio & SDK**:
  - Android SDK Platform 34
  - Android SDK Build-Tools 34.0.0
  - Android NDK (Side by side) 26.1.10909125
  - Android Emulator with Google Play Services

Set environment variables in your system profile:
```bash
# Windows PowerShell
$env:ANDROID_HOME = "C:\Users\<User>\AppData\Local\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH += ";$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\platform-tools"
```

---

## 2. Local Development & Testing

Run the Expo development server:
```bash
# In apps/mobile/ or from monorepo root:
pnpm --filter @saanmura/mobile start

# Or directly launch Android emulator:
pnpm --filter @saanmura/mobile android
```

Press `a` in the terminal to launch on your connected Android device or emulator.

---

## 3. Generating Android Production APK / AAB with EAS Build

We use Expo Application Services (EAS) for automated, reproducible cloud or local Android builds.

### Step 3.1: Install EAS CLI
```bash
pnpm add -g eas-cli
eas login
```

### Step 3.2: Configure `eas.json`
Inside `apps/mobile/eas.json`:
```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-production.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your_anon_key"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-production.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your_anon_key"
      }
    }
  }
}
```

### Step 3.3: Build Standalone APK for Sideloading & Testing
```bash
cd apps/mobile
eas build -p android --profile preview
```
This produces an installable `.apk` file that can be distributed to field scouts and palengke verifiers.

### Step 3.4: Build Google Play Store Android App Bundle (.aab)
```bash
cd apps/mobile
eas build -p android --profile production
```

---

## 4. Local Native Compilation (Offline / Self-Hosted)

To generate the native Android project without cloud services:
```bash
cd apps/mobile
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```
The output APK will be generated at:
`apps/mobile/android/app/build/outputs/apk/release/app-release.apk`.

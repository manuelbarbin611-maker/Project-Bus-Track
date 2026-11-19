# BusTrackMobile Build Pipeline

This document describes how to build the BusTrackMobile app for Android and iOS distribution.

---

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **EAS CLI** (installed globally via `npm install -g eas-cli`)
- **Expo account** (free at https://expo.dev)
- For local build fallback only: Android Studio with Android SDK installed

---

## Quick Start (Recommended: EAS Cloud Build)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Log in to Expo:**
   ```bash
   eas login
   ```

3. **Configure the project for EAS:**
   ```bash
   eas build:configure
   ```
   This creates `eas.json` and links the project to your Expo dashboard.

4. **Build the APK:**
   ```bash
   eas build --platform android --profile production
   ```

5. **Download the APK:**
   - Visit your project's build page on the Expo dashboard (https://expo.dev)
   - Navigate to the build artifacts
   - Download the APK file

---

## iOS Build (EAS Cloud Build Only)

iOS builds require a Mac and Xcode for local builds, but EAS cloud builds work from any platform.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Log in to Expo:**
   ```bash
   eas login
   ```

3. **Configure the project for EAS:**
   ```bash
   eas build:configure
   ```
   This creates `eas.json` and links the project to your Expo dashboard.

4. **Build the iOS app:**
   ```bash
   eas build --platform ios --profile production
   ```

5. **Download the app:**
   - Visit your project's build page on the Expo dashboard (https://expo.dev)
   - Navigate to the build artifacts
   - Download the `.ipa` file

**Note:** For iOS distribution to the App Store, you'll need an Apple Developer account and proper provisioning profiles configured in your EAS project.

---

## Local Build Fallback (Recommended: Android Studio)

If cloud builds are unavailable, the easiest way to build locally is using Android Studio.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate native Android code:**
   ```bash
   npx expo prebuild --platform android
   ```

3. **Open in Android Studio:**
   - Open Android Studio
   - Select **File → Open**
   - Navigate to and select the `android` folder in the project root

4. **Build the APK:**
   - Android Studio will prompt to configure the Android SDK if not set up
   - Once synced, go to **Build → Build Bundle(s) / APK(s) → Build APK(s)**
   - Wait for the build to complete

5. **Locate the APK:**
   - Click the notification that appears when the build completes, or
   - Find it at `android/app/build/outputs/apk/release/app-release.apk`

### Alternative: Command Line Gradle Build

If you prefer the command line and have Android SDK configured:

1. **Configure Android SDK location:**
   - Create or edit `android/local.properties`
   - Add the path to your Android SDK:
     ```
     sdk.dir=C:\\Path\\To\\Android\\SDK
     ```
   - Alternatively, set the `ANDROID_HOME` environment variable.

2. **Build the APK:**
   ```bash
   cd android
   .\gradlew.bat assembleRelease
   ```

3. **Locate the APK:**
   - The APK will be at `android/app/build/outputs/apk/release/app-release.apk`

---

## Configuration Files

### `eas.json`

Build profiles are defined in `eas.json`:
- **development**: For testing with Expo Dev Client (internal distribution)
- **production**: For final APK distribution (store-ready)

### `app.json`

The Android `package` name is set to `com.bustrack.mobile`. Change this if you need a different package identifier.

---

## Troubleshooting

### EAS Build Errors

- **"An Expo user account is required"**: Run `eas login` to authenticate.
- **"Your username, email, or password was incorrect"**: Verify your Expo credentials.
- **"build:configure command failed"**: Ensure you have a stable internet connection and your Expo account is active.

### Local Build Errors

- **"SDK location not found"**: Set `ANDROID_HOME` environment variable or add `sdk.dir` to `android/local.properties`.
- **"Gradle build failed"**: Ensure Android SDK Build Tools 36.0.0 is installed via Android SDK Manager.
- **"Java not found"**: Install JDK 17 or higher and ensure `JAVA_HOME` is set.

### TypeScript Errors

- Run `npx tsc --noEmit` to check for type errors before building.
- The `tsconfig.json` file has been configured to use path aliases (`@/*` and `@app/*`).

---

## Build Verification

After building the APK:

1. Transfer the APK to an Android device.
2. Enable "Install from unknown sources" in device settings.
3. Install the APK.
4. Verify the app launches and the auth flow renders correctly.

---

## Notes

- The project uses Expo SDK 54 with React Native 0.81.5.
- New Architecture is enabled (`newArchEnabled: true` in `app.json`).
- The app uses `expo-router` for file-based routing.

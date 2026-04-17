# MIMO Kiosk UI to APK with Capacitor (Step by Step)

## Goal
Package the kiosk UI at `mimo-kiosk/mimo-frontend` as an Android APK using Capacitor.

This guide assumes:
- Frontend: React + Vite
- OS: Windows
- Output: Debug APK first, then release APK/AAB

---

## 1. Prerequisites

Install the following tools:
1. Node.js 20+ and npm
2. Java JDK 17 (recommended for latest Android Gradle Plugin)
3. Android Studio (with Android SDK, Platform-Tools, Build-Tools)
4. Git

Verify tools:

```powershell
node -v
npm -v
java -version
```

In Android Studio, install:
- Android SDK Platform (latest stable)
- Android SDK Build-Tools (latest)
- Android SDK Platform-Tools
- Android Emulator (optional)

Set environment variables (Windows):
- `ANDROID_HOME` -> `C:\Users\<you>\AppData\Local\Android\Sdk`
- Add to `Path`:
  - `%ANDROID_HOME%\platform-tools`
  - `%ANDROID_HOME%\cmdline-tools\latest\bin`

---

## 2. Open the kiosk project

Project path:
- `mimo-kiosk/mimo-frontend`

Install dependencies:

```powershell
cd c:\Users\HP\Desktop\mimo_demo\mimo-kiosk\mimo-frontend
npm install
```

---

## 3. Add Capacitor packages

Install Capacitor core + CLI:

```powershell
npm install @capacitor/core
npm install -D @capacitor/cli
```

Add Android platform:

```powershell
npm install @capacitor/android
```

---

## 4. Build web assets

Build the Vite app:

```powershell
npm run build
```

For this project, Vite output should be in `dist` by default.

---

## 5. Initialize Capacitor

Run initialization once:

```powershell
npx cap init "MIMO Kiosk" "com.mimo.kiosk"
```

When prompted:
- App Name: `MIMO Kiosk`
- App ID: `com.mimo.kiosk`
- Web Dir: `dist`

If you already have `capacitor.config.*`, skip this step.

---

## 6. Configure Capacitor for kiosk API and Android

Create or update `capacitor.config.ts` in `mimo-kiosk/mimo-frontend`.

Recommended starter config:

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mimo.kiosk',
  appName: 'MIMO Kiosk',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

Notes:
- Keep `webDir: 'dist'` for Vite.
- If kiosk backend uses local HTTP during development, allow cleartext only for debug builds (see Step 10).

---

## 7. Add Android project files

Sync web build into native Android project:

```powershell
npx cap add android
npx cap sync android
```

For later updates after code changes:

```powershell
npm run build
npx cap sync android
```

---

## 8. Open Android Studio

```powershell
npx cap open android
```

Android Studio opens the native project at:
- `mimo-kiosk/mimo-frontend/android`

Wait for Gradle sync to complete.

---

## 9. Build and test debug APK

In Android Studio:
1. Select device/emulator
2. Run app (green play button)

Or build from terminal:

```powershell
cd android
.\gradlew assembleDebug
```

Debug APK output is usually at:
- `android\app\build\outputs\apk\debug\app-debug.apk`

Install with ADB:

```powershell
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

---

## 10. Local network / HTTP API setup (important for kiosk testing)

If your API is not HTTPS in development (for example `http://192.168.x.x:3000`), Android blocks cleartext traffic by default.

Debug-only approach:
1. Create `android/app/src/main/res/xml/network_security_config.xml`
2. Allow your LAN host/IP as cleartext
3. Reference it in `AndroidManifest.xml`

Example `network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">192.168.1.100</domain>
  </domain-config>
</network-security-config>
```

In `AndroidManifest.xml` under `<application ...>`:

```xml
android:networkSecurityConfig="@xml/network_security_config"
android:usesCleartextTraffic="true"
```

Production recommendation:
- Use HTTPS API endpoints and remove broad cleartext allowances.

---

## 11. Create release build

### 11.1 Generate signing key (once)

```powershell
keytool -genkeypair -v -keystore mimo-kiosk-release.keystore -alias mimo_kiosk -keyalg RSA -keysize 2048 -validity 10000
```

Store keystore securely.

### 11.2 Configure signing in Android Studio

1. Build -> Generate Signed Bundle / APK
2. Choose APK (or Android App Bundle)
3. Select keystore, alias, and passwords
4. Choose `release`
5. Build

Release output:
- APK: `android\app\build\outputs\apk\release\app-release.apk`
- AAB: `android\app\build\outputs\bundle\release\app-release.aab`

---

## 12. Kiosk hardening checklist (recommended)

Before production rollout:
1. Lock device to kiosk mode (MDM or Android pinning policy)
2. Disable notification shade and system navigation access where possible
3. Force app auto-start on boot (if device policy allows)
4. Keep backend URL in environment and do not hardcode secrets
5. Add error fallback screen for network outages
6. Add health endpoint checks and retry logic

---

## 13. Typical update workflow

For every new kiosk UI release:

```powershell
cd c:\Users\HP\Desktop\mimo_demo\mimo-kiosk\mimo-frontend
npm install
npm run build
npx cap sync android
cd android
.\gradlew assembleDebug
```

For release builds, use Android Studio signed build flow.

---

## 14. Troubleshooting

### Build fails on Gradle/JDK mismatch
- Use JDK 17 and re-sync Gradle.

### White screen on app launch
- Confirm `dist` exists and `webDir` is `dist`.
- Re-run `npm run build` and `npx cap sync android`.

### API calls fail on device only
- Verify device can reach API host/IP.
- Confirm Android cleartext policy (debug only) or switch to HTTPS.

### Changes not reflected in app
- Always rebuild web assets before syncing:
  - `npm run build`
  - `npx cap sync android`

---

## 15. Suggested next improvements

1. Add `npm` scripts for Capacitor tasks in `mimo-kiosk/mimo-frontend/package.json`.
2. Add CI workflow for signed AAB generation.
3. Add separate debug/prod Capacitor config and API endpoints.

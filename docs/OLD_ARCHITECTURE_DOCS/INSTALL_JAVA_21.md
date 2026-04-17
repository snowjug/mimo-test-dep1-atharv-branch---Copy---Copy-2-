# Install Java 21 (Quick Fix)

## The Issue

The Android build requires Java JDK 21, but you have Java 17 installed.

## Solution 1: Install Java 21 (5 minutes)

### Download Java 21
Choose one:

**Option A: Microsoft OpenJDK 21** (Recommended)
https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-21

Download: `microsoft-jdk-21.0.5-windows-x64.msi`

**Option B: Oracle JDK 21**
https://www.oracle.com/java/technologies/downloads/#java21

Download Windows x64 Installer

### Install
1. Run the installer
2. Accept defaults
3. Installation path will be similar to: `C:\Program Files\Microsoft\jdk-21.0.5.6-hotspot`

### Verify Installation
```powershell
java -version
# Should show: openjdk version "21.0.x"
```

### Build Again
```powershell
cd "F:\vprint\website\printing kiosk lockdown\android"
.\gradlew assembleDebug
```

---

## Solution 2: Use Android Studio (Easier)

Android Studio handles Java versions automatically!

### Open in Android Studio
```powershell
cd "F:\vprint\website\printing kiosk lockdown"
npx cap open android
```

This will:
1. Open Android Studio
2. Auto-download required Java version
3. Let you build with one click

### In Android Studio:
1. Wait for Gradle sync to complete
2. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. APK will be at: `app/build/outputs/apk/debug/app-debug.apk`

---

## Solution 3: Just Use Android Studio to Run

Don't even build APK - run directly on device:

### Steps:
1. Connect Lenovo Tab M9 via USB
2. Enable USB debugging on tablet:
   - Settings → About tablet → Tap "Build number" 7 times
   - Settings → Developer options → Enable "USB debugging"
3. In Android Studio, click the green **Run** button ▶️
4. Select your device
5. App installs and runs automatically!

---

## Recommended: Use Solution 2 or 3 (Android Studio)

**Why?**
- ✅ No manual Java installation needed
- ✅ Handles all dependencies
- ✅ One-click builds
- ✅ Can run directly on device
- ✅ Better debugging tools

**How:**
```powershell
npx cap open android
```

Then click Run ▶️

---

## If You Want to Build APK Without Android Studio

Install Java 21 (Solution 1), then:

```powershell
# Update gradle.properties with new path
# Edit: android/gradle.properties
# Change line 25 to new Java 21 path

# Then build
cd android
.\gradlew assembleDebug
```

---

## Quick Decision Tree

**Do you have Android Studio installed?**
- ✅ Yes → Use Solution 2 or 3 (npx cap open android)
- ❌ No → Install Java 21 (Solution 1)

**Do you want to test on tablet right now?**
- ✅ Yes → Use Solution 3 (Run from Android Studio)
- ❌ No → Use Solution 2 (Build APK)

---

## Next Steps

1. Choose your solution above
2. Follow the steps
3. Get your APK or run on device
4. Test printing!






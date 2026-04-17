# VPrint Kiosk - Quick Start Guide

## 🎉 Implementation Complete!

Your VPrint Kiosk is now a **native Android app** with direct printer integration.

## What You Have

✅ **Native Android App** - Full Capacitor integration  
✅ **Print Plugin** - Custom Java plugin for Android Print Service  
✅ **Smart Detection** - Auto-switches between native/browser mode  
✅ **All Print Settings** - Copies, orientation, color, duplex, paper size  
✅ **UI Indicators** - Shows "Native Android Mode" when running on device  

## Build Your App (3 Steps)

### 1. Build for Android
```powershell
cd "F:\vprint\website\printing kiosk lockdown"
$env:BUILD_MODE = "capacitor"
npm run build
```

### 2. Sync to Android
```powershell
npx cap sync android
```

### 3. Open in Android Studio
```powershell
npx cap open android
```

Then in Android Studio:
- Connect your Lenovo Tab M9 via USB
- Enable USB debugging on tablet
- Click the green "Run" button ▶️

## Or Build APK Manually

```powershell
cd android
.\gradlew assembleDebug
```

APK location: `android\app\build\outputs\apk\debug\app-debug.apk`

## Install on Tablet

### Option 1: Via USB (ADB)
```powershell
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

### Option 2: Direct Install
1. Copy `app-debug.apk` to tablet (USB/cloud)
2. On tablet: Settings → Security → Install unknown apps → Enable for Files
3. Open Files app → tap APK → Install

## Setup on Tablet (First Time)

### 1. Connect to WiFi
- Same network as Brother printer
- Note your tablet's IP (optional)

### 2. Add Printer
- Settings → Connected devices → Printing
- Brother printer should auto-discover
- If not: Add service → Brother iPrint&Scan

### 3. Test Printer
- Open any app → Share → Print
- Select Brother HL-L5210DN
- Verify it prints

### 4. Configure Kiosk Mode

**Easy Way (Screen Pinning):**
1. Settings → Security → Screen Pinning → Enable
2. Open VPrint Kiosk app
3. Tap Overview/Recent button (square)
4. Tap pin icon on app
5. Done! App is locked

**Advanced Way (Fully Kiosk Browser):**
1. Install Fully Kiosk Browser from Play Store
2. Set as launcher
3. Configure kiosk mode
4. More features: motion detection, remote admin

### 5. Power Settings
- Settings → Display → Sleep → Never
- Settings → Battery → Adaptive battery → Off
- Plug in charger permanently

## How to Use

1. User visits your VPrint web app (desktop/mobile)
2. User uploads document and pays
3. User receives QR code
4. **At Kiosk:**
   - Scan QR code on tablet
   - Document appears with preview
   - Review print settings
   - Tap "Print Now"
   - Android print dialog appears
   - Select Brother printer
   - Tap "Print" button
   - Document prints! 🎉

## Print Settings

All settings from payment are automatically applied:
- **Copies:** 1-99
- **Orientation:** Portrait or Landscape
- **Color:** Color or Grayscale
- **Duplex:** Off or Long Edge (double-sided)
- **Paper Size:** A4, A3, or Letter

User just needs to tap "Print" once!

## Troubleshooting

### "Printer not found"
- Check WiFi connection
- Restart printer
- Go to Settings → Printing → Refresh
- Try adding printer by IP address

### "App won't install"
- Enable "Install from unknown sources"
- Check Android version (minimum Android 6.0)
- Try uninstalling old version first

### "Print dialog doesn't show printer"
- Go to Settings → Printing
- Tap "Add service"
- Install Brother iPrint&Scan
- Enable the service
- Restart app

### "APK file not found"
- Make sure you built the APK:
  ```powershell
  cd android
  .\gradlew assembleDebug
  ```
- Check: `android\app\build\outputs\apk\debug\app-debug.apk`

## Development Tips

### Live Reload (Testing)
```powershell
# 1. Start dev server
npm run dev

# 2. Update capacitor.config.ts (temporarily)
server: {
  url: 'http://YOUR_PC_IP:3000',
  cleartext: true
}

# 3. Sync and run
npx cap sync android
npx cap run android
```

Your tablet will now load from your PC - instant updates!

### Make Changes
1. Edit your code
2. `BUILD_MODE=capacitor npm run build`
3. `npx cap sync android`
4. Reload app or rebuild APK

## Production Build (For Final Deployment)

### 1. Create Keystore (First Time Only)
```powershell
keytool -genkey -v -keystore vprint-release.keystore -alias vprint -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configure Signing
Edit `android\app\build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('../../vprint-release.keystore')
            storePassword 'YOUR_PASSWORD'
            keyAlias 'vprint'
            keyPassword 'YOUR_PASSWORD'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### 3. Build Release APK
```powershell
cd android
.\gradlew assembleRelease
```

Output: `android\app\build\outputs\apk\release\app-release.apk`

**⚠️ IMPORTANT:** Back up your keystore file! You need it to update the app.

## Testing Checklist

Before deploying to production:

- [ ] App installs successfully
- [ ] Brother printer appears in print dialog
- [ ] Test print with default settings
- [ ] Test with multiple copies
- [ ] Test landscape orientation
- [ ] Test grayscale printing
- [ ] Test duplex (double-sided)
- [ ] QR code scanning works
- [ ] Document preview shows correctly
- [ ] Firebase connection works
- [ ] Kiosk mode locks properly
- [ ] Tablet doesn't go to sleep
- [ ] Power cable secured

## Cost Comparison

| Approach | You Have | Cost | Setup Time | Silent Print |
|----------|----------|------|------------|--------------|
| **Current Solution** | ✅ Yes | $0 | ✅ Done | ⚠️ 1 tap |
| Raspberry Pi Print Server | ❌ No | $50 | 2-3 hours | ✅ Yes |
| Cloud Print Server | ❌ No | $5-20/mo | 3-4 hours | ✅ Yes |
| Brother SDK Direct | ✅ Yes | $0 | 4-6 hours | ✅ Yes |

**Recommendation:** Start with current solution. If the one-tap confirmation is acceptable, you're done! If you need 100% silent printing, implement Brother SDK next.

## Next Steps

### Immediate (Do Now)
1. ✅ Build APK (see above)
2. ✅ Install on Lenovo Tab M9
3. ✅ Test printing
4. ✅ Enable kiosk mode

### Short Term (This Week)
5. Deploy to production location
6. Test with real customers
7. Monitor for issues
8. Collect feedback

### Future (If Needed)
9. Implement Brother SDK for silent printing
10. Add remote monitoring
11. Set up Google Play distribution
12. Add analytics

## Support

Need help?

**Check logs:**
- Android Studio: View → Tool Windows → Logcat
- Chrome DevTools: chrome://inspect (when device connected)

**Common issues:**
- WiFi not connected → Check network settings
- Printer not found → Restart printer, check WiFi
- App crashes → Check Logcat for errors
- Build fails → Clean build: `.\gradlew clean`

**Files to review:**
- `CAPACITOR_IMPLEMENTATION_COMPLETE.md` - Full details
- `docs/setup/CAPACITOR_ANDROID_SETUP.md` - Complete setup guide
- `android/app/src/main/java/com/vprint/kiosk/plugins/PrintPlugin.java` - Print plugin code

## Success! 🎊

You now have a professional printing kiosk running on your own hardware!

**Features:**
- ✅ Native Android app
- ✅ Direct printer integration  
- ✅ All print settings supported
- ✅ No monthly fees
- ✅ Works offline
- ✅ Professional UI
- ✅ Firebase backend
- ✅ QR code scanning
- ✅ Multi-document support

**Hardware:**
- ✅ Lenovo Tab M9 (you own)
- ✅ Brother HL-L5210DN (you own)
- ✅ Total cost: $0 additional

---

## Quick Command Reference

```powershell
# Build for Capacitor
$env:BUILD_MODE = "capacitor"; npm run build

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android

# Build debug APK
cd android; .\gradlew assembleDebug

# Build release APK
cd android; .\gradlew assembleRelease

# Install via ADB
adb install android\app\build\outputs\apk\debug\app-debug.apk

# Check connected devices
adb devices

# View logs
adb logcat | Select-String "VPrint"
```

**Happy Printing! 🖨️**






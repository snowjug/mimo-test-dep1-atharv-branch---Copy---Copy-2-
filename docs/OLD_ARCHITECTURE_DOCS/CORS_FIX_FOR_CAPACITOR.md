# Fix CORS Error for Capacitor App

## Problem

Your Capacitor app shows this error:
```
Access to fetch at 'https://firebasestorage.googleapis.com/...' 
from origin 'https://vprint.kiosk' has been blocked by CORS policy
```

## Why This Happens

- Capacitor apps use custom origins like `https://vprint.kiosk`
- Firebase Storage only allows requests from web domains by default
- Need to configure Firebase Storage to allow Capacitor origins

---

## Solution 1: Configure Firebase Storage CORS

### Step 1: Create CORS Configuration File

**Create file:** `cors.json`

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "maxAgeSeconds": 3600
  }
]
```

**For production (more secure):**
```json
[
  {
    "origin": [
      "https://vprint.kiosk",
      "capacitor://localhost",
      "http://localhost",
      "https://localhost"
    ],
    "method": ["GET", "HEAD"],
    "maxAgeSeconds": 3600
  }
]
```

### Step 2: Install Google Cloud SDK

**Download:**
https://cloud.google.com/sdk/docs/install

**Install on Windows:**
1. Download `GoogleCloudSDKInstaller.exe`
2. Run installer
3. Follow prompts
4. Restart terminal

### Step 3: Login to Google Cloud

```powershell
gcloud auth login
```

Browser opens → Login with your Google account → Allow access

### Step 4: Set Your Project

```powershell
gcloud config set project YOUR_PROJECT_ID
```

Replace `YOUR_PROJECT_ID` with your Firebase project ID (from Firebase Console)

### Step 5: Apply CORS Configuration

```powershell
gsutil cors set cors.json gs://YOUR_BUCKET_NAME.appspot.com
```

Replace `YOUR_BUCKET_NAME` with your Firebase Storage bucket name.

**Find your bucket name:**
- Firebase Console → Storage → Files
- URL shows: `gs://visionprinttt-1fb8a.appspot.com`
- Bucket name: `visionprinttt-1fb8a`

**Example:**
```powershell
gsutil cors set cors.json gs://visionprinttt-1fb8a.appspot.com
```

### Step 6: Verify CORS Configuration

```powershell
gsutil cors get gs://YOUR_BUCKET_NAME.appspot.com
```

Should show your CORS configuration.

---

## Solution 2: Use Capacitor Filesystem (Better for Native Apps)

Instead of fetching directly, download file using Capacitor's Filesystem API.

### Implementation:

**Update `lib/printService.ts`:**

```typescript
/**
 * Download file using Capacitor Filesystem for CORS-free access
 */
static async downloadFileForPrint(url: string): Promise<string | null> {
  try {
    if (!Capacitor.isNativePlatform()) {
      return url; // Use direct URL on web
    }

    logger.info('PrintService', 'downloadFileForPrint:start', { url });

    // Download file using Capacitor HTTP
    const response = await fetch(url);
    const blob = await response.blob();
    
    // Convert to base64
    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Save to filesystem
    const fileName = `print_${Date.now()}.pdf`;
    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64.split(',')[1], // Remove data:image/png;base64, prefix
      directory: Directory.Cache,
    });

    // Get file URI
    const fileUri = result.uri;
    logger.info('PrintService', 'downloadFileForPrint:success', { fileUri });
    
    return fileUri;
  } catch (error: any) {
    logger.error('PrintService', 'downloadFileForPrint:error', { error: error.message });
    return null;
  }
}

/**
 * Print with Capacitor - Updated to handle CORS
 */
static async printWithCapacitor(job: PrintJob): Promise<{ success: boolean; method: string; error?: string }> {
  try {
    logger.event('PrintService', 'printWithCapacitor:start', { jobId: job.id });
    
    // Check if plugin is available
    const { available } = await Print.isAvailable();
    if (!available) {
      logger.warn('PrintService', 'printWithCapacitor:not-available');
      return { success: false, method: 'capacitor-not-available', error: 'Print plugin not available' };
    }

    // Download file to avoid CORS
    let documentUrl = job.documentUrl;
    if (job.documentUrl.includes('firebasestorage.googleapis.com')) {
      logger.info('PrintService', 'printWithCapacitor:downloading-file');
      const localUrl = await this.downloadFileForPrint(job.documentUrl);
      if (localUrl) {
        documentUrl = localUrl;
      } else {
        // Try direct URL as fallback
        documentUrl = job.documentUrl;
      }
    }

    // Print using the plugin
    const result = await Print.print({
      documentUrl,
      documentName: job.documentName || 'Document',
      settings: {
        copies: job.printSettings.copies || 1,
        orientation: job.printSettings.orientation || 'portrait',
        color: job.printSettings.color ?? false,
        duplex: job.printSettings.duplex ?? false,
        paperSize: job.printSettings.paperSize || 'A4',
      }
    });

    // Cleanup cached file
    if (documentUrl !== job.documentUrl && documentUrl.includes('file://')) {
      try {
        await Filesystem.deleteFile({
          path: documentUrl.split('/').pop() || '',
          directory: Directory.Cache,
        });
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    if (result.success) {
      logger.event('PrintService', 'printWithCapacitor:success', { 
        jobId: job.id,
        printJobId: result.jobId 
      });
      return { success: true, method: 'capacitor-native-print' };
    } else {
      logger.error('PrintService', 'printWithCapacitor:failed', { 
        jobId: job.id,
        error: result.error 
      });
      return { success: false, method: 'capacitor-print-failed', error: result.error };
    }
  } catch (error: any) {
    logger.error('PrintService', 'printWithCapacitor:error', { 
      jobId: job.id,
      error: error.message 
    });
    return { success: false, method: 'capacitor-error', error: error.message };
  }
}
```

---

## Solution 3: Quick Fix - Use Public URL

**Temporary workaround:**

Make Firebase Storage files public:

1. Firebase Console → Storage → Rules
2. Change to:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;  // Allow public read
      allow write: if request.auth != null;
    }
  }
}
```

3. Publish rules

**⚠️ Warning:** This makes all files publicly readable!

---

## Recommended Approach

**For Production: Use Solution 1 (CORS Configuration)**
- Secure
- Proper setup
- Works with Firebase authentication

**For Quick Testing: Use Solution 2 (Filesystem)**
- Works immediately
- No server config needed
- Built into Capacitor

**For Development Only: Use Solution 3 (Public URLs)**
- Quick but insecure
- Only for testing

---

## Fix Firebase Validation Errors

The logs also show:
```
Unsupported field value: undefined (found in field printerError.paperRemaining)
```

**Find and fix** in `lib/printerStatusService.ts`:

```typescript
// Bad:
paperRemaining: printer.paperRemaining

// Good:
paperRemaining: printer.paperRemaining || 0
```

Make sure all fields have default values, not `undefined`.

---

## Testing After Fix

1. Configure CORS or implement Filesystem solution
2. Rebuild app: `npm run build && npx cap sync android`
3. Reinstall APK
4. Test print
5. Check logs: No more CORS errors!

---

## Expected Result

**Before (CORS Error):**
```
Access to fetch... has been blocked by CORS policy
Silent direct print failed
```

**After (Fixed):**
```
[PrintService] printWithCapacitor:start
[PrintService] downloadFileForPrint:success
[PrintService] printWithCapacitor:success
```

Print dialog appears and auto-closes with accessibility service!

---

## Need Help?

**Check if CORS is configured:**
```powershell
gsutil cors get gs://YOUR_BUCKET_NAME.appspot.com
```

**Test file download:**
```
Open browser → Paste document URL → Should download
```

**Check Capacitor logs:**
```powershell
adb logcat | grep -i "PrintService"
```

---

**Choose Solution 1 for production or Solution 2 for quick fix!**






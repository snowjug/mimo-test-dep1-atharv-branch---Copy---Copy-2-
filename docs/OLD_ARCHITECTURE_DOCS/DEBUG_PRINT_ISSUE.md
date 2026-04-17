# Debug Print Dialog Not Appearing

## Issue
Print dialog is not appearing after downloading the file.

## What I Fixed

### 1. **Added Comprehensive Logging**
- Added `Log.d()` statements throughout `PrintPlugin.java`
- Added console logs in `printService.ts`
- Now you can see exactly what's happening

### 2. **Fixed File Path Handling**
- Properly converts relative paths to absolute `file://` URIs
- Handles both `path` and `uri` from `Filesystem.downloadFile()`
- Checks if file exists before trying to load it

### 3. **Fixed WebView Configuration**
- Enabled JavaScript
- Enabled file access (`setAllowFileAccess(true)`)
- Enabled file URL access for older Android versions
- Proper WebView settings for PDF loading

### 4. **Better Error Messages**
- More descriptive error messages
- Logs the exact file path being used
- Logs WebView errors with error codes

## How to Debug

### Step 1: Check Logs in Android Studio

1. Open **Logcat** in Android Studio (View → Tool Windows → Logcat)
2. Filter by tag: `PrintPlugin` or package: `com.vprint.kiosk`
3. Try printing again and look for:

**Expected logs:**
```
D/PrintPlugin: PrintPlugin loaded, PrintManager: available
D/PrintPlugin: print() called - documentUrl: ..., documentName: ...
D/PrintPlugin: Converted absolute path to file URI: file:///data/...
D/PrintPlugin: Loading URL in WebView: file:///data/...
D/PrintPlugin: WebView page finished loading: file:///data/...
D/PrintPlugin: Creating print job with attributes - Paper: A4, Orientation: portrait, Color: false
D/PrintPlugin: Print job created successfully - JobId: ...
```

**Error logs to watch for:**
```
E/PrintPlugin: File does not exist: ...
E/PrintPlugin: Could not resolve file path: ...
E/PrintPlugin: WebView error - Code: ..., Description: ...
E/PrintPlugin: Failed to create print job - PrintManager returned null
```

### Step 2: Check Console Logs (WebView)

In Chrome DevTools (if connected):
1. Open Chrome and go to `chrome://inspect`
2. Find your app's WebView
3. Click "inspect"
4. Look for console logs:
   - `📥 Download complete:` - Shows download result
   - `🖨️ Printing with path:` - Shows the path being sent to print plugin

### Step 3: Verify File Exists

Add this temporary code to verify file exists:

```typescript
// In printService.ts, after download
const fileInfo = await Filesystem.stat({
  path: downloadResult.path,
  directory: Directory.Cache,
});
console.log('📄 File info:', fileInfo);
```

### Step 4: Check Print Manager Status

The print dialog might not appear if:
- No printers are configured
- Print service is disabled
- Device is in kiosk mode blocking dialogs

## Common Issues and Fixes

### Issue 1: "File does not exist"
**Cause:** File path is incorrect  
**Fix:** The plugin now properly resolves paths. Check logs to see what path is being used.

### Issue 2: "WebView error - Code: -6"
**Cause:** File cannot be loaded in WebView  
**Fix:** 
- Check file permissions
- Verify file exists at the path
- Try using `downloadResult.uri` instead of `path`

### Issue 3: "Failed to create print job"
**Cause:** PrintManager is null or no printers available  
**Fix:**
1. Go to Settings → Connected devices → Connection preferences → Printing
2. Add a printer
3. Restart the app

### Issue 4: Print dialog appears but is hidden
**Cause:** Kiosk mode or accessibility service might be blocking it  
**Fix:**
- Check if accessibility service is interfering
- Temporarily disable kiosk mode to test
- Check if another app is overlaying the dialog

## Next Steps

1. **Rebuild the app:**
   ```bash
   npm run build
   npx cap sync
   ```

2. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

3. **Build and install:**
   - Build → Make Project
   - Run (green play button)

4. **Monitor logs:**
   - Open Logcat
   - Filter: `PrintPlugin`
   - Try printing
   - Share the logs with me!

## Alternative: Use PDF Renderer (If WebView Fails)

If WebView continues to fail, we can use Android's PdfRenderer API directly:

```java
PdfRenderer renderer = new PdfRenderer(ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY));
// Render PDF pages directly without WebView
```

This would require additional implementation. Let's try WebView first with the improved logging.

## Expected Behavior

1. ✅ File downloads successfully (no CORS errors)
2. ✅ File path is logged: `/data/data/com.vprint.kiosk/cache/vprint_xxx.pdf`
3. ✅ WebView loads the file (no errors)
4. ✅ Print dialog appears
5. ✅ User can select printer and print

If any step fails, the logs will tell us exactly where!






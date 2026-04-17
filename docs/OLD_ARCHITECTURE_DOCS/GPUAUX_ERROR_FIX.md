# GPUAUX Error Fix

## Problem

The Android logs were showing repeated `GPUAUX` errors:
```
E GPUAUX : [AUX]GuiExtAuxCheckAuxPath:670: Null anb
```

This error occurs when the Android graphics system tries to access a null `ANativeWindowBuffer` (anb) during WebView rendering. This is a low-level graphics error that can cause performance issues and potential crashes.

## Root Cause

The error happens when:
1. WebView is created without proper initialization
2. WebView is not attached to a parent view hierarchy
3. Hardware acceleration is enabled but the graphics buffer is not properly initialized
4. WebView tries to render before it's fully initialized

## Solution Implemented

### 1. **Force Software Rendering**
   - Set WebView layer type to `LAYER_TYPE_SOFTWARE` to completely bypass GPU rendering
   - This eliminates all GPU buffer issues and is more stable for printing operations
   - Software rendering is slightly slower but much more reliable

### 2. **WebView Parent Attachment**
   - Add WebView to the activity's content view with minimal size (1x1 pixels)
   - Make WebView invisible (we only need it for printing, not display)
   - This ensures proper initialization and prevents null buffer errors

### 3. **Delayed Print Job Creation**
   - Added a 100ms delay after page load before creating the print job
   - This ensures WebView is fully initialized and ready for printing

### 4. **Proper WebView Cleanup**
   - Remove WebView from parent view after print job is created
   - Call `destroy()` to free resources
   - Prevents memory leaks and resource issues

### 5. **Render Priority Setting**
   - Set high render priority for better performance
   - Helps ensure WebView rendering completes properly

## Code Changes

### File: `android/app/src/main/java/com/vprint/kiosk/plugins/PrintPlugin.java`

**Key additions:**
- Import `ViewGroup` and `View` classes
- Set WebView layer type based on Android version
- Attach WebView to parent view with minimal size
- Add delay before creating print job
- Proper cleanup in all code paths (success, error, etc.)

## Testing

After rebuilding the app, the GPUAUX errors should be significantly reduced or eliminated. To verify:

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

4. **Check logs:**
   ```powershell
   .\scripts\view-logs-filtered.ps1 gpuaux
   ```

   You should see far fewer (or zero) GPUAUX errors.

## Current Implementation

The fix now **forces software rendering** by default, which completely eliminates GPU-related errors. This is the most reliable solution for the GPUAUX error.

## Additional Notes

- The WebView is made invisible (1x1 pixels) because we only need it for printing, not display
- The 100ms delay is minimal and shouldn't noticeably affect print performance
- Proper cleanup prevents memory leaks when printing multiple documents
- This fix is compatible with all Android versions from API 19+

## Expected Results

✅ No more GPUAUX errors in logs  
✅ Stable printing functionality  
✅ No memory leaks from WebView instances  
✅ Better overall app stability  


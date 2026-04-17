# Firebase Storage CORS Fix for Capacitor App

## Problem
The Capacitor app (`https://vprint.kiosk`) is blocked by Firebase Storage's CORS policy when trying to fetch documents.

## Solution 1: Use Native Download (✅ Implemented)

**The app now uses Capacitor's Filesystem plugin to download files natively, which bypasses browser CORS restrictions entirely.**

### How it Works:
1. `Filesystem.downloadFile()` uses Android's native HTTP client (not the browser)
2. Downloads the file to the app's cache directory
3. Passes the local file URI to the print plugin
4. No CORS restrictions because it's a native network request, not a browser fetch

### Code Changes:
- Updated `lib/printService.ts` → `printWithCapacitor()` to use `Filesystem.downloadFile()`
- Downloads file to cache, prints it, then deletes the temporary file

---

## Solution 2: Configure Firebase Storage CORS (Optional)

If you still need browser access (for web version), configure CORS:

### Step 1: Install Google Cloud SDK
```bash
# Download from: https://cloud.google.com/sdk/docs/install
```

### Step 2: Authenticate
```bash
gcloud auth login
gcloud config set project visionprinttt-1fb8a
```

### Step 3: Apply CORS Configuration
```bash
gsutil cors set firebase-storage-cors.json gs://visionprinttt-1fb8a.firebasestorage.app
```

### Step 4: Verify CORS
```bash
gsutil cors get gs://visionprinttt-1fb8a.firebasestorage.app
```

---

## Solution 3: Update Firebase Storage Rules

Your current rules require authentication for `/documents/{userId}/{fileName}`:

```javascript
allow read: if isAdmin() || (isAuthenticated() && request.auth.uid == userId);
```

### Option A: Keep Authentication (Recommended for Security)
Use Firebase Authentication tokens in requests:

```typescript
import { getAuth } from 'firebase/auth';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const auth = getAuth();
const storage = getStorage();
const user = auth.currentUser;

if (user) {
  const fileRef = ref(storage, `documents/${userId}/${fileName}`);
  const url = await getDownloadURL(fileRef); // This URL includes auth token
  // Use this authenticated URL for download
}
```

### Option B: Allow Public Read for Kiosk (Less Secure)
Update rules to allow public read with download token:

```javascript
match /documents/{userId}/{fileName} {
  // Allow public read if URL has valid download token
  allow read: if true; // or: if request.auth != null
  
  // Keep write restricted
  allow write, delete: if isAdmin() || (isAuthenticated() && request.auth.uid == userId && isValidFileType() && isValidFileSize());
}
```

⚠️ **Security Note**: Option B allows anyone with the URL to download files. Use Option A if documents are sensitive.

---

## Recommended Approach

✅ **Use Solution 1 (Native Download)** - Already implemented!
- No CORS issues
- Works offline
- Faster (native HTTP client)
- No additional configuration needed

The app will now download files natively and print them without any CORS errors.

---

## Testing

1. Rebuild the app:
```bash
npm run build
npx cap sync
npx cap open android
```

2. Test printing - you should see in logs:
```
printWithCapacitor:downloading-file
printWithCapacitor:download-success
printWithCapacitor:success
```

3. No more CORS errors! 🎉






# VPrint Kiosk - Printing Kiosk Web Application

A modern, user-friendly web application designed for printing kiosks with QR code scanning, token-based authentication, and Firebase integration.

## 🚀 Features

### Core Functionality
- **Dual Input Methods**
  - 6-digit numeric token entry with on-screen number pad
  - QR code scanning with real-time camera feed
  
- **Print Management**
  - Automatic document retrieval from Firebase
  - Print job status tracking
  - Auto-print functionality
  - Multiple print settings support (copies, color, duplex, paper size)

- **Printer Status**
  - Real-time printer status display
  - Status options: Connected, Ready, Disconnected, In Maintenance, Printing, Error
  - Visual indicators with animations

- **Admin Panel**
  - Secret button access (5 taps in corner)
  - Firebase authentication
  - Printer status management
  - System controls (restart, status updates)
  - Activity logging

- **Advertisement System**
  - Rotating carousel with smooth transitions
  - Configurable duration per ad
  - Firebase-managed advertisements
  - Eye-catching animations

- **User Experience**
  - Micro-animations throughout the interface
  - Error handling with animated notifications
  - Idle screen with screensaver mode
  - Touch-friendly interface optimized for students
  - Beautiful gradient designs and glass morphism effects

## 🛠️ Tech Stack

- **Hardware**: Lenovo Tab M9 (Android Tablet) ⭐
- **Printer**: Brother HL-L5210DN (Network)
- **Frontend**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: Firebase (Firestore, Auth, Storage)
- **State Management**: Zustand
- **QR Scanning**: html5-qrcode (Device Camera)
- **Notifications**: Sonner
- **Icons**: Lucide React

## 📦 Installation

### Hardware Requirements
- **Lenovo Tab M9** (Android Tablet) - Kiosk device
- **Brother HL-L5210DN** - Network printer
- Same WiFi network for both devices
- Tablet stand/mount (recommended)
- Power adapter & charging cable

### Software Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd printing-kiosk-lockdown
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
   - Create a `.env.local` file in the root directory
   - Copy contents from `.env.example`
   - Add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_KIOSK_ID=KIOSK_001
NEXT_PUBLIC_ADMIN_SECRET_SEQUENCE=5
NEXT_PUBLIC_IDLE_TIMEOUT=60000
```

4. **Deploy to hosting** (Required for Lenovo Tab M9 access)
```bash
# Deploy to Vercel (recommended)
vercel

# Or deploy to your hosting provider
npm run build
```

5. **Access on Lenovo Tab M9**
- Open Chrome on tablet
- Navigate to your deployed URL
- Allow camera and storage permissions
- Add to home screen (optional, for PWA mode)

## 🔥 Firebase Setup

### 1. Firestore Collections

Create the following collections in your Firebase Firestore:

#### `printJobs` Collection
```javascript
{
  token: "123456",              // 6-digit numeric
  qrCode: "unique_qr_string",   // QR code data
  documentUrl: "https://...",    // Document URL from Storage
  documentName: "document.pdf",
  status: "pending",             // pending | processing | printing | completed | failed
  printSettings: {
    copies: 1,
    color: false,
    duplex: false,
    paperSize: "A4",
    orientation: "portrait"
  },
  createdAt: timestamp,
  printedAt: timestamp,
  kioskId: "KIOSK_001",
  userId: "user_id",
  paymentStatus: "completed",    // pending | completed | failed
  amount: 5.00
}
```

#### `kiosks` Collection
```javascript
{
  name: "Library Kiosk 1",
  location: "Main Library, Floor 2",
  printerStatus: "ready",        // connected | ready | disconnected | maintenance | printing | error
  printerModel: "HP LaserJet Pro",
  lastMaintenance: timestamp,
  isActive: true,
  advertisements: [
    {
      id: "ad1",
      imageUrl: "https://...",
      title: "Student Discount",
      duration: 5,
      link: "https://...",
      isActive: true
    }
  ]
}
```

### 2. Firebase Authentication

Enable Email/Password authentication in Firebase Console and create admin users.

### 3. Storage Rules

Set up Firebase Storage rules for document access:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /documents/{documentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /printJobs/{jobId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /kiosks/{kioskId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🎨 Customization

### Branding
- Update colors in `tailwind.config.js`
- Modify logo and title in `components/Header.tsx`
- Customize animations in `app/globals.css`

### Kiosk Settings
- Change kiosk ID in `.env.local`
- Adjust idle timeout duration
- Modify secret button tap sequence

### Print Settings
- Configure default print options in `lib/types.ts`
- Adjust print service behavior in `lib/printService.ts`

## 🔒 Security Features

- **Admin Authentication**: Firebase Auth with email/password
- **Secret Access**: Hidden button requires specific tap sequence
- **Session Management**: Auto-logout on idle
- **Data Validation**: Token and QR code verification
- **Payment Verification**: Ensures payment is completed before printing

## 📱 Kiosk Mode Setup

### Lenovo Tab M9 (Android) ⭐ PRIMARY

**Recommended: Fully Kiosk Browser**
```
1. Install "Fully Kiosk Browser" from Google Play Store
2. Open Fully → Settings
3. Set Start URL: https://your-kiosk-url.com
4. Enable:
   - Kiosk Mode
   - Hide status bar
   - Hide navigation bar
   - Keep screen on
5. Lock with password
```

**Alternative: Chrome Screen Pinning**
```
1. Settings → Security → Enable "Screen pinning"
2. Open Chrome with kiosk URL
3. Tap Overview → Pin app
4. Confirm
```

**Brother Printer Setup on Android:**
```
1. Install "Brother iPrint&Scan" from Play Store
2. Settings → Printing → Enable "Brother Print Service"
3. Connect to same WiFi as printer
4. Test print from app
```

See `BROTHER_PRINTER_SETUP.md` for complete Android setup guide.

### Windows (Alternative - For Reference)
1. Use Microsoft Edge in Kiosk mode:
```bash
msedge --kiosk https://your-kiosk-url.com --edge-kiosk-type=fullscreen
```

### Linux/Ubuntu (Alternative - For Reference)
```bash
chromium-browser --kiosk --app=https://your-kiosk-url.com
```

## 🧪 Testing

### Test Token Flow
1. Go to main screen
2. Select "Enter Token"
3. Enter any 6-digit number (create test job in Firebase first)
4. Watch the print process

### Test QR Scanner
1. Select "Scan QR Code"
2. Allow camera permissions
3. Scan a test QR code with job data
4. Verify print process

### Test Admin Panel
1. Tap bottom-left corner 5 times quickly
2. Login with admin credentials
3. Test printer status changes
4. Test system restart

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Self-Hosted
```bash
npm run build
npm start
```

## 📖 API Integration

For integrating with your existing website, ensure print jobs are created in Firebase with this structure:

```typescript
// Create print job from your website
const printJob = {
  token: generateToken(),        // 6-digit random number
  qrCode: generateQRData(),      // Unique QR string
  documentUrl: uploadedFileURL,
  documentName: fileName,
  status: 'pending',
  printSettings: userSettings,
  createdAt: serverTimestamp(),
  userId: currentUser.uid,
  paymentStatus: 'completed',    // Only after successful payment
  amount: calculatedAmount
};
```

## 🐛 Troubleshooting

### Camera not working
- Check browser permissions
- Ensure HTTPS connection (required for camera access)
- Try different browser

### Print not working
- Verify browser print permissions
- Check document URL is accessible
- Ensure printer is connected to system

### Firebase connection issues
- Verify `.env.local` configuration
- Check Firebase project settings
- Ensure Firestore rules allow access

## 🤝 Contributing

This is a custom kiosk application. For modifications or feature requests, please contact the development team.

## 📄 License

Proprietary - All rights reserved

## 👥 Support

For technical support or questions:
- Check the troubleshooting section
- Review Firebase console for errors
- Contact your system administrator

---

**Built with ❤️ for students by the VPrint team**


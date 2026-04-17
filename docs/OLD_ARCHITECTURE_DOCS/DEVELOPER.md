# VPrint Kiosk - Developer Documentation

A smart printing kiosk application built with **Next.js 16** for students to print documents via 6-digit tokens or QR codes. Deployed on **Lenovo Tab M9** (Android) using Capacitor.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Core Services](#core-services)
- [Components](#components)
- [API Routes](#api-routes)
- [State Management](#state-management)
- [Firebase Schema](#firebase-schema)
- [Print Flow](#print-flow)
- [Capacitor & Android Build](#capacitor--android-build)
- [Styling & Theming](#styling--theming)
- [Error Handling](#error-handling)
- [Security](#security)
- [Deployment](#deployment)

---

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in Firebase credentials and kiosk config

# Run development server (Turbopack)
npm run dev

# Production build
npm run build

# Build for Android (Capacitor)
npm run build:capacitor
```

---

## Project Structure

```
hanoi/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (viewport, analytics)
│   ├── page.tsx                      # Main kiosk page
│   ├── globals.css                   # Global styles + Tailwind
│   └── api/                          # Server-side API routes
│       ├── alerts/
│       │   ├── email/route.ts        # Email alert endpoint
│       │   └── whatsapp/route.ts     # WhatsApp alert endpoint
│       └── print/
│           ├── route.ts              # Print job submission
│           ├── fastapi/route.ts      # FastAPI print forwarding
│           ├── download-and-forward/route.ts  # Download + forward to Pi
│           └── job-status/[jobId]/route.ts    # CUPS job status proxy
│
├── components/                       # React Components
│   ├── MainKiosk.tsx                 # Main UI orchestrator
│   ├── TokenInput.tsx                # 6-digit token entry
│   ├── QRScanner.tsx                 # QR code scanner
│   ├── PrintingStatus.tsx            # Print progress + greeting UI
│   ├── AdvertisementScreen.tsx       # Ad carousel
│   ├── IdleScreen.tsx                # Screensaver / idle mode
│   ├── ErrorMessage.tsx              # Error notifications
│   ├── AdminPanel.tsx                # Admin access point
│   ├── admin/                        # Admin sub-panels
│   │   ├── DashboardPanel.tsx
│   │   ├── PrintJobsPanel.tsx
│   │   ├── SettingsPanel.tsx
│   │   ├── HealthPanel.tsx
│   │   ├── UsersPanel.tsx
│   │   ├── StatisticsPanel.tsx
│   │   ├── AdvertisementsPanel.tsx
│   │   └── LogsPanel.tsx
│   └── ui/                           # Shadcn-style primitives
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── progress.tsx
│       ├── switch.tsx
│       └── tabs.tsx
│
├── lib/                              # Business Logic & Services
│   ├── types.ts                      # TypeScript interfaces
│   ├── store.ts                      # Zustand state management
│   ├── firebase.ts                   # Firebase initialization
│   ├── printService.ts               # Core print logic (~90KB)
│   ├── kioskService.ts               # Kiosk settings & monitoring
│   ├── authService.ts                # Authentication (anon + admin)
│   ├── printerStatusService.ts       # Error detection & logging
│   ├── documentCache.ts              # IndexedDB document caching
│   ├── documentLoader.ts             # Document fetch optimization
│   ├── alertService.ts               # Email / WhatsApp alerts
│   ├── paperMonitoringService.ts     # Paper level tracking
│   ├── statisticsService.ts          # Analytics & metrics
│   ├── advertisementService.ts       # Ad management
│   ├── accessibilitySetup.ts         # Accessibility configuration
│   ├── fileTypeUtils.ts              # MIME type detection
│   └── utils.ts                      # Logger, helpers, token gen
│
├── android/                          # Capacitor Android project
├── scripts/                          # Build & setup scripts
│   ├── build-capacitor.js            # Capacitor build pipeline
│   └── init-firestore.js             # Firestore initialization
├── chrome-extension/                 # Browser extension
├── docs/                             # Additional documentation
├── config/                           # Configuration files
│
├── next.config.js                    # Next.js configuration
├── capacitor.config.ts               # Capacitor app config
├── tailwind.config.js                # Tailwind theme
├── tsconfig.json                     # TypeScript config
├── firebase.json                     # Firebase hosting
├── firestore.rules                   # Firestore security rules
└── storage.rules                     # Storage access rules
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        KIOSK TABLET                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Next.js App (Capacitor WebView / Browser)               │   │
│  │                                                          │   │
│  │  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐   │   │
│  │  │ TokenIn  │  │ QRScanner    │  │ PrintingStatus    │   │   │
│  │  │ put      │  │              │  │ (progress + UI)   │   │   │
│  │  └────┬─────┘  └──────┬───────┘  └────────┬──────────┘   │   │
│  │       │               │                    │              │   │
│  │  ┌────▼───────────────▼────────────────────▼──────────┐   │   │
│  │  │              Zustand Store                         │   │   │
│  │  │  (currentJob, printerStatus, kioskSettings)        │   │   │
│  │  └────────────────────┬───────────────────────────────┘   │   │
│  │                       │                                   │   │
│  │  ┌────────────────────▼───────────────────────────────┐   │   │
│  │  │            PrintService                            │   │   │
│  │  │  fetchJob → downloadDoc → sendToPi → pollStatus    │   │   │
│  │  └────────────────────┬───────────────────────────────┘   │   │
│  └───────────────────────│───────────────────────────────────┘   │
│                          │                                       │
└──────────────────────────│───────────────────────────────────────┘
                           │
              ┌────────────▼────────────────┐
              │   Next.js API Routes        │
              │   /api/print/*              │
              │   (download-and-forward)    │
              └────────────┬────────────────┘
                           │
         ┌─────────────────┼─────────────────────┐
         │                 │                     │
         ▼                 ▼                     ▼
┌─────────────┐  ┌─────────────────┐   ┌──────────────────┐
│  Firebase   │  │  Raspberry Pi 5 │   │  Email/WhatsApp  │
│  Firestore  │  │  FastAPI Server │   │  Alert Services  │
│  Auth       │  │  ┌───────────┐  │   └──────────────────┘
│  Storage    │  │  │   CUPS    │  │
│             │  │  │  Printer  │  │
└─────────────┘  │  └───────────┘  │
                 └─────────────────┘
```

**Data Flow**:
1. User enters 6-digit token or scans QR code
2. Kiosk fetches print job from **Firestore** (`printJobs` collection)
3. Document downloaded from **Firebase Storage**
4. Forwarded to **Raspberry Pi FastAPI** server via Next.js proxy
5. Pi converts (if DOCX/image) → extracts pages → sends to **CUPS** printer
6. Kiosk polls Pi for real-time page progress

---

## Tech Stack

| Layer            | Technology                                      |
| ---------------- | ----------------------------------------------- |
| Framework        | Next.js 16 (App Router, Turbopack)              |
| UI Library       | React 19                                        |
| State Management | Zustand 4.5                                     |
| Styling          | Tailwind CSS 3.4                                |
| Animations       | Framer Motion 11.3                              |
| Backend          | Firebase (Firestore, Auth, Storage)             |
| Print Server     | Raspberry Pi 5 + FastAPI + CUPS                 |
| Native Bridge    | Capacitor 7 (Android)                           |
| QR Scanning      | html5-qrcode                                    |
| Notifications    | Sonner (toasts)                                 |
| UI Primitives    | Radix UI                                        |
| Language         | TypeScript                                      |

---

## Environment Variables

Create `.env.local` at the project root:

```env
# Firebase Configuration (required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Kiosk Configuration
NEXT_PUBLIC_KIOSK_ID=KIOSK_001
NEXT_PUBLIC_ADMIN_SECRET_SEQUENCE=5          # Number of taps to open admin
NEXT_PUBLIC_IDLE_TIMEOUT=90000               # Idle timeout in ms (default: 90s)

# Print Server (Raspberry Pi FastAPI)
NEXT_PUBLIC_FASTAPI_PRINT_URL=http://192.168.29.3:8000/print

# Debug
NEXT_PUBLIC_DEBUG_LOGS=false
```

> **Note**: The app gracefully handles missing Firebase credentials by creating a placeholder app with a console warning.

---

## Core Services

### PrintService (`lib/printService.ts`)

The largest service (~90KB). Handles the entire print lifecycle.

**Key Methods**:

| Method                | Description                                         |
| --------------------- | --------------------------------------------------- |
| `fetchPrintJob()`     | Fetches job from Firestore by token/QR code         |
| `printWithFastAPI()`  | Sends document to Pi via Next.js proxy              |
| `printWithCapacitor()`| Native Android printing via Capacitor plugin        |
| `printWithBrowser()`  | Browser print dialog fallback                       |
| `subscribeToPrintJob()` | Real-time Firestore listener for job updates     |

**Print Strategy Priority** (Android):
1. Direct remote URL in native WebView
2. Local download → native print
3. Base64 encoding fallback

**Page Selection Logic**:
```
Priority: settings.pages (string) → selectedPages[] → data.pages (string only)
```
- `selectedPages` array (e.g., `[1,3,5]`) is converted to range string (`"1,3,5"`)
- `data.pages` is only used if it's a **string** (page range), never a number (page count)

---

### KioskService (`lib/kioskService.ts`)

Manages kiosk configuration and health monitoring.

| Method                   | Description                              |
| ------------------------ | ---------------------------------------- |
| `getKioskSettings()`     | Fetch kiosk config from Firestore        |
| `updatePrinterStatus()`  | Update printer status in Firestore       |
| `subscribeToKiosk()`     | Real-time listener (300ms debounce)      |

---

### AuthService (`lib/authService.ts`)

| Method              | Description                          |
| ------------------- | ------------------------------------ |
| `signInAnonymous()` | Anonymous auth for kiosk operations  |
| `signInAdmin()`     | Email/password admin authentication  |
| `isAnonymous()`     | Check if current user is anonymous   |
| `isAdmin()`         | Check if current user is admin       |

---

### PrinterStatusService (`lib/printerStatusService.ts`)

Detects and logs printer errors.

**Error Types**: `connection_timeout`, `paper_jam`, `out_of_paper`, `ink_low`, `offline`, `driver_error`, `queue_full`, `permission_denied`, `file_corrupt`, `size_exceeded`, `format_unsupported`, `hardware_failure`, `unknown`

**Severities**: `critical`, `warning`, `info`

---

### DocumentCache (`lib/documentCache.ts`)

IndexedDB-based document caching for offline support.

- **Max Size**: 500MB
- **TTL**: 7 days
- **Methods**: `get()`, `set()`, `clear()`, `clearExpired()`
- **Supported Types**: PDF, image, Word, text, PowerPoint, Excel, video

---

### AlertService (`lib/alertService.ts`)

Sends email and WhatsApp alerts for critical events (paper low, printer errors).

- Routes through `/api/alerts/email` and `/api/alerts/whatsapp`
- Threshold-based with sent-tracking to prevent duplicate alerts

---

### StatisticsService (`lib/statisticsService.ts`)

Tracks kiosk metrics using Firestore atomic `increment()`.

**Tracked Metrics**: `totalPrintJobs`, `successfulPrints`, `failedPrints`, `totalRevenue`, `uptime`, `paperJams`

---

## Components

### Main Flow Components

| Component               | Role                                                   |
| ----------------------- | ------------------------------------------------------ |
| `MainKiosk`             | Orchestrator — routes between token, ads, idle states   |
| `TokenInput`            | 6-digit numeric keypad with debounced submission        |
| `QRScanner`             | Camera-based QR code scanning (html5-qrcode)           |
| `PrintingStatus`        | Greeting UI ("HEY {name}!"), file info, progress bar   |
| `AdvertisementScreen`   | Auto-rotating ad carousel (7s per slide)               |
| `IdleScreen`            | Screensaver shown after idle timeout                   |
| `ErrorMessage`          | Toast-style error notifications                        |

### PrintingStatus Flow

```
Mount → Auto-print (500ms delay) → Send to Pi → Poll progress → Complete/Error
```

- Skips preview screen — goes directly to printing
- Shows greeting card: "HEY {displayName} !"
- File info row: name, pages, copies
- Real-time progress bar with percentage and page count
- Progress source: CUPS `job-media-sheets-completed` via Pi's `/jobs/{job_id}`
- Fallback: time-based estimation (45ppm single-sided, 18ppm duplex)

### Admin Panel

Accessed by tapping 5 times in a hidden area.

| Sub-Panel          | Purpose                           |
| ------------------ | --------------------------------- |
| `DashboardPanel`   | Overview and quick stats          |
| `PrintJobsPanel`   | Job history and management        |
| `SettingsPanel`    | Kiosk configuration               |
| `HealthPanel`      | Printer and system health          |
| `UsersPanel`       | User management                   |
| `StatisticsPanel`  | Analytics and charts               |
| `AdvertisementsPanel` | Ad content management          |
| `LogsPanel`        | Activity logs viewer               |

---

## API Routes

All routes use `export const dynamic = 'force-dynamic'`.

### `POST /api/print/download-and-forward`

The primary print endpoint. Downloads document from Firebase Storage and forwards to the Raspberry Pi.

**Request Body**:
```json
{
  "documentUrl": "https://firebasestorage.googleapis.com/...",
  "fileName": "document.docx",
  "printSettings": {
    "copies": 1,
    "orientation": "portrait",
    "color": true,
    "duplex": false,
    "paperSize": "A4",
    "pages": "1-3,5"
  },
  "clientJobId": "firestore_job_id"
}
```

**Response**:
```json
{
  "success": true,
  "job_id": 42,
  "printer": "Brother_HL_L5210DN",
  "client_job_id": "firestore_job_id"
}
```

### `GET /api/print/job-status/[jobId]`

Proxies to Pi's `/jobs/{jobId}` for real-time CUPS status.

**Response**:
```json
{
  "job_id": 42,
  "state": "processing",
  "state_code": 5,
  "total_pages": 26,
  "completed_pages": 12,
  "current_page": 13,
  "is_finished": false
}
```

**CUPS State Codes**: `3` = pending, `5` = processing, `9` = completed

---

## State Management

Zustand store (`lib/store.ts`):

```typescript
interface KioskState {
  printerStatus: 'connected' | 'ready' | 'disconnected' | 'maintenance' | 'printing' | 'error';
  kioskSettings: KioskSettings | null;
  currentJob: PrintJob | null;
  isAdminPanelOpen: boolean;
  adminSecretTaps: number;
  isScanning: boolean;
  error: string | null;
  isIdle: boolean;
  lastActivity: number;
}
```

**Actions**: `setPrinterStatus`, `setKioskSettings`, `setCurrentJob`, `setError`, `resetState`, `incrementAdminTaps`, `resetAdminTaps`, `setIsIdle`, `updateLastActivity`

---

## Firebase Schema

### `printJobs/{jobId}`

```typescript
{
  token: string;              // 6-digit token
  qrCode?: string;            // QR code value
  status: 'pending' | 'printing' | 'completed' | 'failed' | 'cancelled';
  userId: string;
  userEmail?: string;
  files: [{
    url: string;
    name: string;
    pages: number;            // Total page count
    size: number;
    type: string;
    selectedPages?: number[]; // User's page selection [1, 3, 5]
    totalPages?: number;
  }];
  printSettings: {
    copies: number;
    color: boolean;
    duplex: boolean;
    paperSize: 'A4' | 'A3' | 'Letter';
    orientation: 'portrait' | 'landscape';
    pages?: string;           // Page range string "1-3,5"
  };
  amount: number;             // Cost
  paymentStatus: string;
  createdAt: Timestamp;
  printedAt?: Timestamp;
  kioskId?: string;
}
```

### `kiosks/{kioskId}`

```typescript
{
  name: string;
  location: string;
  printerStatus: string;
  paperRemaining: number;
  paperTotal: number;
  isActive: boolean;
  lastHeartbeat: Timestamp;
  statistics: {
    totalPrintJobs: number;
    successfulPrints: number;
    failedPrints: number;
    totalRevenue: number;
  };
  alerts: {
    paperLowThreshold: number;
    emailEnabled: boolean;
    whatsappEnabled: boolean;
  };
}
```

### `advertisements/{adId}`

```typescript
{
  title: string;
  imageUrl: string;
  duration: number;           // Display duration in seconds
  isActive: boolean;
  order: number;
  createdAt: Timestamp;
}
```

---

## Print Flow

### End-to-End Sequence

```
1. User enters token on kiosk
        │
2. TokenInput.handleSubmit()
        │
3. PrintService.fetchPrintJob(token)
        │  → Queries Firestore: printJobs where token == input
        │  → Resolves selectedPages → page range string
        │  → Fetches user displayName from users collection
        │
4. PrintingStatus mounts
        │  → Auto-triggers handlePrint() after 500ms
        │
5. PrintService.printWithFastAPI(job, documentUrl, settings)
        │  → POST /api/print/download-and-forward
        │     → Downloads file from Firebase Storage
        │     → Creates FormData with file + settings JSON
        │     → Forwards to Pi's /print endpoint
        │
6. Raspberry Pi receives file
        │  → Converts DOCX/images to PDF (LibreOffice)
        │  → Extracts selected pages (pdftk/qpdf)
        │  → Submits to CUPS: conn.printFile(printer, path, title, options)
        │  → Returns { job_id, printer }
        │
7. PrintingStatus polls /api/print/job-status?jobId={cups_job_id}
        │  → Every 500ms
        │  → Updates progress bar with completed_pages / total_pages
        │
8. CUPS job completes (state_code == 9)
        │  → Progress hits 100%
        │  → Firestore job status updated to 'completed'
        │  → Statistics incremented
        │
9. Success screen shown → auto-reset after timeout
```

### Page Selection Flow

```
Firestore job data
    │
    ├─ printSettings.pages: string    →  Used directly (e.g., "1-3,5")
    │
    ├─ files[0].selectedPages: [1,3]  →  Converted to "1,3"
    │
    ├─ data.selectedPages: [2,4,6]    →  Converted to "2,4,6"
    │
    └─ data.pages: 30 (number)        →  IGNORED (this is page count, not range)
```

---

## Capacitor & Android Build

### Configuration (`capacitor.config.ts`)

```typescript
{
  appId: 'com.vprint.kiosk',
  appName: 'VPrint Kiosk',
  webDir: 'out',                      // Static export directory
  android: {
    scheme: 'https',
    hostname: 'vprint.kiosk',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      backgroundColor: '#1e3a8e',
      showSpinner: false,
      launchShowDuration: 2000,
    },
  },
}
```

### Build Pipeline (`scripts/build-capacitor.js`)

```
1. Clean .next/ directory
2. Move app/api/ → .api.backup/ (API routes incompatible with static export)
3. Set BUILD_MODE=capacitor
4. Run next build → outputs to out/
5. Restore app/api/ from backup
6. npx cap sync android
7. Build APK via Android Studio or CLI
```

> **Important**: API routes are excluded from Capacitor builds. In native mode, the app calls the FastAPI server directly (no Next.js proxy).

### Next.js Output Modes (`next.config.js`)

| `BUILD_MODE`   | `output`     | Use Case                      |
| -------------- | ------------ | ----------------------------- |
| `capacitor`    | `"export"`   | Static HTML for Android APK   |
| (default)      | `"standalone"` | Vercel / self-hosted server |

---

## Styling & Theming

### Tailwind Configuration

```javascript
// tailwind.config.js
colors: {
  primary: sky-500 (#0ea5e9) → blue-900 (#0c4a6e),
  accent: fuchsia palette,
}
```

**Custom Animations**:
- `pulse-slow` — Slow pulsing for idle elements
- `bounce-slow` — Gentle bounce
- `fade-in` — Opacity transition
- `slide-up` / `slide-down` — Vertical slides

### Global CSS (`app/globals.css`)

- **Kiosk Mode**: Prevents text selection (except inputs), disables context menu
- **Custom Scrollbar**: Thin, rounded, primary-colored
- **Form Contrast**: Ensures input visibility on dark backgrounds
- **Print Media Query**: Hides non-printable elements

### UI Components

Built with **Radix UI** primitives + **Tailwind** + `cn()` utility (clsx + tailwind-merge):

```typescript
import { cn } from '@/lib/utils';

<Button className={cn('base-classes', conditional && 'extra-classes')} />
```

---

## Error Handling

### Printer Error Detection

```typescript
// lib/printerStatusService.ts
PrinterStatusService.detectPrinterError(errorMessage) → {
  type: PrinterErrorType,     // 13 predefined types
  message: string,
  severity: 'critical' | 'warning' | 'info',
  timestamp: Date,
  resolved: boolean,
}
```

### Error Recovery Pattern

```
Error detected → Log to Firestore → Show toast → Trigger alert (if critical)
                                                          │
                                                   Email / WhatsApp
                                                   to admin
```

### Network Error Handling

- **30s timeout** on all fetch calls to the Pi
- **3 retries** for Firebase Storage downloads (handles 412/403 errors)
- **Abort controllers** for cancellable requests
- **Graceful degradation** when Firebase is not configured

---

## Security

| Layer           | Mechanism                                               |
| --------------- | ------------------------------------------------------- |
| Authentication  | Firebase Anonymous Auth (public), Email/Password (admin) |
| Firestore Rules | Public read on jobs/kiosks, authenticated write          |
| Admin Access    | Hidden 5-tap sequence (`NEXT_PUBLIC_ADMIN_SECRET_SEQUENCE`) |
| Idle Protection | Auto-reset after 90s inactivity                          |
| CORS            | Server-side proxying (no direct client → Pi calls)       |
| Input           | Token validation: `/^\d{6}$/`                            |

---

## Deployment

### Option 1: Capacitor Android (Primary)

```bash
npm run build:capacitor    # Static export to out/
npx cap sync android       # Sync with Android project
# Open in Android Studio → Build APK
```

**Target Device**: Lenovo Tab M9

### Option 2: Vercel

```bash
npm run build              # Standalone build
# Deploy via Vercel CLI or Git push
```

### Option 3: Self-Hosted

```bash
npm run build
npm run start              # Runs on port 3000
```

### Raspberry Pi Setup

The print server runs on a **Raspberry Pi 5** with:
- **FastAPI** (Python) — HTTP API for print jobs
- **CUPS** — Print queue management
- **LibreOffice** — DOCX/image → PDF conversion
- **pdftk** or **qpdf** — Page extraction from PDFs

**Required packages on Pi**:
```bash
sudo apt install cups libcups2-dev pdftk qpdf libreoffice
pip install fastapi uvicorn python-cups python-multipart
```

**Pi Endpoints**:
| Endpoint          | Method | Description                    |
| ----------------- | ------ | ------------------------------ |
| `/print`          | POST   | Submit file for printing       |
| `/jobs/{job_id}`  | GET    | Get CUPS job status + progress |
| `/printers`       | GET    | List available printers        |
| `/health`         | GET    | Server health check            |

---

## Troubleshooting

### Common Issues

| Issue                              | Cause                                                | Fix                                                       |
| ---------------------------------- | ---------------------------------------------------- | --------------------------------------------------------- |
| All pages print instead of selected | `data.pages` (number) used as page range            | Fixed: `selectedPages` array now takes priority            |
| Firebase auth/invalid-api-key      | Missing or wrong API key in `.env.local`             | Check `NEXT_PUBLIC_FIREBASE_API_KEY`                       |
| Print server unreachable           | Pi IP changed or FastAPI not running                 | Verify `NEXT_PUBLIC_FASTAPI_PRINT_URL`, check Pi status    |
| Progress stuck at estimated %      | CUPS driver doesn't report `job-media-sheets-completed` | Driver-dependent; fallback to time-based estimation    |
| Page extraction fails              | `pdftk` / `qpdf` not installed on Pi                 | `sudo apt install pdftk qpdf`                              |
| Dark background edges              | Body CSS showing through component                   | Use `fixed inset-0` on wrapper div                         |
| Capacitor build fails              | API routes included in static export                 | Run `npm run build:capacitor` (auto-moves API routes)      |

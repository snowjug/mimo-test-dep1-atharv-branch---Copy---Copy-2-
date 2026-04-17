# Raspberry Pi Print Server Setup - Implementation Complete

## Code Changes Completed

### ✅ 1. Print Service Updates (`lib/printService.ts`)
- Added `monitorJobStatus()` method that uses Firestore `onSnapshot` to listen for real-time job status changes
- Method returns unsubscribe function for cleanup
- Properly converts Firestore data to PrintJob format
- Handles errors gracefully

### ✅ 2. Kiosk Component Updates (`components/PrintingStatus.tsx`)
- Removed all direct printing calls (`printWithCapacitor`, `silentDirectPrint`)
- Added Firestore status monitoring using `PrintService.monitorJobStatus()`
- Updated UI to show status messages based on Firestore status:
  - `pending` → "Waiting for print server..."
  - `processing` → "Downloading document..."
  - `printing` → "Printing document..."
  - `completed` → "Print completed!"
  - `failed` → "Print failed"
- Removed auto-print logic (no longer triggers print automatically)
- Updated button/messages to reflect print server processing
- Status updates in real-time as Pi processes the job

### ✅ 3. Firestore Rules Verification
- Rules allow:
  - Pi service account: Full read/write access (via Admin SDK)
  - Kiosk: Read access for all jobs, update access for authenticated users
- No changes needed to `firestore.rules`

## Manual Setup Steps Required

### Step 1: Configure CUPS on Raspberry Pi

SSH into your Raspberry Pi and run:

```bash
cd raspberry-pi-print-server
chmod +x configure_cups_silent.sh
./configure_cups_silent.sh
```

Or follow the manual setup in `CUPS_DIRECT_SILENT_PRINTING_SETUP.md`

**Verify:**
```bash
lpstat -p
echo "Test" | lp -d <printer-name> -o job-sheets=none
```

### Step 2: Install Print Server on Raspberry Pi

```bash
# Copy files to Raspberry Pi (or clone repo)
cd raspberry-pi-print-server

# Install Python dependencies
pip3 install -r requirements.txt

# Setup Firebase credentials
sudo mkdir -p /etc/vprint
sudo cp <your-firebase-credentials.json> /etc/vprint/firebase-credentials.json
sudo chmod 600 /etc/vprint/firebase-credentials.json

# Configure environment
cp config.env.example config.env
nano config.env
```

**Update `config.env` with:**
```
PRINTER_NAME=Brother_HL-L5210DN  # Match your CUPS printer name
KIOSK_ID=KIOSK_001  # Unique identifier for this kiosk
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

### Step 3: Install as Systemd Service

```bash
# Copy service file
sudo cp vprint-print-server.service /etc/systemd/system/

# Edit service file if needed (update paths)
sudo nano /etc/systemd/system/vprint-print-server.service

# Reload systemd
sudo systemctl daemon-reload

# Enable and start service
sudo systemctl enable vprint-print-server
sudo systemctl start vprint-print-server

# Check status
sudo systemctl status vprint-print-server

# View logs
sudo journalctl -u vprint-print-server -f
```

### Step 4: Test the Integration

1. **Create a test job in Firestore:**
   ```javascript
   {
     token: "123456",
     status: "pending",
     documentUrl: "https://storage.googleapis.com/.../test.pdf",
     documentName: "test.pdf",
     printSettings: {
       copies: 1,
       color: false,
       duplex: false,
       paperSize: "A4",
       orientation: "portrait"
     }
   }
   ```

2. **Monitor Pi logs:**
   ```bash
   sudo journalctl -u vprint-print-server -f
   ```

3. **Test from kiosk:**
   - Enter token "123456" at kiosk
   - Verify job is fetched and displayed
   - Verify status updates in real-time:
     - pending → processing → printing → completed

## Architecture Flow

```
1. User uploads & pays
   ↓
2. Job created in Firestore (status: 'pending')
   ↓
3. User enters token at kiosk
   ↓
4. Kiosk fetches job and displays it
   ↓
5. Kiosk starts monitoring job status via Firestore listener
   ↓
6. Pi print server detects 'pending' job (Firestore listener)
   ↓
7. Pi updates status to 'processing' (downloading PDF)
   ↓
8. Kiosk sees status update → shows "Downloading document..."
   ↓
9. Pi updates status to 'printing' (sending to CUPS)
   ↓
10. Kiosk sees status update → shows "Printing document..."
   ↓
11. Pi prints via CUPS (silent, no dialogs)
   ↓
12. Pi updates status to 'completed'
   ↓
13. Kiosk sees status update → shows "Print completed!"
   ↓
14. Kiosk returns to main screen after 5 seconds
```

## Key Features

- ✅ **Silent Printing**: No print dialogs on kiosk or Pi
- ✅ **Real-time Status**: Kiosk monitors job status in real-time
- ✅ **Automatic Processing**: Pi automatically processes pending jobs
- ✅ **Error Handling**: Failed jobs show error messages
- ✅ **Multiple Documents**: Supports jobs with multiple documents

## Troubleshooting

### Pi not processing jobs
- Check service is running: `sudo systemctl status vprint-print-server`
- Check logs: `sudo journalctl -u vprint-print-server -n 50`
- Verify printer: `lpstat -p`
- Verify Firebase credentials: `sudo cat /etc/vprint/firebase-credentials.json`

### Kiosk not showing status updates
- Check browser console for errors
- Verify Firestore connection
- Check job status in Firestore console
- Verify Firestore rules allow read access

### Jobs stuck in 'pending'
- Check Pi service is running
- Check Pi logs for errors
- Verify printer is online: `lpstat -p`
- Check network connectivity on Pi

## Next Steps

1. Deploy code changes to kiosk
2. Complete Raspberry Pi setup (Steps 1-3 above)
3. Test with real print jobs
4. Monitor logs for first few jobs
5. Set up log rotation for `/var/log/vprint-print-server.log`

## Files Modified

- `lib/printService.ts` - Added `monitorJobStatus()` method
- `components/PrintingStatus.tsx` - Removed direct printing, added status monitoring
- `firestore.rules` - Verified (no changes needed)

## Files Created

- `CUPS_DIRECT_SILENT_PRINTING_SETUP.md` - Complete CUPS setup guide
- `CUPS_QUICK_REFERENCE.md` - Quick command reference
- `RASPBERRY_PI_CUPS_SETUP_STEPS.txt` - Step-by-step setup instructions
- `raspberry-pi-print-server/configure_cups_silent.sh` - Automated CUPS setup script





















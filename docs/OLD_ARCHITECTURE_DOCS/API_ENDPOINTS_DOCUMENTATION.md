# FastAPI Server - API Endpoints Documentation

## Overview

The FastAPI server at `kiosk.harvestbridge.in` provides 5 main endpoints for printing and monitoring.

---

## 1. POST `/print` - Print Document

**Purpose:** Upload a document and print it with specified settings.

### Request Format
- **Method:** POST
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `file` (required): The document file to print (PDF, DOC, DOCX, images, etc.)
  - `settings` (optional): JSON string with print settings

### Settings JSON Format
```json
{
  "copies": 1,
  "orientation": "portrait",
  "color": true,
  "duplex": false,
  "paperSize": "A4",
  "pages": "1-3"
}
```

### Settings Parameters
- `copies` (int): Number of copies (1-99)
- `orientation` (string): "portrait" or "landscape"
- `color` (boolean): `true` for color, `false` for black & white
- `duplex` (boolean): `true` for double-sided, `false` for single-sided
- `paperSize` (string): "A4", "Letter", or "Legal"
- `pages` (string, optional): Page range like "1-3" or "1-3,5,7-9"

### Response (Success)
```json
{
  "status": "queued",
  "job_id": 81,
  "printer": "Brother_HL_L5210DN_series@BRN94DDF82DA002.local",
  "settings": {
    "copies": 1,
    "orientation": "portrait",
    "color": false,
    "duplex": true,
    "paperSize": "A4",
    "pages": "1-3"
  },
  "total_pages": 3
}
```

### What It Does
1. Receives the file and settings from the kiosk
2. **Extracts selected pages** from PDF if `pages` is specified (using `pdftk` or `qpdf`)
3. Converts non-PDF files to PDF (Office docs, images, text files)
4. Submits print job to CUPS with all settings
5. Returns job ID for status tracking

### Key Features (Updated)
- ✅ **Page extraction BEFORE printing** - Only selected pages are printed
- ✅ **Duplex support** - Double-sided printing works correctly
- ✅ **All settings applied** - Color, orientation, paper size, copies

---

## 2. GET `/printers` - List Printers

**Purpose:** Get a list of all printers available in CUPS.

### Request Format
- **Method:** GET
- **No parameters required**

### Response
```json
{
  "printers": [
    "Brother_HL_L5210DN_series@BRN94DDF82DA002.local",
    "HP_LaserJet_Pro",
    "Canon_PIXMA"
  ]
}
```

### What It Does
- Returns all printer names configured in CUPS
- Used to verify printer availability

---

## 3. GET `/printers/{name}/status` - Printer Status

**Purpose:** Get the current status of a specific printer.

### Request Format
- **Method:** GET
- **Path Parameter:** `name` - The printer name (e.g., "Brother_HL_L5210DN_series@BRN94DDF82DA002.local")

### Example Request
```
GET /printers/Brother_HL_L5210DN_series@BRN94DDF82DA002.local/status
```

### Response
```json
{
  "name": "Brother_HL_L5210DN_series@BRN94DDF82DA002.local",
  "state_code": 3,
  "state": "idle",
  "state_message": "Ready to print",
  "state_reasons": [],
  "raw": {
    "printer-state": 3,
    "printer-state-message": "Ready to print",
    ...
  }
}
```

### State Codes
- `3` = "idle" (ready to print)
- `4` = "processing" (currently printing)
- `5` = "stopped" (error or paused)

### What It Does
- Checks if printer is available and ready
- Returns current printer state
- Used for health monitoring

---

## 4. GET `/jobs/{job_id}` - Job Status

**Purpose:** Check the status of a print job.

### Request Format
- **Method:** GET
- **Path Parameter:** `job_id` - The job ID returned from `/print` endpoint

### Example Request
```
GET /jobs/81
```

### Response (Processing)
```json
{
  "job_id": 81,
  "state_code": 5,
  "state": "processing",
  "total_pages": 3,
  "completed_pages": 1,
  "current_page": 2,
  "is_finished": false,
  "raw": {
    "job-state": 5,
    "job-media-sheets": 3,
    "job-media-sheets-completed": 1,
    ...
  }
}
```

### Response (Completed)
```json
{
  "job_id": 81,
  "state_code": 9,
  "state": "completed",
  "total_pages": 3,
  "completed_pages": 3,
  "current_page": 3,
  "is_finished": true,
  "raw": {
    "job-state": 9,
    "job-media-sheets": 3,
    "job-media-sheets-completed": 3,
    ...
  }
}
```

### State Codes
- `3` = "pending" (waiting in queue)
- `4` = "pending-held" (held/paused)
- `5` = "processing" (currently printing)
- `6` = "stopped" (stopped)
- `7` = "canceled" (canceled)
- `8` = "aborted" (aborted due to error)
- `9` = "completed" (finished successfully)

### What It Does
- Returns current status of a print job
- Shows progress (completed_pages / total_pages)
- Used by kiosk to track printing progress
- Automatically cleans up metadata when job finishes

---

## 5. GET `/health` - Health Check

**Purpose:** Simple health check to verify server and CUPS are working.

### Request Format
- **Method:** GET
- **No parameters required**

### Response (Healthy)
```json
{
  "status": "ok",
  "printers": [
    "Brother_HL_L5210DN_series@BRN94DDF82DA002.local"
  ]
}
```

### Response (Error)
```json
{
  "detail": "Error message"
}
```

### What It Does
- Verifies FastAPI server is running
- Checks CUPS connection
- Lists available printers
- Used for monitoring and debugging

---

## Complete Request/Response Flow

### Example: Printing 3 Pages with Duplex

1. **Kiosk sends print request:**
   ```bash
   POST /print
   Content-Type: multipart/form-data
   
   file: document.pdf (13 pages)
   settings: {
     "copies": 1,
     "orientation": "portrait",
     "color": false,
     "duplex": true,
     "paperSize": "A4",
     "pages": "1-3"
   }
   ```

2. **Server responds:**
   ```json
   {
     "status": "queued",
     "job_id": 81,
     "printer": "Brother_HL_L5210DN_series@BRN94DDF82DA002.local",
     "settings": {...},
     "total_pages": 3
   }
   ```

3. **Kiosk polls job status:**
   ```bash
   GET /jobs/81
   ```

4. **Server responds with progress:**
   ```json
   {
     "job_id": 81,
     "state": "processing",
     "total_pages": 3,
     "completed_pages": 1,
     "current_page": 2,
     "is_finished": false
   }
   ```

5. **When complete:**
   ```json
   {
     "job_id": 81,
     "state": "completed",
     "total_pages": 3,
     "completed_pages": 3,
     "is_finished": true
   }
   ```

---

## Key Improvements in Updated Server

### Before (Old Version)
- ❌ Used CUPS `page-ranges` option (doesn't work with many printers)
- ❌ Printed all pages even when specific pages were selected
- ❌ Duplex might not work correctly

### After (Fixed Version)
- ✅ Extracts pages from PDF BEFORE printing using `pdftk`/`qpdf`
- ✅ Only selected pages are printed
- ✅ Duplex works correctly
- ✅ All settings properly applied

---

## Testing the Endpoints

### Using Swagger UI (Interactive Docs)
1. Open `http://kiosk.harvestbridge.in/docs` in browser
2. Click on any endpoint to expand it
3. Click "Try it out" button
4. Fill in parameters and click "Execute"

### Using cURL

**Print a document:**
```bash
curl -X POST "http://kiosk.harvestbridge.in/print" \
  -F "file=@document.pdf" \
  -F 'settings={"copies":1,"orientation":"portrait","color":false,"duplex":true,"paperSize":"A4","pages":"1-3"}'
```

**Check job status:**
```bash
curl "http://kiosk.harvestbridge.in/jobs/81"
```

**List printers:**
```bash
curl "http://kiosk.harvestbridge.in/printers"
```

**Check printer status:**
```bash
curl "http://kiosk.harvestbridge.in/printers/Brother_HL_L5210DN_series@BRN94DDF82DA002.local/status"
```

**Health check:**
```bash
curl "http://kiosk.harvestbridge.in/health"
```


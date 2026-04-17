# FastAPI Print Server Integration

This application now supports printing via a FastAPI print server endpoint.

## Configuration

Add the following environment variable to your `.env.local` file:

```env
NEXT_PUBLIC_FASTAPI_PRINT_URL=http://192.168.29.3:8000/print
```

If not set, it defaults to `http://192.168.29.3:8000/print`.

## How It Works

1. **User clicks Print button** in the preview screen
2. **PDF is downloaded** from the document URL (Firebase Storage or other source)
3. **PDF is sent** to the FastAPI endpoint as `multipart/form-data`
4. **FastAPI server** receives the file and prints it
5. **Status is updated** in the UI based on the server response

## FastAPI Endpoint Format

The application sends a POST request to the FastAPI endpoint with the following format:

```bash
POST http://192.168.29.3:8000/print
Content-Type: multipart/form-data

file: <PDF file>
```

The endpoint should accept:
- **Method**: POST
- **Content-Type**: `multipart/form-data`
- **Field name**: `file`
- **File type**: `application/pdf`

## Implementation Details

### PrintService.printWithFastAPI()

Located in `lib/printService.ts`, this method:
- Fetches the PDF from the document URL with retry logic
- Handles CORS and 412 errors
- Creates a FormData object with the PDF file
- Sends it to the FastAPI endpoint
- Returns success/failure status

### PrintingStatus Component

The `handlePrint()` function in `components/PrintingStatus.tsx`:
- Updates job status to 'printing'
- Calls `PrintService.printWithFastAPI()`
- Updates UI based on result
- Marks document as printed on success
- Updates Firestore job status

## Error Handling

The implementation includes:
- **Retry logic** for PDF downloads (3 retries with exponential backoff)
- **CORS error handling** for cross-origin PDFs
- **412 error handling** for Firebase Storage precondition failures
- **Server error handling** with detailed error messages
- **User-friendly toast notifications** for success/failure

## Testing

To test the integration:

1. Ensure your FastAPI server is running at the configured URL
2. Create a print job in Firebase with a valid PDF URL
3. Enter the token/scan QR code in the kiosk
4. Click the Print button
5. Check the browser console for detailed logs
6. Verify the PDF is sent to the FastAPI server

## Logging

The implementation uses the logger utility for detailed logging:
- `printWithFastAPI:start` - When print process begins
- `printWithFastAPI:fetching-pdf` - When downloading PDF
- `printWithFastAPI:pdf-fetched` - When PDF is successfully downloaded
- `printWithFastAPI:sending-to-server` - When sending to FastAPI
- `printWithFastAPI:success` - When print job succeeds
- `printWithFastAPI:error` - When any error occurs

Check browser console or your logging system for these events.




















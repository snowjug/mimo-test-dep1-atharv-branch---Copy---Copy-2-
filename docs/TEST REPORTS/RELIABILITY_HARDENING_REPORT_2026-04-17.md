# Reliability + Observability + Hardening Report (2026-04-17)

## Scope
Core flow hardening for upload -> print options -> payment -> print code, plus practical smoke checks and alert hooks.

## Backend Reliability Changes

### 1) Shared reliability utilities
- Added `mimo-backend/api/flow-utils.js`.
- Introduced:
  - `PRICE_PER_PAGE`
  - `normalizeApiError()`
  - `buildUploadApiResponse()`
  - `summarizeOps()`
  - `detectOpsAlerts()`

### 2) API response consistency
- Added standardized helpers in `mimo-backend/api/server.js`:
  - `sendApiSuccess(res, data)`
  - `sendApiError(res, status, err, fallbackCode, fallbackMessage)`
  - `emitOpsAlert(alert)`
- Applied to critical flow endpoints (upload/order/payment/print paths) to reduce fragile ad-hoc response handling.

### 3) Upload hardening
- Upload now returns normalized summary/totals from actual processed results.
- Better edge-case behavior for empty uploads and mixed success/failure conversion results.

### 4) Create-order hardening
- `create-order` now handles conversion-failed edge cases explicitly:
  - Returns `409` with conversion-failure details if pending jobs are absent but conversion failures exist.
- Order creation failures now emit high-severity ops alert payloads.

### 5) Payment-success idempotency behavior
- If no pending jobs exist but paid jobs already exist, endpoint returns success with existing pin/print code.
- Prevents unnecessary hard failures on duplicate payment-success calls.
- Payment update failures now emit high-severity ops alerts.

### 6) Kiosk print reliability/alerts
- Print trigger errors now emit ops alerts.
- Standardized error envelope used for key kiosk print failures.

### 7) Ops checks endpoint
- Added `GET /ops/checks` in `mimo-backend/api/server.js`.
- Summarizes queue/stock health and returns alert candidates for practical operational checks.

## Automated Test Coverage Added
- Added `mimo-backend/tests/flow-utils.test.js` with smoke/unit coverage for:
  - Safe API error normalization fallback.
  - Upload response total calculations.
  - Ops summary + alert detection (queue backlog and low virtual stock).
- Updated `mimo-backend/package.json`:
  - `"test:smoke": "node --test tests/*.test.js"`

## Validation Results
- Backend syntax:
  - `node --check mimo-backend/api/server.js` -> passed.
- Backend smoke tests:
  - `npm --prefix mimo-backend run test:smoke` -> passed (3/3).
- Frontend build validation:
  - `npm --prefix mimo-frontend/MIMO run build` -> passed.

## Remaining Recommended Follow-ups
1. Expand integration coverage to include end-to-end API path (upload -> create-order -> payment-success -> print dispatch) with mocked external gateways.
2. Route `emitOpsAlert()` to a real sink (Slack/Webhook/Monitoring provider) instead of console logging.
3. Gradually migrate all non-core endpoints to the same standardized response envelope.
4. Add alert threshold tuning per kiosk/site to reduce noisy signals.

# MIMO Architecture Overview (Simple)

This document explains the current MIMO system in simple terms.

## 1. What This System Does

MIMO is a print platform with three main user experiences:

- Web app for users to upload files and place print orders.
- Kiosk app for on-site print operations.
- Backend APIs that manage users, files, payments, and print jobs.

## 2. Main Parts

## Frontend (User App)

Path: `mimo-frontend/`

- Built with React + Vite.
- Handles login, file upload, print options, and payment UI.
- Calls backend APIs for business operations.

## Kiosk Frontend

Path: `mimo-kiosk/mimo-frontend/`

- Kiosk-focused UI for print workflow on a local device.
- Used in printer/kiosk environments.

## Backend API

Path: `mimo-backend/api/`

- Node.js/Express service.
- Core entry point is `server.js`.
- Manages authentication, uploads, conversion, payment, and print job state transitions.

## Firebase

- Firestore stores app data (users, jobs, orders, transactions).
- Storage keeps uploaded files and generated print files.
- Firebase Admin SDK is used by backend to securely access data.

## 3. High-Level Data Flow

1. User logs in from frontend.
2. User uploads file via backend.
3. Backend stores file in Firebase Storage.
4. Backend creates/updates Firestore records for job lifecycle.
5. User selects print settings and proceeds to payment.
6. Payment status is confirmed and order state is updated.
7. Kiosk/print flow reads ready jobs and completes printing.
8. Final status is stored for history and tracking.

## 4. Why There Are Multiple Docs

The docs folder is split to keep topics clear:

- `docs/DEPLOYMENT/` for deployment and production guidance.
- `docs/SETUP/` for setup and installation guides.
- `docs/TEST REPORTS/` for testing and validation reports.
- `docs/OLD_ARCHITECTURE_DOCS/` as archive/reference from previous architecture.

## 5. Important Design Principles

- Keep backend as source of truth for status transitions.
- Preserve compatibility when schema changes are introduced.
- Separate concerns: UI, API, storage, and device/kiosk flow.
- Document setup/deployment/testing separately for easier onboarding.

## 6. Quick Start for New Team Members

1. Read this file first.
2. Read setup docs in `docs/SETUP/`.
3. Review deployment docs in `docs/DEPLOYMENT/`.
4. Check test evidence in `docs/TEST REPORTS/`.
5. Use `docs/OLD_ARCHITECTURE_DOCS/` only for legacy context.

---

If you are unsure where a feature belongs:

- UI issue: frontend or kiosk.
- API/data issue: backend + Firebase.
- Production issue: deployment docs.
- Legacy behavior question: old architecture docs.

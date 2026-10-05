# FASE 12 — Authentication, Privacy and Audit

**APPROVED / BUILT**

## Authentication

When Firebase is enabled, the HTTP API requires `Authorization: Bearer <Firebase ID token>`. The token is verified with Firebase Admin Auth and the Firebase UID becomes the owner identity.

`X-Owner-ID` remains available only when authentication is not required, supporting local development and backend tests.

## Authorization

Owner identity is established at the HTTP boundary and passed to owner-scoped application services. A client cannot choose another owner through a request header when Firebase authentication is required.

## Privacy

- Firestore collections remain under `users/{ownerId}/...`.
- Authentication tokens are never persisted.
- Audit events store method, path, owner ID, request ID and timestamp.
- Request bodies, credentials and authorization headers are not stored in audit events.
- No bank connection or automatic external financial operation is introduced.

## Auditability

Authenticated mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`) generate an owner-scoped audit event.

API: `GET /api/v1/audit`

## Configuration

- `FIREBASE_ENABLED=false` keeps local HTTP-only mode.
- `AUTH_REQUIRED` controls whether Firebase ID-token verification is required.
- When Firebase is enabled, authentication is required by default.

## Boundary

Firebase Auth establishes identity and authorization. It does not introduce public SaaS accounts, multi-tenancy, bank connections, payroll or automatic money movement.

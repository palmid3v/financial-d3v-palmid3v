# FASE 4 — Go Application Foundation

**Status: APPROVED / BUILT**

FASE 4 turns the domain and Firestore design into a runnable Go API foundation.

## Delivered

- environment-driven configuration;
- Firebase Admin Go SDK v4.22.0 integration;
- Firestore client initialization;
- owner-scoped repository adapters;
- health and readiness endpoints;
- JSON error responses;
- request IDs and HTTP logging;
- application-service boundaries between HTTP, domain and persistence;
- safe credential configuration through environment variables or Application Default Credentials.

## Runtime

`HTTP → Application Service → Domain + Repository Contract → Firestore Adapter → Firestore`

Firebase is disabled by default so the API can still boot for local development. Set `FIREBASE_ENABLED=true` and provide a project ID plus ADC or a credentials file to enable persistence.

## Ownership

Until FASE 12 introduces Firebase Authentication, data endpoints require `X-Owner-ID`. This is an explicit temporary development boundary, not the final authentication model.

## Endpoints

- `GET /health`
- `GET /ready`
- `POST /api/v1/accounts`
- `GET /api/v1/accounts`
- `GET /api/v1/accounts/{accountID}`
- `GET /api/v1/accounts/{accountID}/balance`
- `POST /api/v1/transactions`
- `GET /api/v1/transactions?accountId=...`
- `GET /api/v1/transactions?start=...&end=...`
- `GET /api/v1/transactions/{transactionID}`

## Security boundary

Service-account JSON files and private credentials are never committed. Firebase recommends Application Default Credentials for Google-managed environments and supports credential files for local trusted environments. See the official Firebase setup guidance. 

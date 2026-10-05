# FASE 16 — Private Deployment & Operations

**APPROVED / BUILT**

## Objective

Make Financial-D3v runnable as a private application with explicit environment configuration, production safety gates, reproducible builds and documented operational recovery.

This phase does not introduce public SaaS, multi-tenancy, bank connections or automatic financial operations.

## Runtime modes

### Development

- APP_ENV=development
- FIREBASE_ENABLED=false
- in-memory repositories
- AUTH_REQUIRED=false
- X-Owner-ID is accepted only because authentication is disabled
- default CORS origins are localhost Vite origins
- data is intentionally ephemeral

### Production

Production configuration is rejected unless:
- FIREBASE_ENABLED=true
- AUTH_REQUIRED=true
- FIREBASE_PROJECT_ID is configured
- at least one CORS_ALLOWED_ORIGINS value exists

Production owner identity comes from verified Firebase ID tokens.

## Configuration contract

| Variable | Development | Production |
| --- | --- | --- |
| APP_ENV | development | production |
| HTTP_ADDR | :8080 | deployment-specific |
| FIREBASE_ENABLED | false | true |
| FIREBASE_PROJECT_ID | optional | required |
| FIREBASE_CREDENTIALS_FILE | optional | secret/ADC path |
| AUTH_REQUIRED | false | true |
| CORS_ALLOWED_ORIGINS | localhost defaults | explicit HTTPS frontend origin(s) |

Never commit Firebase service-account credentials or other secrets.

Prefer Application Default Credentials / platform secret injection in hosted environments over storing credential files in the repository.

## Health and readiness

- GET /health confirms the HTTP process is alive.
- GET /ready confirms the financial application services are initialized.
- Firebase availability is exposed as a dependency signal.
- Development mode is ready even though Firebase is intentionally disabled because it uses in-memory persistence.

## CORS

CORS is allowlist-based.

Development defaults:
- http://localhost:5173
- http://127.0.0.1:5173

Production must explicitly configure the private frontend origin.

Unknown origins do not receive CORS permission and unknown preflight origins receive 403.

## PWA operations

The frontend build generates:
- manifest.webmanifest
- service worker
- Workbox precache

The frontend uses autoUpdate. A deployment should publish the generated dist/ directory as an atomic version so clients can receive the next service-worker revision safely.

## CI/CD

GitHub Actions validates:
1. Go dependency resolution
2. Go tests
3. Go build
4. frontend lockfile installation
5. frontend production build

Deployment remains intentionally environment-specific. CI does not receive Firebase credentials.

## Backups

Firestore is the production source of truth.

A private deployment must establish:
- scheduled Firestore exports to a controlled backup location
- retention policy
- access control for backups
- restore procedure
- periodic restore verification

Financial-D3v does not claim that an unverified backup exists merely because the application is deployed.

## Recovery

### API failure

1. Check /health.
2. Check /ready.
3. Inspect logs using request IDs.
4. Roll back to the previous known-good application image/build if the current release is faulty.
5. Do not modify financial data manually as a first response.

### Data incident

1. Stop writes if required by the incident.
2. Identify the affected time window.
3. Preserve audit events and logs.
4. Restore into an isolated recovery target first.
5. Verify owner scoping and financial invariants.
6. Resume production writes only after validation.

## Deployment boundary

FASE 16 provides the operational contract and deployable artifacts. A specific cloud/VPS provider is deliberately not hard-coded because Financial-D3v is a private application and the owner may choose the private runtime later.

FASE 17 will perform the final production-readiness review.

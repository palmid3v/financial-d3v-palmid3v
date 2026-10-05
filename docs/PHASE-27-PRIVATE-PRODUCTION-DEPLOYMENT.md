# 🚀 FASE 27 — Private Production Deployment

**Status:** BUILT / VALIDATION PENDING  
**Last updated:** 2026-10-04  
**Timezone:** America/Bogota (COT, UTC-05:00)

## Objective
Move Financial-D3v from validated local/private development to a reproducible production runtime while keeping the product private at the authentication and data-authorization boundaries.

## Architecture
```text
Browser
  ↓ HTTPS
Firebase Hosting
  ├── React/Vite PWA
  └── /api/** rewrite
          ↓
      Cloud Run
          ↓
       Go API
          ↓
 Firebase Auth + Firestore
```

## Built
- Firebase Hosting configuration and SPA fallback.
- `/api/**` rewrite to `financial-d3v-api` in `us-central1`.
- Same-origin production API configuration.
- Manual GitHub Actions deployment.
- GitHub OIDC → Google Workload Identity Federation deployment model.
- Artifact Registry image publication.
- Dedicated Cloud Run API runtime service account.
- Production auth/security configuration.
- `/health` and `/ready` deployment smoke checks.
- Protected API smoke test requiring `401` without a Firebase ID token.
- Rollback path based on retained images/revisions/releases.

## Required GitHub `production` environment variables
```text
GCP_WORKLOAD_IDENTITY_PROVIDER
GCP_DEPLOYER_SERVICE_ACCOUNT
GCP_REGION
ARTIFACT_REGISTRY_REPOSITORY
API_SERVICE_NAME
API_RUNTIME_SERVICE_ACCOUNT
BACKUP_SERVICE_ACCOUNT
BACKUP_BUCKET
BACKUP_JOB_NAME
PRODUCTION_ORIGIN
FIREBASE_PROJECT_ID
FIREBASE_WEB_API_KEY
```

## One-time bootstrap
```bash
export GCP_PROJECT_ID=financial-d3v-palmid3v
export GCP_REGION=us-central1
export ARTIFACT_REGISTRY_REPOSITORY=financial-d3v
export API_RUNTIME_SERVICE_ACCOUNT=financial-d3v-api@$GCP_PROJECT_ID.iam.gserviceaccount.com
export BACKUP_SERVICE_ACCOUNT=financial-d3v-backup@$GCP_PROJECT_ID.iam.gserviceaccount.com
export BACKUP_BUCKET=financial-d3v-palmid3v-backups
export DEPLOYER_SERVICE_ACCOUNT=financial-d3v-deployer@$GCP_PROJECT_ID.iam.gserviceaccount.com
bash deploy/bootstrap-production.sh
```

Then configure GitHub OIDC/WIF so only this repository can use the deployer account.

## Deployment
GitHub → Actions → **Production deployment** → **Run workflow**.

The workflow builds/pushes the API, deploys Cloud Run, checks health/readiness, builds/deploys Firebase Hosting, validates protected API `401`, and deploys the backup Job.

## Initial domain
`https://financial-d3v-palmid3v.web.app`

A custom domain can later replace `PRODUCTION_ORIGIN` and `CORS_ALLOWED_ORIGINS`.

## Validation required
- [ ] real production deployment
- [ ] Cloud Run healthy
- [ ] Hosting deployment successful
- [ ] `/health` = 200
- [ ] `/ready` = 200
- [ ] protected unauthenticated API = 401
- [ ] authenticated production login
- [ ] Transactions, Savings, Debts, Net Worth smoke test
- [ ] PWA installation over HTTPS
- [ ] rollback artifact/revision confirmed

FASE 27 remains **BUILT / VALIDATION PENDING** until real production execution is verified.

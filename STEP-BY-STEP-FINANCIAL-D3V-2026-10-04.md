# STEP-BY-STEP-FINANCIAL-D3V-2026-10-04

**Last updated:** 2026-10-04  
**Timezone:** America/Bogota (COT, UTC-05:00)  
**Repository:** `palmid3v/financial-d3v-palmid3v`  
**Source of truth:** GitHub `main`

## Current checkpoint
**FASE 26 — APPROVED / BUILT**

Observed local evidence:
```text
go test ./...  → PASS
go build ./... → PASS
npm ci → PASS / 0 vulnerabilities
npm run build → PASS
PWA generation → PASS
Firestore rules/index deploy → PASS
authenticated frontend runtime → PASS
```

# 🚀 FASE 27 — Private production deployment

Architecture:
```text
Browser → HTTPS → Firebase Hosting → /api/** → Cloud Run Go API
                                      ↓
                               Firebase Auth
                                      ↓
                                   Firestore
```

One-time bootstrap:
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

Configure GitHub `production` environment variables:
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

Run: **GitHub → Actions → Production deployment → Run workflow**

Validation:
- [ ] production deployment passes
- [ ] Hosting and Cloud Run healthy
- [ ] `/health` 200
- [ ] `/ready` 200
- [ ] protected unauthenticated API 401
- [ ] authenticated production login
- [ ] Transactions/Savings/Debts/Net Worth smoke test
- [ ] PWA install over HTTPS
- [ ] rollback artifact confirmed

# 💾 FASE 28 — Backup / recovery

Schedule: `03:00 America/Bogota` daily.

Configure:
```bash
export GCP_PROJECT_ID=financial-d3v-palmid3v
export GCP_REGION=us-central1
export BACKUP_JOB_NAME=financial-d3v-firestore-backup
export BACKUP_SERVICE_ACCOUNT=financial-d3v-backup@$GCP_PROJECT_ID.iam.gserviceaccount.com
export SCHEDULER_LOCATION=us-central1
export BACKUP_SCHEDULE='0 3 * * *'
export BACKUP_TIMEZONE='America/Bogota'
bash deploy/schedule-backup.sh
```

Validate export at:
```text
gs://financial-d3v-palmid3v-backups/firestore/<timestamp>/
```

Restore only into an isolated recovery project:
```bash
export RECOVERY_PROJECT_ID=<isolated-recovery-project>
export BACKUP_BUCKET=financial-d3v-palmid3v-backups
export EXPORT_PATH=firestore/<timestamp>
bash deploy/restore-firestore.sh
```

Acceptance:
- [ ] export exists
- [ ] import succeeds
- [ ] owner-scoped data preserved
- [ ] balances reconcile
- [ ] debt/savings/net-worth reconcile
- [ ] authenticated restored app reads data
- [ ] restore result recorded

## Important
**FASES 27–28 are BUILT / VALIDATION PENDING.** Real production and recovery execution are still required before approval.

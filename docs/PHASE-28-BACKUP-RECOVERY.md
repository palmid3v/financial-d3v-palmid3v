# 💾 FASE 28 — Backup / Recovery

**Status:** BUILT / VALIDATION PENDING  
**Last updated:** 2026-10-04  
**Timezone:** America/Bogota (COT, UTC-05:00)

## Objective
Create an automated, reproducible Firestore backup and recovery path.

## Architecture
```text
Cloud Scheduler
      ↓
Cloud Run Job
      ↓
Firestore managed export
      ↓
Cloud Storage
      ↓
180-day lifecycle
```

## Built
- Firestore managed-export backup script.
- Dedicated Cloud Run backup Job image.
- Dedicated backup service account.
- Cloud Storage backup bucket baseline.
- 180-day lifecycle policy.
- Cloud Scheduler configuration script.
- Isolated recovery-project restore script.
- Secret rotation procedure.
- Disaster-recovery checklist.

## Default schedule
`03:00 America/Bogota` daily.

Configure after the backup Job exists:
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

## Backup location
`gs://financial-d3v-palmid3v-backups/firestore/<timestamp>/`

## Restore
Never restore to production as the first recovery action. Use an isolated recovery project.
```bash
export RECOVERY_PROJECT_ID=<isolated-recovery-project>
export BACKUP_BUCKET=financial-d3v-palmid3v-backups
export EXPORT_PATH=firestore/<timestamp>
bash deploy/restore-firestore.sh
```

After import, verify owner-scoped paths, account balances, debt balances, savings progress, net worth and authenticated application reads.

## Validation required
- [ ] backup bucket exists
- [ ] lifecycle policy active
- [ ] manual backup Job succeeds
- [ ] scheduled backup succeeds
- [ ] export exists in Cloud Storage
- [ ] recovery-project import succeeds
- [ ] owner-scoped data preserved
- [ ] financial balances/reports reconcile
- [ ] restore result recorded

FASE 28 remains **BUILT / VALIDATION PENDING** until a real backup and real restore test succeed.

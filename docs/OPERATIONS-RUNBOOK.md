# Financial-D3v Operations Runbook

## Local development
```powershell
go test ./...
go build ./...
go run ./cmd/api
```

```powershell
cd frontend
npm ci
npm run build
npm run dev
```

## Production checklist
- [ ] APP_ENV=production
- [ ] Firebase enabled
- [ ] Firebase project ID configured
- [ ] Dedicated Cloud Run runtime identity
- [ ] AUTH_REQUIRED=true
- [ ] Exact HTTPS origin in CORS_ALLOWED_ORIGINS
- [ ] `/health` = 200
- [ ] `/ready` = 200
- [ ] Protected API without authentication = 401
- [ ] Authenticated API request succeeds
- [ ] Hosting deployment live

## Release
1. Confirm CI is green.
2. Run the manual Production deployment workflow.
3. Verify Cloud Run revision, `/health`, `/ready` and protected `401`.
4. Verify Hosting login and a read-only financial request.
5. Verify the PWA/service-worker update.

## Rollback
Rollback the API to the previous known-good Cloud Run revision/image and the frontend to the previous Hosting release.

## Backup
Path: `Cloud Scheduler → Cloud Run Job → Firestore export → Cloud Storage`.
Default schedule: `03:00 America/Bogota` daily.

Configure:
```bash
bash deploy/schedule-backup.sh
```

A backup is not verified until a restore test succeeds.

## Restore
1. Select a known-good export.
2. Prepare an isolated recovery project.
3. Run `deploy/restore-firestore.sh`.
4. Verify owner scoping, balances, debts, savings and net worth.
5. Record the result.

## Retention
Default lifecycle is 180 days in `deploy/firestore-backup-lifecycle.json`.

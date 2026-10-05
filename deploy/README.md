# Private production deployment artifacts

Production baseline:

```text
Browser → Firebase Hosting → /api/** rewrite → Cloud Run Go API → Firebase Auth + Firestore
```

## API
```bash
docker build -f deploy/api.Dockerfile -t financial-d3v-api .
```

Runtime configuration is injected by Cloud Run. Never bake Firebase credentials into images.

## Frontend
Production build uses `VITE_API_BASE_URL=""` so the browser stays on the Hosting origin.

## Backup
```bash
docker build -f deploy/backup.Dockerfile -t financial-d3v-firestore-backup .
```

Cloud Scheduler invokes the Cloud Run backup Job.

## Security
- GitHub OIDC/WIF for deployment.
- No service-account JSON in source control.
- Firebase Auth remains the application authorization boundary.
- Firestore remains owner-scoped.

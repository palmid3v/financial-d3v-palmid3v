# Financial-D3v Operations Runbook

## Local development

Backend:

~~~powershell
go test ./...
go build ./...
go run ./cmd/api
~~~

Frontend:

~~~powershell
cd frontend
npm ci
npm run build
npm run dev
~~~

Expected local backend:
- port 8080
- Firebase disabled
- in-memory persistence
- ephemeral data
- owner header fallback

## Production startup checklist

- [ ] APP_ENV=production
- [ ] Firebase enabled
- [ ] Firebase project ID configured
- [ ] Firebase Admin credentials supplied through the runtime secret mechanism
- [ ] Firebase Auth enabled
- [ ] AUTH_REQUIRED=true
- [ ] exact frontend origin configured in CORS_ALLOWED_ORIGINS
- [ ] no .env or credential file copied into the image
- [ ] /health returns 200
- [ ] /ready returns 200
- [ ] authenticated API request succeeds
- [ ] unauthenticated API request is rejected

## Release procedure

1. Merge the intended commit to main.
2. Confirm CI is green.
3. Build immutable API/frontend artifacts from that commit.
4. Deploy the API.
5. Deploy the frontend.
6. Check /health and /ready.
7. Open the private frontend.
8. Verify authentication and one read-only financial request.
9. Keep the previous artifact available for rollback.

## Rollback

Rollback means redeploying the previous known-good artifacts. Do not edit production financial data to compensate for an application deployment problem.

## Backup verification

A backup is operationally useful only when restoration has been tested. Keep a documented restore test separate from production and record the date/result.

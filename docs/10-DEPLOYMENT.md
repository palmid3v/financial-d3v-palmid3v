# Deployment — Private Production Baseline

**Status: FASE 27 BUILT / VALIDATION PENDING**

Financial-D3v production uses Firebase Hosting + Cloud Run + Firestore.

## Architecture
- Firebase Hosting serves the React/Vite PWA over HTTPS.
- Hosting rewrites `/api/**` to the Go API on Cloud Run.
- Cloud Run runs immutable API revisions.
- Firebase Authentication provides identity.
- Go enforces authorization and owner scoping.
- Firestore is the financial source of truth.
- Artifact Registry stores deployable images.
- GitHub Actions deploys through Workload Identity Federation.

## Setup
1. Run `deploy/bootstrap-production.sh`.
2. Configure GitHub OIDC/WIF.
3. Configure the GitHub `production` environment variables.
4. Run the manual Production deployment workflow.
5. Configure the daily backup schedule.
6. Validate authenticated production runtime and backup recovery.

## Rollback
Keep the previous Cloud Run revision/image and Hosting release. Roll back those artifacts rather than editing financial records to compensate for a release failure.

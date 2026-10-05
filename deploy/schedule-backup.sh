#!/usr/bin/env bash
set -euo pipefail

: "$GCP_PROJECT_ID"; : "$GCP_REGION"; : "$BACKUP_JOB_NAME"; : "$BACKUP_SERVICE_ACCOUNT"; : "$SCHEDULER_LOCATION"
SCHEDULE="${BACKUP_SCHEDULE:-0 3 * * *}"
TIMEZONE="${BACKUP_TIMEZONE:-America/Bogota}"

gcloud run jobs add-iam-policy-binding "$BACKUP_JOB_NAME" --region="$GCP_REGION" --member="serviceAccount:$BACKUP_SERVICE_ACCOUNT" --role="roles/run.invoker" >/dev/null

if gcloud scheduler jobs describe "$BACKUP_JOB_NAME" --location="$SCHEDULER_LOCATION" >/dev/null 2>&1; then
  gcloud scheduler jobs update http "$BACKUP_JOB_NAME" --location="$SCHEDULER_LOCATION" --schedule="$SCHEDULE" --time-zone="$TIMEZONE" --uri="https://run.googleapis.com/v2/projects/$GCP_PROJECT_ID/locations/$GCP_REGION/jobs/$BACKUP_JOB_NAME:run" --http-method=POST --oauth-service-account-email="$BACKUP_SERVICE_ACCOUNT"
else
  gcloud scheduler jobs create http "$BACKUP_JOB_NAME" --location="$SCHEDULER_LOCATION" --schedule="$SCHEDULE" --time-zone="$TIMEZONE" --uri="https://run.googleapis.com/v2/projects/$GCP_PROJECT_ID/locations/$GCP_REGION/jobs/$BACKUP_JOB_NAME:run" --http-method=POST --oauth-service-account-email="$BACKUP_SERVICE_ACCOUNT"
fi

echo "Backup schedule configured: $SCHEDULE ($TIMEZONE)"

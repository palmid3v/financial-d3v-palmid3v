#!/usr/bin/env bash
set -euo pipefail

: "$GCP_PROJECT_ID"
: "$BACKUP_BUCKET"

PREFIX="${BACKUP_PREFIX:-firestore}"
TIMESTAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
EXPORT_PATH="$PREFIX/$TIMESTAMP"

echo "Starting Firestore export"
gcloud firestore export "gs://$BACKUP_BUCKET/$EXPORT_PATH" \
  --project="$GCP_PROJECT_ID" \
  --database="(default)"

echo "Firestore export completed: gs://$BACKUP_BUCKET/$EXPORT_PATH"

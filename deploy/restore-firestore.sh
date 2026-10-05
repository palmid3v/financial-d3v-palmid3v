#!/usr/bin/env bash
set -euo pipefail

: "$RECOVERY_PROJECT_ID"
: "$BACKUP_BUCKET"
: "$EXPORT_PATH"

echo "WARNING: this imports into the recovery project: $RECOVERY_PROJECT_ID"
read -r -p "Type RESTORE to continue: " CONFIRM
if [[ "$CONFIRM" != "RESTORE" ]]; then
  echo "Restore cancelled."
  exit 1
fi

gcloud firestore import "gs://$BACKUP_BUCKET/$EXPORT_PATH" \
  --project="$RECOVERY_PROJECT_ID" \
  --database="(default)"
echo "Restore operation submitted for $RECOVERY_PROJECT_ID"

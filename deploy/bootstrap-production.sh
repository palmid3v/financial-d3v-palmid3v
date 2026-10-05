#!/usr/bin/env bash
set -euo pipefail

: "$GCP_PROJECT_ID"; : "$GCP_REGION"; : "$ARTIFACT_REGISTRY_REPOSITORY"
: "$API_RUNTIME_SERVICE_ACCOUNT"; : "$BACKUP_SERVICE_ACCOUNT"; : "$BACKUP_BUCKET"; : "$DEPLOYER_SERVICE_ACCOUNT"

gcloud config set project "$GCP_PROJECT_ID"
gcloud services enable artifactregistry.googleapis.com run.googleapis.com cloudscheduler.googleapis.com firestore.googleapis.com firebase.googleapis.com firebasehosting.googleapis.com

if ! gcloud artifacts repositories describe "$ARTIFACT_REGISTRY_REPOSITORY" --location="$GCP_REGION" >/dev/null 2>&1; then
  gcloud artifacts repositories create "$ARTIFACT_REGISTRY_REPOSITORY" --repository-format=docker --location="$GCP_REGION" --description="Financial-D3v production images"
fi

for account in "$API_RUNTIME_SERVICE_ACCOUNT" "$BACKUP_SERVICE_ACCOUNT" "$DEPLOYER_SERVICE_ACCOUNT"; do
  account_id="${account%@*}"
  if ! gcloud iam service-accounts describe "$account" >/dev/null 2>&1; then
    gcloud iam service-accounts create "$account_id" --display-name="$account_id"
  fi
done

gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" --member="serviceAccount:$API_RUNTIME_SERVICE_ACCOUNT" --role="roles/datastore.user" >/dev/null
gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" --member="serviceAccount:$BACKUP_SERVICE_ACCOUNT" --role="roles/datastore.importExportAdmin" >/dev/null
gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" --member="serviceAccount:$DEPLOYER_SERVICE_ACCOUNT" --role="roles/run.developer" >/dev/null
gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" --member="serviceAccount:$DEPLOYER_SERVICE_ACCOUNT" --role="roles/artifactregistry.writer" >/dev/null
gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" --member="serviceAccount:$DEPLOYER_SERVICE_ACCOUNT" --role="roles/firebasehosting.admin" >/dev/null
gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" --member="serviceAccount:$DEPLOYER_SERVICE_ACCOUNT" --role="roles/serviceusage.serviceUsageConsumer" >/dev/null
gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" --member="serviceAccount:$DEPLOYER_SERVICE_ACCOUNT" --role="roles/serviceusage.apiKeysViewer" >/dev/null

if ! gcloud storage buckets describe "gs://$BACKUP_BUCKET" >/dev/null 2>&1; then
  gcloud storage buckets create "gs://$BACKUP_BUCKET" --location="$GCP_REGION" --project="$GCP_PROJECT_ID"
fi
gcloud storage buckets update "gs://$BACKUP_BUCKET" --lifecycle-file=deploy/firestore-backup-lifecycle.json
gcloud storage buckets add-iam-policy-binding "gs://$BACKUP_BUCKET" --member="serviceAccount:$BACKUP_SERVICE_ACCOUNT" --role="roles/storage.admin" >/dev/null

for runtime in "$API_RUNTIME_SERVICE_ACCOUNT" "$BACKUP_SERVICE_ACCOUNT"; do
  gcloud iam service-accounts add-iam-policy-binding "$runtime" --member="serviceAccount:$DEPLOYER_SERVICE_ACCOUNT" --role="roles/iam.serviceAccountUser" >/dev/null
done

echo "Production bootstrap complete. Configure GitHub OIDC/WIF next."

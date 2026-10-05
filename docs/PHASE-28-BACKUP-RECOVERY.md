# FASE 28 — Cloud Backup / Recovery (Historical)

**Status:** RETIRED / HISTORICAL  
**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)

This document records the former Firestore backup architecture using Cloud Scheduler, Cloud Run Jobs and Cloud Storage.

## Historical architecture

`text
Cloud Scheduler
      ↓
Cloud Run Job
      ↓
Firestore managed export
      ↓
Cloud Storage
`

This is no longer the financial recovery boundary.

## Current recovery model

The active product uses the encrypted user-controlled .fdv file.

Recovery is based on:
- encrypted vault backup;
- separate vault password;
- application import/open;
- representative-data verification.

There is no server-side financial database in Vault mode.

## Current guide

See:
- `docs/OPERATIONS-RUNBOOK.md⟧
- `docs/PHASE-31-SECURITY-RECOVERY-PRODUCTION.md⟧

**Do not execute the historical cloud backup commands for the active $0 architecture.**

# FASE 27 — Private Production Deployment (Historical)

**Status:** RETIRED / HISTORICAL  
**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)

This document records the former Firebase Hosting + Cloud Run + Firestore production path.

## Historical architecture

`text
Browser
  ↓ HTTPS
Firebase Hosting
  ↓
Cloud Run
  ↓
Go API
  ↓
Firebase Auth + Firestore
`

This architecture was superseded by the $0 local-first Financial Vault.

## Current replacement

Use:

**GitHub main → Vercel Hobby → React/Vite PWA → encrypted Financial Vault**

The old deployment artifacts remain in the repository for traceability only.

**Do not use this document as the active deployment guide.**

See:
- `docs/10-DEPLOYMENT.md⟧
- `docs/DEPLOYMENT-VERCEL.md⟧
- `docs/08-SECURITY.md⟧
- `docs/OPERATIONS-RUNBOOK.md⟧

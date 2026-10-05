# Deployment — Financial-D3v

**Status:** ACTIVE $0 DEPLOYMENT BASELINE  
**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)

## Active architecture

```text
GitHub main
    ↓
Vercel Hobby
    ↓
React + Vite PWA
    ↓
encrypted Financial Vault
```

The active deployment has no financial-data server.

## Vercel configuration

The repository root `vercel.json` defines:

- install command: `cd frontend && npm ci`;
- build command: `cd frontend && npm run build`;
- output directory: `frontend/dist`.

## Local production-like verification

From repository root:

```powershell
.\scripts\validate.ps1
```

Then:

```powershell
cd frontend
npm run preview
```

Validate Vault creation, save/export, unlock, lock, recovery and PWA behavior.

## Cost boundary

The target remains $0 for personal use.

No Cloud Run, Artifact Registry, Cloud Scheduler or paid Google Cloud financial-data dependency is required.

Firebase may remain in the repository as historical infrastructure or as optional future identity infrastructure, but it is not the active financial-data persistence layer.

## Production validation

A real Vercel deployment is validated separately by:
1. deploying from `main`;
2. opening the deployed application;
3. creating/opening a test vault;
4. validating lock/unlock/recovery;
5. validating PWA metadata/install/update behavior;
6. recording the exact result.

The application architecture is considered deployment-ready; a deployment URL is not claimed as validated unless it has actually been tested.

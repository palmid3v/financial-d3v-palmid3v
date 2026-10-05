# Financial-D3v Documentation

**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)  
**Source of truth:** GitHub `main`

## Current state

FASES 1–31 are complete through the first-release local-first foundation.

Active architecture:

```text
GitHub
  ↓
Vercel Hobby
  ↓
React + Vite + Tailwind PWA
  ↓
FDV1 encrypted Financial Vault
  ↓
decrypted in-memory state
  ↓
Go/WASM local computation
```

FASE 32 is the next planned evolution.

## Canonical documents

| Document | Purpose |
|---|---|
| `../CONTEXT.md` | Current continuation context |
| `../STEP-BY-STEP-FINANCIAL-D3V-2026-10-05.md` | Step-by-step project history |
| `01-PRODUCT-VISION.md` | Product vision |
| `02-REQUIREMENTS.md` | Requirements |
| `03-ARCHITECTURE.md` | Current architecture |
| `04-DOMAIN-MODEL.md` | Domain model |
| `05-DATABASE-DESIGN.md` | Persistence history and Vault boundary |
| `06-API-DESIGN.md` | Legacy API boundary |
| `07-FINANCIAL-RULES.md` | Financial invariants |
| `08-SECURITY.md` | Active security model |
| `09-TESTING.md` | Testing |
| `10-DEPLOYMENT.md` | Active deployment |
| `11-AI-DEVELOPMENT-WORKFLOW.md` | AI workflow |
| `12-LEARNING-GO.md` | Go learning |
| `13-ROADMAP.md` | Roadmap |
| `14-UI-UX-DESIGN.md` | UX direction |
| `15-FINANCIAL-EDUCATION.md` | Education |
| `16-PRIVATE-PERSONAL-USE.md` | Private-use scope |
| `VALIDATION-RUNNER.md` | Validación del Proyecto |
| `OPERATIONS-RUNBOOK.md` | Operations/recovery |
| `DESIGN-SYSTEM-REFERENCE.md` | Visual system |
| `DEPLOYMENT-VERCEL.md` | Vercel deployment |

## Phase history

Phase documents are preserved for traceability. Later architecture decisions override earlier deployment assumptions.

Important evolution:
1. Initial Go + Firestore/API architecture.
2. Product UX expansion.
3. Authentication/security hardening.
4. Re-scope to $0 local-first encrypted Financial Vault.
5. Go moved to local WASM computation.
6. FASE 30 established design/PWA/deployment foundation.
7. FASE 31 completed security/recovery validation.

## Historical cloud documents

These are not active deployment instructions:
- `PHASE-27-PRIVATE-PRODUCTION-DEPLOYMENT.md`
- `PHASE-28-BACKUP-RECOVERY.md`
- Cloud Run / Artifact Registry / Scheduler material under `deploy/`.

Follow current architecture documents for active work.

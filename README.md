# Financial-D3v

Financial-D3v is a private personal-finance application and financial learning workspace.

## Product loop
Record → Categorize → Understand → Plan → Save → Review → Learn → Adjust

## Approved stack
React + Vite · Tailwind · Dark Mode · PWA · Go 1.27 · REST/HTTP · Firebase Firestore · Firebase Auth · Firebase Hosting · Cloud Run · GitHub Actions.

## Private production architecture
```text
Browser
  ↓ HTTPS
Firebase Hosting
  ├── React/Vite PWA
  └── /api/** rewrite
          ↓
      Cloud Run
          ↓
      Go API
          ↓
 Firebase Auth + Firestore
```

## Current checkpoint
- FASES 1–17: APPROVED / BUILT
- FASES 18–24: IMPLEMENTED / VALIDATION PENDING
- FASE 25: APPROVED / BUILT
- FASE 26: APPROVED / BUILT
- FASE 27: BUILT / VALIDATION PENDING
- FASE 28: BUILT / VALIDATION PENDING

FASE 27 and FASE 28 are implemented in the repository. Real production deployment and real restore execution remain validation gates.

## Next execution
1. Configure Google Cloud and GitHub WIF.
2. Run the Production deployment workflow.
3. Configure the daily Firestore backup schedule.
4. Execute a real backup.
5. Restore into an isolated recovery project.
6. Validate and explicitly approve FASES 27–28.

## Documentation
- `docs/PHASE-27-PRIVATE-PRODUCTION-DEPLOYMENT.md`
- `docs/PHASE-28-BACKUP-RECOVERY.md`
- `docs/10-DEPLOYMENT.md`
- `docs/OPERATIONS-RUNBOOK.md`
- `docs/13-ROADMAP.md`
- `STEP-BY-STEP-FINANCIAL-D3V-2026-10-04.md`

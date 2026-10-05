# Roadmap — Financial-D3v

**Baseline:** October 4, 2026  
**Timezone:** America/Bogota (COT, UTC-05:00)

A phase is only APPROVED / BUILT after implementation, validation and explicit approval.

## Lifecycle
- [x] PLATFORM — FASES 1–17
- [x] PRODUCT FOUNDATION — FASES 18–24
- [x] PRODUCT COMPLETION — FASE 25
- [x] AUTH / SECURITY — FASE 26
- [ ] PRIVATE PRODUCTION VALIDATION — FASES 27–28
- [ ] DATA INTEGRITY — FASE 29
- [ ] OBSERVABILITY — FASE 30
- [ ] HISTORICAL INTELLIGENCE — FASE 31
- [ ] CONTINUOUS EVOLUTION — FASE 32+

## FASE 26 — Authentication / security hardening
**Status: APPROVED / BUILT**

## FASE 27 — Private production deployment
**Status: BUILT / VALIDATION PENDING**
- [x] Firebase Hosting configuration
- [x] `/api/**` rewrite
- [x] Cloud Run deployment workflow
- [x] Artifact Registry flow
- [x] Dedicated API runtime identity
- [x] Production auth/security configuration
- [x] Health/readiness checks
- [x] Protected `401` smoke test
- [x] Rollback procedure
- [ ] Real production deployment
- [ ] Authenticated production smoke test
- [ ] PWA installation validation
- [ ] Explicit phase approval

## FASE 28 — Backup / recovery
**Status: BUILT / VALIDATION PENDING**
- [x] Firestore export strategy
- [x] Cloud Run backup Job
- [x] Cloud Storage retention baseline
- [x] Cloud Scheduler setup script
- [x] Isolated restore procedure
- [x] Recovery checklist
- [ ] Real scheduled backup
- [ ] Real export verification
- [ ] Real recovery-project restore
- [ ] Restore validation
- [ ] Explicit phase approval

## FASE 29 — Financial data integrity
**Status: PLANNED**

## FASE 30 — Observability
**Status: PLANNED**

## FASE 31 — Historical financial intelligence
**Status: PLANNED**

## FASE 32+ — Continuous evolution
**Status: CONTINUOUS / PLANNED**

## Master execution rule
1. Define scope.
2. Implement.
3. Test.
4. Build.
5. Validate runtime.
6. Review UX/security.
7. Update documentation.
8. Mark APPROVED / BUILT only after evidence exists.
9. Move to the next phase.

# Roadmap — Financial-D3v

**Baseline:** October 5, 2026  
**Timezone:** America/Bogota (COT, UTC-05:00)  
**Source of truth:** GitHub `main`

A phase is **APPROVED / BUILT / VALIDATED** only after implementation, validation evidence and explicit approval.

## Lifecycle

- [x] PLATFORM — FASES 1–17
- [x] PRODUCT FOUNDATION — FASES 18–24
- [x] PRODUCT COMPLETION — FASE 25
- [x] AUTH / SECURITY — FASE 26
- [~] CLOUD PRODUCTION PATH — historical / retired / re-scoped
- [x] FINANCIAL VAULT — FASE 27
- [x] VAULT DATA MIGRATION — FASE 28
- [x] GO FINANCIAL ENGINE — FASE 29
- [x] $0 DEPLOYMENT / DESIGN / PWA — FASE 30
- [x] SECURITY / RECOVERY / VALIDATION — FASE 31
- [ ] HISTORICAL FINANCIAL INTELLIGENCE — FASE 32
- [ ] CONTINUOUS EVOLUTION — FASE 33+

## FASE 27 — Financial Vault

**Status: APPROVED / BUILT / VALIDATED**

Completed:
- FDV1 envelope;
- PBKDF2 SHA-256, 600,000 iterations;
- AES-256-GCM;
- random salt and IV;
- encrypted export/import;
- Vault lifecycle;
- in-memory decrypted state;
- 15-minute auto-lock;
- wrong-password, tamper, malformed and version tests.

## FASE 28 — Vault Data Migration

**Status: APPROVED / BUILT / VALIDATED**

The Vault-backed workspace is the active data boundary for accounts, categories, transactions, budgets, savings, debts, assets, liabilities, net worth, education and dashboard/report calculations.

Changes are re-sealed into an encrypted .fdv file rather than persisted as plaintext financial data remotely.

## FASE 29 — Go Financial Engine

**Status: APPROVED / BUILT / VALIDATED**

Go 1.27 is part of the local computation boundary through WebAssembly.

Validated calculations:
- cash flow;
- account balances and transfers;
- budget actuals;
- savings progress;
- debt principal reduction;
- net worth.

## FASE 30 — $0 Deployment + Design System + Motion + PWA

**Status: APPROVED / BUILT / VALIDATED**

Completed:
- Vercel Hobby target;
- root `vercel.json`;
- production frontend build;
- Vite PWA generation;
- design tokens;
- dark-first visual system;
- responsive navigation;
- motion foundation;
- reduced-motion support;
- install/update metadata;
- stale-cache cleanup;
- WASM precache allowance.

## FASE 31 — Security / Recovery / Validation

**Status: APPROVED / BUILT / VALIDATED**

Automated evidence:
- `npm ci` PASS;
- frontend tests 10/10 PASS;
- frontend production build PASS;
- WASM build PASS;
- Vault security source audit PASS;
- Go tests PASS;
- Go build PASS.

Runtime evidence:
- vault creation/save/open;
- incorrect password rejection;
- lock/unlock/recovery;
- security boundary review.

Expected incorrect-password behavior:

```text
Vault unavailable.
Unable to open the Financial Vault.
Check the password or file integrity.
```

## FASE 32 — Historical Financial Intelligence

**Status: PLANNED**

Purpose:
- historical trends;
- comparisons;
- recurring patterns;
- financial learning from historical data;
- local/private analytics.

Constraint: preserve the encrypted Vault as source of truth and do not reintroduce remote plaintext financial persistence.

## FASE 33+

**Status: CONTINUOUS / PLANNED**

## Historical cloud path

The original Firebase/Cloud Run/Artifact Registry/Cloud Scheduler deployment and backup phases remain for traceability.

They are not active architecture and are not prerequisites for the current $0 Financial Vault release.

## Master execution rule

1. Define scope.
2. Implement.
3. Test.
4. Build.
5. Validate runtime.
6. Review UX/security.
7. Update documentation.
8. Record evidence.
9. Mark phase complete.
10. Move to the next phase.

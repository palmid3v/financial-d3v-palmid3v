# Roadmap — Financial-D3v

**Baseline:** October 5, 2026  
**Timezone:** America/Bogota (COT, UTC-05:00)

A phase is only APPROVED / BUILT after implementation, validation and explicit approval.

## Lifecycle

- [x] PLATFORM — FASES 1–17
- [x] PRODUCT FOUNDATION — FASES 18–24
- [x] PRODUCT COMPLETION — FASE 25
- [x] AUTH / SECURITY — FASE 26
- [~] CLOUD PRODUCTION PATH — FASES 27–28 RETIRED / RE-SCOPED
- [ ] FINANCIAL VAULT — FASE 27
- [ ] VAULT DATA MIGRATION — FASE 28
- [ ] GO FINANCIAL ENGINE — FASE 29
- [x] $0 DEPLOYMENT — FASE 30
- [ ] SECURITY / RECOVERY VALIDATION — FASE 31
- [ ] HISTORICAL INTELLIGENCE — FASE 32
- [ ] CONTINUOUS EVOLUTION — FASE 33+

## FASE 26 — Authentication / security hardening

**Status: APPROVED / BUILT**

The existing Firebase authentication work remains available, but it is no longer the financial-data encryption boundary.

## FASE 27 — Financial Vault

**Status: BUILT / SECURITY VALIDATION PENDING**

- [x] Define local-first encrypted vault architecture.
- [x] Define versioned `FDV1` envelope.
- [x] Implement PBKDF2 key derivation.
- [x] Implement AES-256-GCM authenticated encryption.
- [x] Implement random salt and IV generation.
- [x] Implement vault payload validation.
- [x] Implement encrypted file export.
- [ ] Build Vault Gate UI.
- [ ] Build vault create/open/lock lifecycle.
- [x] Build auto-lock (15-minute inactivity timeout).
- [ ] Add browser persistence audit.
- [x] Add tamper/wrong-password tests.
- [ ] Complete security review.

## FASE 28 — Vault data migration

**Status: PLANNED**

Migrate every financial module from remote API persistence to the decrypted in-memory vault:

1. Accounts and categories.
2. Transactions.
3. Budgets.
4. Savings goals/contributions.
5. Debts/payments.
6. Assets/liabilities/net worth.
7. Education.
8. Dashboard/report calculations.
9. Import/export and migration from the current Firebase dataset.
10. Remove plaintext financial persistence from the old API path.

Acceptance:
- no financial plaintext leaves the browser;
- refresh while locked exposes no financial data;
- lock removes the active dataset;
- export/import is lossless for supported schema;
- domain invariants remain unchanged.

## FASE 29 — Go financial engine

**Status: PLANNED**

Keep Go as a real part of the product without sending private financial data to a remote server.

Target:

```text
Financial Vault
      ↓
in-memory state
      ↓
Go financial engine / WASM boundary
      ↓
authoritative calculations
      ↓
React presentation
```

Scope:
- balance calculations;
- budget actuals;
- savings progress;
- debt principal reduction;
- net worth;
- reconciliation;
- financial education calculations.

The browser remains the privacy boundary.

## FASE 30 — $0 deployment

**Status: BUILT / VALIDATION PENDING**

Target:

```text
GitHub → Vercel Hobby → React/Vite PWA
                         ↓
                   local Financial Vault
```

Optional Firebase Spark:
- authentication;
- non-sensitive account metadata only if justified.

No Cloud Run, Artifact Registry, Cloud Scheduler, or paid Google Cloud dependency.

Vercel currently lists Hobby at $0/month; Firebase documents Spark as a no-cost plan with no payment information required for the no-cost path. citeturn2search0turn0search0

## FASE 31 — Security / recovery / production validation

**Status: BUILT / VALIDATION PENDING**

- [x] Security gate and recovery scope documented.
- [x] Wrong-password tests exist.
- [x] Tamper detection tests exist.
- [x] Malformed file tests exist.
- [x] Browser persistence source audit added.
- [x] Auto-lock/session-clear implementation present.
- [x] Export/import recovery procedure documented.
- [x] $0 Vercel production path documented.
- [x] PWA production validation checklist documented.
- [ ] Runtime security validation.
- [ ] Production deployment validation.
- [ ] Explicit approval.

## FASE 32 — Historical financial intelligence

**Status: PLANNED**

Historical trends, comparisons, patterns and deeper financial learning after the private data architecture is stable.

## FASE 33+ — Continuous evolution

**Status: CONTINUOUS / PLANNED**

## Remaining work

FASE 31 is the active final security/recovery/production gate. FASE 32+ is post-finalization evolution.

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


## FASE 28 — Vault Data Migration

**Status: BUILT / VALIDATION PENDING**

The financial workspace is now mounted directly on the encrypted in-memory Financial Vault. Accounts, transactions, budgets, savings, debts, net worth, education, dashboard calculations, and the approved dark/minimal product UI are implemented. Validation remains pending before FASE 28 can be approved.

See docs/PHASE-28-VAULT-DATA-MIGRATION.md for the acceptance checklist.


## FASE 29 — Go Financial Engine / Local Computation Boundary

**Status: BUILT / VALIDATION PENDING**

A pure Go financial engine now computes cash flow, account balances, transfers, budget actuals, savings progress, debt principal reduction, and net worth without Firebase, HTTP, Firestore, or remote financial persistence.

A browser WASM adapter and local build script were added. The Dashboard uses the Go engine when the WASM artifact is available and falls back to the same in-memory JavaScript calculations when it is not.

See `docs/PHASE-29-GO-FINANCIAL-ENGINE.md`.

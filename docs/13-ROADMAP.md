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
- [~] HISTORICAL FINANCIAL INTELLIGENCE / BANK IMPORT — FASE 32 (in progress; 32.1 and 32.2 implementation pending local validation)
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

## FASE 32 — Historical Financial Intelligence + Bank Statement Import

**Status: IN PROGRESS — FASE 32.1 CSV importer and initial 32.2 Nequi PDF adapter implemented on `feat/phase-32-2-nequi-pdf-parser`; Windows validation pending.**

The first vertical slice adds a local-first CSV batch importer, review screen, account selection, transfer destination selection, duplicate fingerprints and import audit metadata in the encrypted vault. See `docs/32-BANK-STATEMENT-IMPORT.md`.

Target account scope:
- Nequi: first statement adapter; historical imports January–November 2026.
- Bancolombia: future adapter, reusing the same import engine.
- Efectivo: remains manually registered.

Remaining subphases:
- 32.2 PDF.js parser and Nequi PDF text adapter (implemented; OCR remains out of scope);
- 32.3 multi-period January–November batch control;
- 32.4 opening/closing balance continuity reconciliation;
- 32.5 transfer matching across Nequi, Bancolombia and cash;
- 32.6 classification and links to debts/receivables;
- 32.7 idempotency, recovery, audit and security validation.

Current limitation: PDF.js text extraction is implemented for the January 2026 Nequi layout, but is not validated in the Windows runtime yet. Encrypted PDFs, scanned PDFs and OCR are unsupported. Monthly continuity reconciliation remains in 32.4.

Constraint: preserve the encrypted Vault as source of truth, process files locally, and do not reintroduce remote plaintext financial persistence.

## FASE 34 — PALMI Ecosystem Business Finance Integration

**Status: ACCEPTED / DOCUMENTED — implementation not started.**

Architecture decision: `docs/34-PALMI-ECOSYSTEM-BUSINESS-FINANCE-ADR.md`. Event contract: `docs/contracts/palmi-business-financial-event.schema.json`.

Decisions: separate encrypted Personal and Business `.fdv` vaults; cloud delivery of minimized, authenticated, non-PII commercial events; cash-basis recognition only when money is received or paid. The cloud inbox is an event transport, never a vault or financial plaintext database.

Implementation sequence:
1. Business vault identity, schema namespace and independent lifecycle/recovery.
2. Cash ledger, payment/refund/expense and daily close domain rules.
3. Cloud event inbox with tenant isolation, signature verification, idempotency, cursor, retry and quarantine.
4. Sandwichies trusted payment/refund producer.
5. Cupboard/business purchase event producer.
6. Financial-D3v authenticated importer; encrypted vault save must succeed before event acknowledgement.
7. Reconciliation, security audit and staging release validation.

Exit gates: no personal vault data or keys leave the device; no event is acknowledged before encrypted Business vault save; duplicate events have no duplicate ledger effect; unpaid orders and unpaid bills are excluded from cash totals; inventory purchase and stock consumption are not double-counted; daily close exposes variances. Production deployment requires explicit approval.

**No implementation, cloud resources, production credentials or billing have been enabled by this documentation decision.**

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


## Documentation checkpoint — 2026-10-18

- The owner confirmed the deployed HTTPS version opens the encrypted vault from a phone; the local HTTP address `http://192.168.1.3:5173/` did not provide a reliable secure context for Web Crypto.
- Continue manual save → lock → reopen checks on mobile and desktop, using a test vault before touching the original.
- The account-linked finance changes described in README remain a candidate until reconciled with current main, tests and release validation.
- FASE 32 historical financial intelligence remains planned. Currency conversion/rate sourcing remains unimplemented.
- Preserve `.fdv` as persistence source of truth and keep decrypted financial data in active memory only.

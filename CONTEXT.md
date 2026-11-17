# CONTEXT — Financial-D3V

**Document review:** 2026-11-17  
**Timezone:** America/Bogota (COT, UTC-05:00)  
**Repository:** `palmid3v/financial-d3v-palmid3v`  
**Source of truth:** GitHub `main`

This is the product and engineering continuity reference. Code, dependency manifests and dated validation evidence take precedence over plans or older handoffs.

## Product identity

Financial-D3V is a private personal-finance and financial-learning application.

Core loop:

**Record → Categorize → Understand → Plan → Save → Review → Learn → Adjust**

## Active architecture

```text
Vercel HTTPS
    ↓
React + Vite + Tailwind PWA
    ↓
FDV1 encrypted .fdv vault
    ↓
Decrypted in-memory state (while unlocked)
    ↓
Local Go 1.27 / WebAssembly financial calculations
```

The encrypted `.fdv` file is the persistence source of truth. Historical Go REST, Firebase/Firestore and cloud financial persistence are retained for traceability only; they are not the active financial-data path.

## Privacy and vault security boundary

- FDV1 is a versioned encrypted envelope.
- PBKDF2-SHA256 with 600,000 iterations derives the key.
- AES-256-GCM with a 128-bit authentication tag protects vault contents.
- Each vault uses fresh random salt and IV.
- Password and decrypted financial state remain in memory while unlocked.
- Lock and the documented 15-minute inactivity auto-lock clear active state/password references.
- No intentional plaintext financial persistence in localStorage, sessionStorage, IndexedDB, Firebase/Firestore, Vercel, GitHub or remote Go APIs.
- Firebase Auth, if used, is identity only; it is not the vault key.
- The `.fdv` file and password are separate recovery dependencies. No password recovery service exists.

This is an application-level design, not an external security audit or certification.

## Financial invariants

- Monetary values use integer minor units and an explicit currency.
- Internal transfers are not expenses or income.
- Savings contributions update goal progress and are not ordinary expenses.
- Debt payments distinguish principal, interest and fees; only principal reduces outstanding debt.
- Net worth is assets minus liabilities.
- The domain/financial engine is the calculation authority; the UI presents and explains results.

## Application and engine

- Frontend: React, Vite, Tailwind CSS and PWA/Workbox.
- Local calculation engine: Go 1.27 compiled to WebAssembly.
- Frontend directory: `frontend/`.
- Go source and tests: `internal/` and root `go.mod`.
- WASM build helpers and validation: `scripts/`.
- Vercel is the web hosting target; financial vault contents remain user-controlled files and in-memory state.

Exact frontend dependencies are in `frontend/package.json`; Go modules are in `go.mod`.

## Roadmap and ecosystem integrations

- Phases 1–31 are the documented local-first foundation.
- Phase 32 bank-statement import and financial-history work is under implementation/validation. The latest handoff describes CSV work on a feature branch; do not assume all parser or PDF/Nequi capabilities exist on `main` without checking the selected branch and files.
- ADR-034 (2026-11-12) accepts a future Business Finance architecture: independent Personal and Business encrypted vaults plus minimized authenticated non-PII commercial events. Implementation has not started.
- Personal and Business vaults must have independent files, keys/passwords, salts, IVs, backups and lifecycle state.
- No cloud service or PALMI application may receive a vault, password, derived key, bank statement or decrypted financial ledger.

## Ecosystem ownership

- Financial-D3V owns private personal finance and, if separately implemented, the Business cash ledger.
- Sandwichies owns orders, payment state and commercial operations.
- Cupboard owns inventory and stock movements.
- DayFlow owns tasks, reminders and planning.
- The shared launcher is not a financial data relay.

## Validation and release limits

The 2026-11-12 quality checkpoint records a successful maintenance PR validation on 2026-11-13: 32/32 frontend tests and Go test/build passed. Manual HTTPS save → lock → reopen, ledger reconciliation and independent security review remained gates in that checkpoint. These are historical results, not a fresh 2026-11-17 run. Do not claim full release validation or an external security audit.

## Development and recovery

The frontend is in `frontend/`. Inspect its `package.json` before running frontend scripts. Root scripts include validation and security-audit workflows; inspect them before execution.

Recovery requires both a valid encrypted `.fdv` file and its correct password. Preserve the file, open the application, select the vault, unlock it and verify representative records/totals. Lost passwords cannot be recovered by the application.

## Canonical documents

- `docs/README.md`
- `docs/08-SECURITY.md`
- `docs/13-ROADMAP.md`
- `docs/07-FINANCIAL-RULES.md`
- `docs/OPERATIONS-RUNBOOK.md`
- `docs/32-BANK-STATEMENT-IMPORT.md` (if present on the selected branch)
- `docs/34-PALMI-ECOSYSTEM-BUSINESS-FINANCE-ADR.md`
- `QUALITY-CHECKPOINT-2026-11-12.md`

Keep historical documents for traceability. Add fresh validation evidence with its actual date, commit and results.

---
**Financial-D3V · PALMI-D3V**

# Financial-D3v

> 🔐 Private personal-finance application + financial learning workspace.

**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)  
**Source of truth:** GitHub `main`

## Product

Financial-D3v helps a private user record, understand, plan and learn from personal finances while keeping the financial source of truth under the user's control.

**Core loop:** Record → Categorize → Understand → Plan → Save → Review → Learn → Adjust

**Education:** FACT → CALCULATION → INTERPRETATION → ACTION

## Current architecture — $0 local-first

```text
GitHub
   ↓
Vercel Hobby
   ↓
React + Vite + Tailwind PWA
   ↓
Financial Vault Gate
   ↓
FDV1 encrypted vault file
   ↓
decrypted state in active memory only
   ↓
React + Go/WASM local computation
```

The encrypted .fdv file is the persistent financial source of truth. Financial plaintext is not intentionally persisted in browser storage or sent to a remote financial API.

## Approved stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| UI | Tailwind CSS |
| Design | Dark-first, information-first design system |
| PWA | Vite PWA / Workbox |
| Local computation | Go 1.27 + WebAssembly |
| Legacy API | Go REST/HTTP |
| Legacy persistence | Firebase Firestore |
| Optional identity | Firebase Auth |
| CI | GitHub Actions |
| Documentation | Markdown |

## Financial rules

- Money = integer MinorUnits + Currency.
- Transfers are not ordinary budget expenses.
- Budget actuals come from authoritative expense transactions.
- Savings contributions are goal-progress records, not ordinary expenses.
- Debt payments contain amount, principal, interest and fees.
- Only principal reduces debt balance.
- Net worth = assets − all liabilities.
- Debt balances are liabilities.
- Domain/Go calculations are authoritative; UI presents and explains results.

## Release status

| Phase | Status |
|---|---|
| FASES 1–17 | ✅ APPROVED / BUILT |
| FASES 18–24 | ✅ APPROVED / BUILT |
| FASE 25 | ✅ APPROVED / BUILT / VALIDATED |
| FASE 26 | ✅ APPROVED / BUILT / VALIDATED |
| FASE 27 | ✅ APPROVED / BUILT / VALIDATED |
| FASE 28 | ✅ APPROVED / BUILT / VALIDATED |
| FASE 29 | ✅ APPROVED / BUILT / VALIDATED |
| FASE 30 | ✅ APPROVED / BUILT / VALIDATED |
| FASE 31 | ✅ APPROVED / BUILT / VALIDATED |
| FASE 32+ | 🔵 PLANNED / CONTINUOUS EVOLUTION |

**FASES 27–31 form the first-release private/local-first foundation.**

## Validación del Proyecto

```text
Automated → Runtime → Security → Functional → PASS / FIX / APPROVED
```

Run from the repository root:

```powershell
git pull origin main
.\scripts\validate.ps1
```

Security audit:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\security-audit.ps1
```

Runtime preview:

```powershell
cd frontend
npm run preview
```

The runner does not start long-running preview processes automatically.

## Recovery

The recovery unit is the encrypted .fdv file plus its password.

1. Preserve the encrypted file.
2. Open Financial-D3v.
3. Select Open vault.
4. Select the .fdv file.
5. Enter the password.
6. Verify representative totals and records.
7. Continue working.
8. Save a new encrypted .fdv after meaningful changes.

There is no password recovery service. Losing the password means the application cannot decrypt that vault.

## Deployment

```text
GitHub main → Vercel Hobby → frontend/dist
```

Root `vercel.json` configures the Vite build from `frontend/`.

No Cloud Run, Artifact Registry, Cloud Scheduler or paid Google Cloud dependency is required for the active Financial Vault architecture.

## Documentation map

- `CONTEXT.md` — continuation context and current state.
- `STEP-BY-STEP-FINANCIAL-D3V-2026-10-05.md` — step-by-step implementation and validation.
- `docs/README.md` — documentation index.
- `docs/13-ROADMAP.md` — roadmap.
- `docs/03-ARCHITECTURE.md` — current architecture.
- `docs/07-FINANCIAL-RULES.md` — financial invariants.
- `docs/08-SECURITY.md` — active security model.
- `docs/09-TESTING.md` — testing strategy.
- `docs/10-DEPLOYMENT.md` — active deployment model.
- `docs/VALIDATION-RUNNER.md` — validation process.
- `docs/OPERATIONS-RUNBOOK.md` — operations and recovery.
- FASE 27–31 phase documents.

Older Cloud Run/Firebase production documents are historical traceability, not active deployment instructions.

## Master execution rule

1. Define scope.
2. Implement.
3. Test.
4. Build.
5. Validate runtime.
6. Review UX/security.
7. Update documentation.
8. Record evidence.
9. Mark APPROVED / BUILT only after evidence exists.
10. Move to the next phase.


## Account-linked finance workflows — 2026-10-18

This branch connects the eight finance tabs around the same account-aware ledger. It is a candidate change set and has not been merged into `main`.

Implemented in this branch:
- Transactions keep a required source account; transfers require two distinct, non-credit accounts in the same currency. Ledger rows and dashboard recent activity show account context.
- Savings contributions require a source and destination account in the goal's currency. Recording a contribution creates a linked transfer, so both account balances update without counting the transfer as an expense. Editing/deleting the contribution updates/removes its linked transfer. Linked transfers are managed from Savings to prevent ledger drift.
- Debt payments require a non-credit payment account in the debt's currency. The full payment reduces that account's balance; only principal reduces the debt liability; interest and fees count as expenses and can be assigned to an expense category. Principal payments affect cash flow but are not misclassified as ordinary spending.
- Budgets can apply to all accounts in one selected currency or a specific account. Actuals include expenses and debt interest/fees for that scope; principal and internal transfers are excluded from budget spending.
- Net worth includes positive balances in non-credit accounts and other recorded assets; negative balances in non-credit accounts are treated as liabilities. Credit-type accounts are excluded from net-worth assets to avoid double-counting; record the associated obligation in Debts.
- Account currency changes and deletion are blocked when linked transactions, payments, goals or budgets would become inconsistent.
- Dashboard cash flow, monthly trend, expense categories and savings rate account for linked debt payments. The JS finance domain is authoritative for these account-linked calculations; the existing WASM result is not allowed to overwrite them until its schema and calculations are brought into parity.
- Legacy budgets default to all accounts; legacy goal contributions and debt payments retain their historical values. Existing records without account links cannot be retroactively assigned a source account without user input.
- Added regression coverage for account-linked debt accounting, account-scoped budgets, legacy metadata normalization and credit-account net-worth handling.

Financial rules preserved:
- Money is represented as integer minor units with a currency.
- Internal transfers are not ordinary expenses.
- Debt principal alone reduces debt; interest and fees are expenses.
- Net worth is assets minus liabilities, with no silent cross-currency conversion.
- The encrypted `.fdv` file remains the persistence source of truth; decrypted financial data stays in active application memory.

Remaining validation:
- Currency conversion and exchange-rate sourcing are not implemented.
- CI, frontend tests/build, WASM build and the save → lock → reopen flow still need to pass on this branch. Desktop/mobile UX also requires runtime verification with synthetic data.
- Do not treat this change set as complete until the validation script and manual workflows pass.

Run locally from the repository root:
```powershell
.\scripts\validate.ps1
```

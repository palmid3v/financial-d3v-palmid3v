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


## Integrated 8-part build — 2026-10-18

Scope: Dashboard, Accounts, Transactions, Budgets, Savings & Goals, Debts, Net Worth, and Education. Work is being applied directly to `main`, as requested.

Implemented in the current `main` history:
- Account create/edit supports the opening balance; current balance continues to derive from the opening balance and ledger.
- Account, transaction, budget, goal, debt, asset and liability currencies are stored explicitly where supported; the dashboard groups account balances by currency and does not add unlike currencies together.
- Transaction create/edit/delete flows are available; transfers require distinct accounts with matching currencies.
- Budgets can be created, edited and deleted; budget actuals are derived from expense transactions and filtered by budget currency.
- Goals can be created and deleted only when no contributions are linked; debts can be created and deleted only when no payments are linked. These safeguards preserve linked financial history.
- Assets and liabilities can be created and deleted.
- Debt payments validate that total payment equals principal + interest + fees, and only principal reduces the outstanding balance.
- Net-worth calculations include liabilities and outstanding debt, scoped to one currency without silent exchange-rate conversion.
- The encrypted `.fdv` vault is the persistence source of truth; decrypted data is held in active application memory.

Known limitations / next work:
- Currency conversion and exchange-rate sourcing are not implemented. Cross-currency totals must remain separate.
- Editing is not yet complete for every record type; savings contributions and debt payments need full lifecycle management, and asset/liability/goal/debt edit workflows still need completion.
- Education content remains a static learning set rather than a fully contextual, data-driven coach.
- Local automated tests/build and end-to-end desktop/mobile workflows must be run against the latest `main` checkout before declaring the eight parts complete.

Validation: do not mark the integrated eight-part scope complete until `npm test`, `npm run build`, `npm run build:wasm`, the repository validation/security scripts, and local workflows for create/edit/delete → save encrypted vault → lock → reopen all pass. Use synthetic financial data for testing.

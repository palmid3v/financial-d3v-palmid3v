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

Scope: Dashboard, Accounts, Transactions, Budgets, Savings & Goals, Debts, Net Worth, and Education. Implementation changes are being applied directly to `main`, as requested.

Implemented in current `main` history:
- Account creation and editing include the opening balance; account balances remain derived from opening balance plus the ledger.
- Transactions support create, edit and delete. Domain helpers reject non-positive/unsafe amounts and malformed same-account transfers; UI validation also requires transfer accounts to share a currency.
- Budgets support create, edit and delete. Actual spending is derived from expense transactions and scoped by budget currency.
- Savings goals support create and edit. Goals with linked contributions cannot be deleted; contribution history is visible and contributions support edit/delete with confirmation.
- Debts support create and edit. Debts with linked payments cannot be deleted; payment history is visible and payments support edit/delete with confirmation. Debt editing guards against reducing original principal below principal already paid and blocks currency changes after payments exist.
- Assets and liabilities support create, edit and delete.
- Account, asset, liability, goal, debt and budget forms store their selected currency; dashboard account totals are grouped by currency.
- Debt payments validate total = principal + interest + fees; only principal reduces outstanding debt.
- Net worth includes explicit liabilities and outstanding debts, calculated separately by currency without silent conversion.
- Domain-level validation and regression tests have been added for account opening balances, transaction amounts/transfers and savings contributions.
- The encrypted `.fdv` remains the persistent source of truth; decrypted financial data is held in active application memory.

Known limitations / verification still required:
- Currency conversion and exchange-rate sourcing are not implemented. Cross-currency totals must remain separate.
- Education concepts remain a curated static learning set; current COP cash-flow, savings-rate, net-worth and budget metrics are shown contextually, but there is no personalized recommendation engine.
- Latest changes have not been run through local frontend tests/build or full desktop/mobile runtime workflows from this environment. Do not treat the integrated scope as complete until the checks below pass.

Required local verification from repository root:
```powershell
.\scripts\validate.ps1
```

Then verify with synthetic data: create/edit/delete records in all eight modules; save the encrypted `.fdv`; lock; reopen the same file; confirm records and financial totals; repeat the principal flows on desktop and mobile. The eight-part scope must not be marked complete until automated checks and these runtime flows pass.

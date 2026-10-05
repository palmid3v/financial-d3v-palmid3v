# Roadmap — Financial-D3v

The product reset on October 4, 2026 remains the authoritative roadmap baseline.

## FASE 1 — Product definition
**APPROVED / BUILT**

Private personal-finance product definition, financial-learning model, savings-first outcome, privacy boundaries and approved stack.

## FASE 2 — Financial Domain Model v2
**APPROVED / BUILT**

Money, Account, Transaction, Category, Budget, Savings Goal and Financial Period were defined with domain invariants, balance semantics and tests. FASE 7 now also persists savings contributions and derives goal progress and required pace.

## FASE 3 — Firestore persistence design
**APPROVED / BUILT**

Owner-scoped collections, repository contracts, persistence DTOs, serialization rules, query patterns, composite indexes and mapping boundaries.

## FASE 4 — Go application foundation
**APPROVED / BUILT**

Configuration, Firebase/Firestore initialization, repository adapters, HTTP foundation, health/readiness, errors, request IDs, logging and application-service boundaries.

## FASE 5 — Accounts and transactions
**APPROVED / BUILT**

First usable financial workflow: Account → Transaction → Balance, with owner scoping and currency validation.

## FASE 6 — Budgeting
**APPROVED / BUILT**

Budget periods, expense-category limits, planned-versus-actual calculations, utilization, remaining amounts, overspending detection and category endpoints.

## FASE 7 — Savings and financial habits
**APPROVED / BUILT**

Savings goals, contribution records, goal progress, remaining amount, completion percentage, required daily pace and contribution-history signals.

## FASE 8 — Financial education
**APPROVED / BUILT**

Financial education cards and contextual insights using the FACT → CALCULATION → INTERPRETATION → ACTION model. Initial topics cover cash flow, budget utilization, savings progress, transaction categorization and debt basics. Debt accounting remains FASE 9.

## FASE 9 — Debts
**APPROVED / BUILT**

Debt obligations, balances, principal/interest/fees payment components, payment history, debt status and debt-specific financial context.

## FASE 10 — Assets, liabilities and net worth
**APPROVED / BUILT**

Assets, generic liabilities, debt liabilities, account-position integration and net-worth calculation with explicit double-counting boundaries.

## FASE 11 — Reports and financial dashboard
**APPROVED / BUILT**

Period reports, cash flow, spending analysis, budget/savings/debt context and explainable dashboard metrics. See `docs/PHASE-11-REPORTS-DASHBOARD.md`.

## FASE 12 — Authentication, privacy and audit
**APPROVED / BUILT**

Firebase ID-token verification, owner authorization, privacy boundaries and owner-scoped audit events. See `docs/PHASE-12-AUTH-PRIVACY-AUDIT.md`.

## FASE 13 — Frontend product
**APPROVED / BUILT**

React + Vite + Tailwind + PWA + Dark Mode, mobile-first product shell connected to the dashboard API. See `docs/PHASE-13-FRONTEND.md`.

## FASE 14 — Testing hardening
**APPROVED / BUILT**

Payroll domain tests, explicit financial-domain coverage and frontend build validation were added to the CI path. See `docs/PHASE-14-TESTING-HARDENING.md`.

## FASE 15 — Payroll
**APPROVED / BUILT**

Payroll is implemented as a specialized owner-scoped domain without changing the product identity. It deliberately avoids unverified Colombian legal/tax compliance claims. See `docs/PHASE-15-PAYROLL.md`.

## FASE 16 — Private deployment and operations
**APPROVED / BUILT**

Environment safety gates, configurable CORS, provider-neutral container artifacts, CI reproducibility, health/readiness semantics, secrets boundaries, backup requirements and recovery procedures. See `docs/PHASE-16-PRIVATE-DEPLOYMENT-OPERATIONS.md` and `docs/OPERATIONS-RUNBOOK.md`.

## FASE 17 — Production readiness & product UX
**APPROVED / BUILT**

Final readiness review with a product-wide UI/UX pass, responsive navigation, dashboard information hierarchy, explainable financial states, education surfaces, loading/error states and private-workspace boundaries. See `docs/PHASE-17-PRODUCTION-READINESS-UX.md`.

### Current checkpoint

**FASES 1–17: APPROVED / BUILT**

**FASES RESTANTES: 0**

The backend learning path now covers:

`Account → Transaction → Balance → Budget → Planned vs Actual → Savings Goal → Contributions → Progress → Financial Education → Debt → Assets/Liabilities → Net Worth → Reports → Auth/Audit`

### Remaining path

| Fase | Focus | Status |
| --- | --- | --- |
| **13** | Frontend product | APPROVED / BUILT |
| **14** | Testing hardening | APPROVED / BUILT |
| **15** | Payroll | APPROVED / BUILT |
| **16** | Private deployment & operations | APPROVED / BUILT |
| **17** | Production readiness & product UX | APPROVED / BUILT |

### Rule

No future phase is considered complete because an older implementation exists. Every phase must be rebuilt, validated and approved against the current personal-finance vision.

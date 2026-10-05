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
**PENDING**

Debt obligations, payments, balances, interest/fees and debt-specific financial context.

## FASE 10 — Assets, liabilities and net worth
**PENDING**

Assets, liabilities, net-worth history and related calculations.

## FASE 11 — Reports and financial dashboard
**PENDING**

Cash flow, spending analysis, savings progress and explainable dashboard metrics.

## FASE 12 — Authentication, privacy and audit
**PENDING**

Firebase Auth, authorization, privacy controls and auditability.

## FASE 13 — Frontend product
**PENDING**

React + Vite + Tailwind + PWA + Dark Mode, mobile-first product experience.

## FASE 14 — Testing hardening
**PENDING**

Broader automated coverage, integration hardening and reliability validation.

## FASE 15 — Payroll
**PENDING**

Payroll remains intentionally late and is a specialized domain rather than the identity of Financial-D3v.

## FASE 16 — Private deployment and operations
**PENDING**

Private deployment, runtime configuration, operational procedures and backups.

## FASE 17 — Production readiness
**PENDING**

Final readiness review against the private personal-finance product vision.

### Current checkpoint

**FASES 1–8: APPROVED / BUILT**

The backend learning path now covers:

`Account → Transaction → Balance → Budget → Planned vs Actual → Savings Goal → Contributions → Progress → Financial Education`

### Rule

No future phase is considered complete because an older implementation exists. Every phase must be rebuilt, validated and approved against the current personal-finance vision.

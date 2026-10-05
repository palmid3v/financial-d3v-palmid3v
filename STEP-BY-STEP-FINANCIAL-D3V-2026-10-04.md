# STEP-BY-STEP-FINANCIAL-D3V-2026-10-04

Operational roadmap and chronological checklist for Financial-D3v.

This document is the working source for development. Each phase records intent, decisions, implementation, validation and remaining work. Completed work remains visible for traceability.

# Product reset — October 4, 2026

Status: **APPROVED**

The product is now explicitly treated as a **private personal financial application and financial education tool**.

The user will use the application personally to:
- understand and control income and expenses;
- manage accounts and transactions;
- budget;
- save;
- understand debts;
- track assets and liabilities;
- monitor net worth;
- learn practical financial concepts.

Payroll remains a specialized domain and will come after the personal-finance core.

## Approved stack

| Layer | Technology |
| --- | --- |
| Frontend | React + Vite |
| UI | Tailwind CSS |
| Visual | Dark Mode |
| PWA | Vite PWA |
| Backend | Go 1.27 |
| API | REST/HTTP |
| Database | Firebase Firestore |
| Auth | Firebase Auth (later) |
| CI | GitHub Actions |
| Docs | Markdown |

**Database decision:** PostgreSQL is replaced by Firebase Firestore. The previous PostgreSQL migration is historical only.

# Product principles

1. Private by design.
2. Financial ledger as source of truth.
3. Deterministic financial calculations.
4. Education in context.
5. Savings as a first-class outcome.
6. No automatic money movement.
7. No invented legal/tax rules.
8. Incremental, validated development.
9. UI explains; domain decides.
10. Documentation evolves with the product.

# Architecture direction

React + Vite + Tailwind
        ↓
Go REST API
        ↓
Application Services
        ↓
Domain
   ↙         ↘
Repositories  Domain Services
        ↓
Firebase Firestore

Firebase Authentication is a later security capability.

The app is intentionally controlled by the owner and does not need to run continuously.

# Phase 0 — Repository foundation

## Goal
Create the canonical project workspace.

## Status
Completed.

Established:
- repository identity;
- Go module;
- documentation;
- application entry point;
- package boundaries;
- .gitignore;
- CI foundation.

# Phase 1 — Product definition

## Goal
Define Financial-D3v as a broader financial product.

## Status
Completed and now expanded by the October 4 product reset.

The current product includes:
- personal finance;
- budgeting;
- savings;
- debts;
- assets/liabilities;
- net worth;
- reports;
- financial education;
- payroll as a specialized domain.

# Phase 2 — Domain model

## Goal
Model the financial language in code and documentation.

## Status
Foundation completed.

Core entities:
- User
- Account
- AccountType
- Transaction
- TransactionCategory
- Budget
- BudgetItem
- SavingsGoal
- Debt
- DebtPayment
- Asset
- Liability
- Employee
- Contract
- PayrollPeriod
- PayrollRun
- Earning
- Deduction
- AuditEvent

Money is represented deterministically with integer minor units and currency.

# Phase 3 — Persistence foundation

## Original decision
PostgreSQL schema and migrations were created.

## New approved decision
Firebase Firestore is now the active database direction.

## Status
**Product decision approved; implementation pending.**

The Firestore design will use user-owned collections/subcollections and explicit ownership.

The PostgreSQL migration is preserved only as historical reference.

## Acceptance criteria
- Firestore project configuration documented.
- Repository interfaces defined.
- Firestore adapter implemented.
- Ownership paths tested.
- Required indexes/query patterns documented.
- Local development can connect without committing secrets.
- Financial documents use deterministic monetary representation.

# Phase 4 — Go backend + Firebase foundation

## Goal
Create a reliable Go application layer connected to Firestore.

## Planned work
- configuration;
- Firebase/Firestore client initialization;
- repository interfaces;
- Firestore repositories;
- HTTP routing;
- JSON encoding;
- error model;
- validation;
- middleware;
- structured logging;
- health/readiness;
- local development configuration;
- test strategy for persistence.

## Acceptance criteria
- API starts locally.
- Firestore connection can be verified safely.
- Secrets are externalized.
- Repository tests cover ownership and document mapping.
- Health endpoint remains functional.
- Build and tests pass.

# Phase 5 — Accounts and transactions

## Goal
Deliver the first useful financial vertical slice.

Flow:
Account → Transaction → Balance → Dashboard summary → Educational explanation

## Features
- create account;
- list accounts;
- update account;
- record income;
- record expense;
- transfer between accounts;
- categorize transaction;
- query transaction history;
- calculate account balance;
- explain balance and transaction effects.

## Acceptance criteria
The user can reconstruct financial activity from authoritative transaction history and understand the basic effect of each transaction.

# Phase 6 — Budgeting

## Goal
Add financial planning and control.

Features:
- monthly budgets;
- category limits;
- planned vs actual;
- remaining budget;
- budget utilization;
- period comparison;
- educational explanations.

# Phase 7 — Savings and financial habits

## Goal
Turn saving into a measurable, understandable workflow.

Features:
- savings goals;
- target amounts;
- target dates;
- contributions;
- progress;
- required pace;
- plan vs actual;
- reflection;
- saving education.

# Phase 8 — Debts and liabilities

## Goal
Track obligations clearly.

Features:
- debt creation;
- principal;
- interest configuration;
- due dates;
- payments;
- outstanding balance;
- payment history;
- liability reporting;
- debt education.

Legal and financial terms must be verified before production-authoritative use.

# Phase 9 — Assets and net worth

## Goal
Provide a complete financial position view.

Formula:

Net Worth = Assets - Liabilities

Features:
- asset registry;
- liability registry;
- valuation snapshots;
- net-worth history;
- financial position dashboard;
- educational explanation.

# Phase 10 — Reporting and financial dashboard

## Goal
Turn financial records into useful understanding.

Reports:
- cash flow;
- income vs expenses;
- spending by category;
- budget performance;
- debt summary;
- savings progress;
- net worth.

The dashboard should explain the state, not replace the ledger.

# Phase 11 — Financial education

## Goal
Make the application actively educational.

Features:
- financial glossary;
- contextual lessons;
- insights;
- explanations;
- progress reflections;
- learning prompts;
- source/date metadata for external authoritative claims.

Education model:
Fact → Calculation → Interpretation → Suggestion

# Phase 12 — Authentication, privacy and audit

## Goal
Protect private financial information.

Planned:
- Firebase Authentication;
- server-side authorization;
- ownership boundaries;
- Firestore security rules;
- audit events;
- sensitive-operation logging;
- secret management;
- backup/recovery.

# Phase 13 — Testing hardening

Levels:
1. Unit/domain.
2. Application service.
3. Firestore repository integration.
4. HTTP/API.
5. End-to-end critical flows.

Financial invariants:
- transfer conservation;
- balance reproducibility;
- budget boundaries;
- savings progress;
- debt balances;
- net worth;
- payroll reproducibility.

# Phase 14 — Frontend implementation

## Goal
Build the approved visual product.

Stack:
- React;
- Vite;
- Tailwind;
- Vite PWA;
- Dark Mode.

Sections:
- Dashboard;
- Accounts;
- Transactions;
- Budgets;
- Savings;
- Debts;
- Assets;
- Net worth;
- Reports;
- Education;
- Settings;
- Payroll later.

# Phase 15 — Payroll domain

Payroll becomes a specialized financial domain after the personal-finance core is stable.

Flow:
Employee → Contract → Payroll period → Earnings/adjustments → Deductions → Payroll result

Colombian legal/tax/labor rules must be researched, sourced, dated, versioned and tested before authoritative production use.

# Phase 16 — AI-assisted product workflow

Maintain:
PALMI → Nexsy → analysis/architecture → implementation → human review → tests → validation → documentation.

Every major feature is reviewed from both engineering and financial-product perspectives.

# Phase 17 — Private deployment and operations

Initial model:
- local Go API;
- local React/Vite frontend;
- private Firebase project;
- controlled execution by owner.

Document:
- environment setup;
- Firebase configuration;
- backups;
- recovery;
- credential rotation;
- operational runbook.

# Phase 18 — Production readiness

Checklist:
- [ ] Authentication verified
- [ ] Authorization verified
- [ ] Firestore security rules verified
- [ ] Firestore backup/recovery tested
- [ ] Financial invariants tested
- [ ] Audit trail verified
- [ ] Error handling reviewed
- [ ] Secrets externalized
- [ ] Observability available
- [ ] Legal/regulatory assumptions documented
- [ ] Educational claims traceable
- [ ] Production runbook created

# Current implementation checkpoint

Status: **PRODUCT RESET APPROVED / DOCUMENTATION UPDATE IN PROGRESS**

Already implemented:
- Go 1.27 module;
- HTTP health endpoint;
- deterministic Money value object;
- core domain entities;
- domain tests;
- GitHub Actions CI;
- initial documentation;
- Dark Mode UX direction.

Current limitation:
- the Go API does not yet connect to Firestore;
- the frontend is not yet implemented;
- the current runtime is therefore still the technical foundation, not the complete financial application.

## Next execution point

**Phase 4 — Go backend + Firebase foundation.**

Do not start broad feature work before the Firebase repository foundation and validation are complete.

---

Financial-D3v · PALMI-D3V · October 4, 2026

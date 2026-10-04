# CONTEXT — Financial-D3v

> Context handoff for continuing the project from another chat.
>
> Canonical repository: `palmid3v/financial-d3v-palmid3v`
>
> Product name: **Financial-D3v**
>
> Date established: **October 4, 2026**

---

## 1. Project identity

**Financial-D3v** is a Go-first financial platform.

The original idea started as a Colombian payroll application, but the product direction has intentionally changed.

It is **not only a payroll application**.

Payroll is now one specialized domain inside a broader financial platform.

The application should eventually cover personal financial management, planning, obligations, assets, reporting, and payroll in one coherent system.

---

## 2. Product vision

Financial-D3v should become a single financial workspace where a user can understand and manage:

- money coming in;
- money going out;
- financial accounts;
- transactions;
- budgets;
- savings;
- debts;
- assets;
- liabilities;
- net worth;
- financial reports;
- payroll;
- employees;
- contracts;
- earnings;
- deductions;
- audit history.

The system should prioritize **clarity, traceability, deterministic calculations and a coherent financial model**.

The product should not become a collection of unrelated CRUD screens.

---

## 3. Main product domains

### Core finance

- Accounts
- Transactions
- Categories
- Income
- Expenses
- Transfers

### Planning

- Budgets
- Budget items
- Savings goals
- Contributions

### Obligations

- Debts
- Debt payments
- Liabilities
- Due dates
- Outstanding balances

### Wealth

- Assets
- Asset valuations
- Net worth
- Financial position history

### Payroll

- Employees
- Contracts
- Payroll periods
- Payroll runs
- Payroll results
- Earnings
- Deductions
- Payroll rule sets

### Reporting

- Cash flow
- Income vs expenses
- Spending by category
- Budget performance
- Debt summary
- Savings progress
- Net worth
- Payroll reports

### Platform

- Authentication
- Authorization
- Audit
- Configuration
- Observability
- Deployment
- Backup/recovery

---

## 4. Core architectural direction

Target architecture:

```
Web / Mobile UI
      ↓
   Go HTTP API
      ↓
Application Services
      ↓
     Domain
    ↙      ↘
Repositories  Domain Services
      ↓
  PostgreSQL
```

Request flow:

```
Client
  ↓
HTTP
  ↓
Router
  ↓
Handler
  ↓
Application Service
  ↓
Domain
  ↓
Repository
  ↓
PostgreSQL
  ↓
Response
```

### Architectural principle

Business rules must not be hidden inside UI components or HTTP handlers.

The frontend consumes the API.

The API coordinates use cases.

The domain owns financial behavior and invariants.

The repository owns persistence.

---

## 5. Initial Go package direction

Expected structure:

```
financial-d3v-palmid3v/
├── README.md
├── CONTEXT.md
├── STEP-BY-STEP-FINANCIAL-D3V-2026-10-04.md
├── go.mod
├── go.sum
│
├── docs/
│   ├── README.md
│   ├── 01-PRODUCT-VISION.md
│   ├── 02-REQUIREMENTS.md
│   ├── 03-ARCHITECTURE.md
│   ├── 04-DOMAIN-MODEL.md
│   ├── 05-DATABASE-DESIGN.md
│   ├── 06-API-DESIGN.md
│   ├── 07-FINANCIAL-RULES.md
│   ├── 08-SECURITY.md
│   ├── 09-TESTING.md
│   ├── 10-DEPLOYMENT.md
│   ├── 11-AI-DEVELOPMENT-WORKFLOW.md
│   ├── 12-LEARNING-GO.md
│   └── 13-ROADMAP.md
│
├── cmd/
│   └── api/
│       └── main.go
│
├── internal/
│   ├── auth/
│   ├── account/
│   ├── transaction/
│   ├── budget/
│   ├── savings/
│   ├── debt/
│   ├── asset/
│   ├── payroll/
│   ├── repository/
│   ├── database/
│   ├── http/
│   ├── config/
│   └── audit/
│
├── migrations/
├── tests/
├── scripts/
└── .github/
    └── workflows/
```

This structure is a starting point, not a reason to create unnecessary abstractions.

---

## 6. Financial model principles

### Money

Do not use binary floating-point values for persisted monetary amounts.

Before production persistence is finalized, explicitly choose and document the representation, such as:

- integer minor units; or
- an appropriate decimal representation.

### Transactions

The transaction ledger should be authoritative for financial movement.

Balances should be reproducible from authoritative transaction data and explicitly defined opening state.

### Transfers

A transfer between owned accounts should preserve total money across the involved accounts.

### Net worth

```
Net Worth = Assets - Liabilities
```

### Budgets

Budget usage must come from documented transaction inclusion rules and explicit date boundaries.

### Savings

Savings-goal progress should derive from recorded contributions, not UI-only state.

### Payroll

Payroll calculations must reference the exact rule-set version used to produce the result.

---

## 7. Payroll is now a domain, not the whole app

Payroll flow:

```
Employee
   ↓
Contract
   ↓
Payroll Period
   ↓
Earnings + Adjustments
   ↓
Deductions
   ↓
Payroll Result
   ↓
Financial / Payroll Ledger
```

Important:

Colombian payroll, tax and labor rules can change.

Never invent legal rules.

Before production use, relevant rules must be:

1. researched;
2. tied to authoritative sources;
3. documented;
4. versioned;
5. covered by tests;
6. kept traceable to the calculation.

---

## 8. Current development phases

The main operational source is:

`STEP-BY-STEP-FINANCIAL-D3V-2026-10-04.md`

Current planned sequence:

### FASE 0 — Repository foundation
Define the repository, Go module, documentation and initial runtime.

### FASE 1 — Product definition
Define the product and domain responsibilities.

### FASE 2 — Domain model
Create the core financial language and entities.

### FASE 3 — Database foundation
Introduce PostgreSQL, migrations, indexes and ownership boundaries.

### FASE 4 — Go backend foundation
HTTP server, routing, JSON, validation, errors, middleware, logging and health checks.

### FASE 5 — Accounts and transactions
First usable financial capability.

### FASE 6 — Budgeting

### FASE 7 — Savings and goals

### FASE 8 — Debts and liabilities

### FASE 9 — Assets and net worth

### FASE 10 — Reporting and dashboards

### FASE 11 — Payroll

### FASE 12 — Security and audit

### FASE 13 — Testing strategy

### FASE 14 — Frontend

### FASE 15 — AI development workflow

### FASE 16 — Deployment and operations

### FASE 17 — Production readiness

---

## 9. Documentation strategy

Documentation is part of the development process.

Any meaningful change to:

- architecture;
- domain ownership;
- database model;
- financial behavior;
- security;
- API contracts;
- deployment;
- operational behavior;

should update the relevant documentation.

The project should preserve historical decisions instead of silently replacing them.

---

## 10. Step-by-step methodology

Use the same structured workflow already established in the Cupboard project.

For each meaningful phase:

```
PHASE
  ↓
Problem
  ↓
Goal
  ↓
Current state
  ↓
Planned changes
  ↓
Implementation
  ↓
Validation
  ↓
Acceptance criteria
  ↓
Remaining work
  ↓
Checkpoint / commit
```

Completed work should stay visible in the STEP-BY-STEP file.

Do not erase historical context merely because architecture evolves.

---

## 11. Validation philosophy

Do not consider code complete because it compiles.

Validation should happen at multiple levels:

### Code

- formatting;
- build;
- static checks;
- tests.

### Domain

- financial invariants;
- deterministic calculations;
- edge cases.

### Database

- migration correctness;
- constraints;
- transactions;
- ownership boundaries.

### API

- validation;
- authorization;
- error behavior.

### Product

- actual user flow;
- understandable UI;
- realistic scenarios.

---

## 12. Testing strategy

Target test levels:

1. Unit tests.
2. Domain tests.
3. Application-service tests.
4. Repository integration tests.
5. HTTP/API tests.
6. End-to-end tests for critical flows.

Important financial regression cases include:

- transfer conservation;
- balance reproducibility;
- budget date boundaries;
- savings progress;
- debt balances;
- net worth;
- payroll reproducibility;
- same inputs + same rule version = same expected result.

---

## 13. Security principles

- Authentication must protect private resources.
- Authorization must be enforced server-side.
- UI restrictions are not security boundaries.
- Financial records must be correctly scoped to their owner or organization.
- Secrets must never be committed.
- Inputs must be validated.
- Sensitive mutations should be auditable.
- Logs must not expose secrets unnecessarily.

---

## 14. AI-assisted engineering workflow

The established working model is:

```
PALMI
  ↓
Define problem
  ↓
Nexsy
  ↓
Analysis / Architecture / Plan
  ↓
AI-assisted implementation
  ↓
Human review
  ↓
Tests
  ↓
Validation
  ↓
Commit
  ↓
Documentation update
```

AI may be used for:

- implementation;
- refactoring;
- exploration;
- tests;
- debugging;
- documentation;
- code understanding.

AI output must never be considered automatically correct.

Financial calculations and architectural decisions require explicit review.

---

## 15. Relationship with the separate Go learning project

There are two different projects:

### Go learning lab

`D:\PALMI-D3V\experiments\GOLang-learning`

Purpose:

- learn Go concepts;
- experiment;
- practice syntax;
- test small ideas.

### Financial-D3v

`palmid3v/financial-d3v-palmid3v`

Purpose:

- build a real application;
- apply Go concepts;
- learn through real architecture;
- produce portfolio-quality engineering work.

Flow:

```
GOLang-learning
      ↓
Learn concept
      ↓
Apply concept
      ↓
Financial-D3v
      ↓
Document
      ↓
Test
      ↓
Commit
```

Do not merge the learning lab into the production project.

---

## 16. Current repository state at context creation

The repository was initially almost empty.

Current work established:

- product name: **Financial-D3v**;
- broader financial-platform direction;
- payroll retained as a domain;
- step-by-step project roadmap;
- initial documentation direction.

Known repository commit already created for the step-by-step roadmap:

`313dd48372e6c1254906d2b3215177abb6d9dfa7`

The repository should be treated as the source of truth for future implementation.

---

## 17. Important project rules

### Rule 1

Do not prematurely build every domain.

Build the foundation first.

### Rule 2

Do not create architecture only for the sake of architecture.

Every package and abstraction needs a responsibility.

### Rule 3

Financial calculations must be deterministic.

### Rule 4

Do not invent Colombian legal/tax/payroll rules.

### Rule 5

Keep documentation synchronized with the implementation.

### Rule 6

Use the STEP-BY-STEP file as the operational development history.

### Rule 7

Each major phase should finish with validation.

### Rule 8

Prefer incremental, understandable changes over large opaque changes.

### Rule 9

The frontend must not become the source of truth for business rules.

### Rule 10

The repository is intended to demonstrate real engineering practices, not just produce a working demo.

---

## 18. What the next chat should do

When continuing this project from another chat:

1. Read this `CONTEXT.md`.
2. Read `README.md`.
3. Read `STEP-BY-STEP-FINANCIAL-D3V-2026-10-04.md`.
4. Read `docs/README.md`.
5. Inspect the current repository tree.
6. Identify the latest completed phase.
7. Validate the repository state before implementing new work.
8. Continue from the next incomplete phase.
9. Update code, tests and documentation together.
10. Update the STEP-BY-STEP file after significant work.

Never assume an old chat is the source of truth.

The repository is the source of truth.

---

## 19. Current objective

Build **Financial-D3v** as a real, maintainable financial platform while using the project itself as the practical vehicle for learning Go, backend engineering, architecture, databases, testing and production practices.

The goal is not merely to finish an app.

The goal is to build it with traceable engineering decisions and a professional development process.

---

**Financial-D3v · PALMI-D3V · Context v1 · October 4, 2026**

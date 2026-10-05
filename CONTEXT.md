# CONTEXT — Financial-D3v

> Context handoff for continuing the project from another chat.
>
> Canonical repository: palmid3v/financial-d3v-palmid3v
>
> Product name: Financial-D3v
>
> Product reset approved: October 4, 2026

---

## 1. Project identity

Financial-D3v is a **private personal-finance application and financial learning workspace**.

The original idea started as a Colombian payroll application. The product direction intentionally changed.

It is **not only a payroll application**.

Payroll is a specialized domain inside a broader personal financial platform.

The application has two primary purposes:

1. Help the owner understand and manage personal finances.
2. Use the application as an educational tool for financial literacy, saving habits and practical decision-making.

The project is also a real engineering vehicle for learning Go, backend architecture, databases, testing and disciplined AI-assisted development.

---

## 2. Product vision

Financial-D3v should help the user understand:

- where money is;
- where money goes;
- income and expenses;
- budgets;
- savings goals;
- debts and obligations;
- assets and liabilities;
- net worth;
- financial reports;
- financial concepts;
- personal financial progress.

The application should not become a collection of unrelated CRUD screens.

The financial ledger is authoritative. The educational layer explains the state of the ledger.

---

## 3. Private operating model

Financial-D3v is private and personal.

The owner starts the application when they want to use it.

It is not initially designed as:

- public SaaS;
- multi-customer platform;
- financial institution;
- automatic payment system;
- public financial-advice service.

The approved persistence layer is **Firebase Firestore**.

The application runtime remains local/controlled by the owner while Firestore provides persistence in the private Firebase project.

Firebase Authentication is approved as a later authentication capability.

---

## 4. Approved technology stack

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

**Important:** PostgreSQL is no longer the active database direction. The previous PostgreSQL migration is historical only.

---

## 5. Product domains

### Personal finance
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
- Financial habits

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

### Financial education
- Lessons
- Learning topics
- Contextual explanations
- Financial insights
- Glossary
- Progress reflections

### Payroll
- Employees
- Contracts
- Payroll periods
- Payroll runs
- Earnings
- Deductions
- Versioned rule sets

Payroll comes after the personal-finance core.

---

## 6. Architecture

Target:

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

Supporting concerns:

- Firebase Authentication later;
- configuration;
- logging;
- validation;
- audit;
- observability.

Rules:

- handlers coordinate;
- application services coordinate use cases;
- domain owns financial invariants;
- repositories own persistence;
- UI consumes API contracts;
- frontend is never the source of truth for financial rules.

---

## 7. Firestore direction

Proposed top-level model:

users/{userId}

Subcollections:

- accounts
- transactions
- categories
- budgets
- savingsGoals
- debts
- debtPayments
- assets
- liabilities
- payrollEmployees
- contracts
- payrollPeriods
- payrollRuns
- auditEvents

The exact structure may change after query patterns and repository interfaces are designed.

Persistence rules:

- explicit ownership;
- stable identifiers;
- deterministic monetary representation;
- explicit timestamps;
- append-oriented financial history where appropriate;
- documented denormalization;
- reproducible derived values.

---

## 8. Financial model principles

Money uses deterministic integer minor units plus an explicit ISO currency code.

Do not use binary floating point for persisted financial amounts.

Core invariants:

- balance is reproducible from opening state and authoritative transactions;
- transfers conserve total value;
- savings progress comes from recorded contributions/allocations;
- net worth equals assets minus liabilities;
- budget utilization follows explicit transaction/date rules;
- debt balances are reproducible;
- payroll results identify the exact rule-set version.

Educational information must distinguish:

1. Fact.
2. Calculation.
3. Interpretation.
4. Suggestion.

The educational layer must never silently mutate financial records.

---

## 9. Financial education objective

The application should help the owner learn by using it.

Examples:

- explain what a budget measures;
- explain why a transaction changes a budget;
- explain savings progress;
- explain debt balances;
- explain cash flow;
- explain net worth;
- surface spending/saving patterns;
- encourage deliberate saving;
- support financial goals and reflection.

The product must not fabricate financial, tax, legal or investment facts.

When external authoritative information is required, it must be sourced, dated and documented.

---

## 10. Savings objective

Savings is a first-class outcome.

The application should help the user:

- define a savings goal;
- define a target amount;
- define a target date when useful;
- record contributions;
- measure progress;
- understand required pace;
- compare plan versus actual;
- reflect on obstacles.

The system should teach the mechanics behind the numbers.

---

## 11. UI/UX direction

Dark Mode is the primary visual experience.

Desktop:

- persistent sidebar;
- dashboard-first navigation;
- KPI cards;
- charts;
- account and transaction summaries.

Mobile:

- compact top bar;
- stacked cards;
- bottom navigation;
- central quick-action control.

Education appears in context beside relevant financial metrics.

Accessibility:

- sufficient contrast;
- visible focus states;
- semantic controls;
- readable financial values;
- color is not the only positive/negative indicator.

---

## 12. Development phases

The operational source is STEP-BY-STEP-FINANCIAL-D3V-2026-10-04.md.

Current roadmap:

### Phase 0
Repository foundation.

### Phase 1
Product definition.

### Phase 2
Domain model.

### Phase 3
Initial database foundation. Originally PostgreSQL; now superseded by Firebase Firestore.

### Phase 4
Go backend + Firebase foundation.

### Phase 5
Accounts and transactions.

### Phase 6
Budgeting.

### Phase 7
Savings and financial habits.

### Phase 8
Debts and liabilities.

### Phase 9
Assets and net worth.

### Phase 10
Reports and financial dashboard.

### Phase 11
Financial education layer.

### Phase 12
Authentication, privacy and audit.

### Phase 13
Testing hardening.

### Phase 14
Frontend implementation.

### Phase 15
Payroll domain.

### Phase 16
AI-assisted product workflow.

### Phase 17
Private deployment and operations.

### Phase 18
Production readiness.

---

## 13. Current implementation baseline

Already established:

- Go 1.27 module;
- HTTP health endpoint;
- deterministic Money value object;
- core domain entities;
- domain tests;
- GitHub Actions CI;
- documentation foundation;
- Dark Mode UX direction.

The current API can run locally with Go and expose GET /health.

The database integration has not yet been implemented in the Go runtime.

The next implementation phase is the Firebase-backed Go foundation.

---

## 14. Documentation strategy

Documentation is part of development.

Any meaningful change to:

- architecture;
- product scope;
- domain ownership;
- persistence;
- financial behavior;
- security;
- privacy;
- API contracts;
- UI/UX;
- educational behavior;
- deployment;

must update the relevant documentation and STEP-BY-STEP record.

Historical decisions should remain traceable.

---

## 15. Step-by-step methodology

For every meaningful phase:

PHASE
→ Problem
→ Goal
→ Current state
→ Planned changes
→ Implementation
→ Validation
→ Acceptance criteria
→ Remaining work
→ Checkpoint / commit

Completed work remains visible.

---

## 16. AI-assisted engineering workflow

PALMI
→ Problem / financial goal
→ Nexsy
→ Analysis + architecture + plan
→ AI-assisted implementation
→ Human review
→ Tests
→ Financial validation
→ Product validation
→ Commit
→ Documentation

AI accelerates implementation, exploration, testing and documentation.

AI output is never automatically correct.

Financial calculations, educational claims, security decisions and architecture require explicit review.

---

## 17. Go learning relationship

Separate learning project:

D:\PALMI-D3V\experiments\GOLang-learning

Financial-D3v is the real application.

Learning loop:

Learn → experiment → design → implement → test → document → review.

Do not merge experimental learning code without a deliberate design decision.

---

## 18. Important project rules

1. Build the personal-finance core before payroll.
2. Keep the application private.
3. Do not invent Colombian legal/tax/payroll rules.
4. Keep financial calculations deterministic.
5. Keep the ledger authoritative.
6. Do not make the frontend the source of truth.
7. Use Firebase Firestore as the active database direction.
8. Keep Firebase credentials out of source control.
9. Validate each phase before moving on.
10. Update documentation with meaningful changes.
11. Do not create architecture only for the sake of architecture.
12. Educational explanations must be traceable to financial facts.
13. The app should educate without pretending to replace professional financial advice.
14. Do not automatically move money or execute payments.

---

## 19. Source of truth

When continuing from another chat:

1. Read CONTEXT.md.
2. Read README.md.
3. Read STEP-BY-STEP-FINANCIAL-D3V-2026-10-04.md.
4. Read docs/README.md.
5. Inspect current repository implementation and tests.
6. Identify the latest completed phase.
7. Validate repository state.
8. Continue from the next incomplete phase.
9. Update code, tests and documentation together.

The repository is the source of truth.

---

Financial-D3v · PALMI-D3V · Context v2 · October 4, 2026

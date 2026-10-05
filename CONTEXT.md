# CONTEXT — Financial-D3v

**Current baseline:** October 5, 2026  
**Product reset:** October 4, 2026

## Project identity

Financial-D3v is a **private personal-finance application and financial learning workspace**.

The primary user is the owner. The product is designed around a real personal workflow and is also a practical engineering project for learning Go, architecture, APIs, persistence, testing, security and AI-assisted development.

It is not payroll-first. Payroll exists as a later specialized domain.

## Product purpose

The application helps the owner:

- understand available money;
- record income, expenses and transfers;
- understand cash flow;
- plan spending with budgets;
- build savings habits and track goals;
- understand debts and obligations;
- understand assets, liabilities and net worth;
- learn financial concepts through real data;
- review financial changes and decide what to do next.

## Product loop

**Record → Categorize → Understand → Plan → Save → Review → Learn → Adjust**

## Education model

Financial education follows:

**FACT → CALCULATION → INTERPRETATION → ACTION**

Interpretation must not be presented as fact.

## Approved stack

| Layer | Technology |
| --- | --- |
| Frontend | React + Vite |
| UI | Tailwind CSS |
| Visual | Dark Mode, calm information-first design |
| PWA | Vite PWA |
| Backend | Go 1.27 |
| API | REST/HTTP |
| Database | Firebase Firestore |
| Auth | Firebase Auth |
| CI | GitHub Actions |
| Docs | Markdown |

## Product UX principles

1. Financial clarity is more important than screen count.
2. The ledger and backend application services are authoritative.
3. Derived metrics must be reproducible.
4. The UI explains; the domain decides.
5. Numbers should always have useful context.
6. Color is never the only signal.
7. Mobile is a first-class experience.
8. Education should appear where it helps the user's decision.
9. Privacy is part of product design.
10. Avoid alarm-heavy financial UX and unnecessary anxiety.
11. No invented legal, tax or regulatory rules.
12. No frontend calculation may silently replace an authoritative backend value.

## Current frontend experience

FASE 17 establishes the product-wide UI/UX baseline:

- responsive desktop sidebar;
- mobile bottom navigation;
- sticky contextual header;
- dashboard-first information hierarchy;
- primary transaction CTA;
- income, expenses, net cash flow and net worth cards;
- monthly cash-flow visualization;
- embedded financial education;
- quick actions for the core product loop;
- consistent module states for Transactions, Budget, Savings, Debts and Net Worth;
- loading, error and retry states;
- keyboard focus visibility;
- private-workspace messaging.

The frontend is intentionally dark-first, compact and calm rather than visually noisy.

## Backend capabilities

The current backend foundation covers:

`Account → Transaction → Balance → Budget → Planned vs Actual → Savings Goal → Contributions → Progress → Financial Education → Debt → Assets/Liabilities → Net Worth → Reports → Auth/Audit → Payroll`

Payroll remains a specialized later domain and does not redefine the product identity.

## Privacy and operating model

The application is private and initially owner-scoped.

It does not:

- operate as a public SaaS by default;
- automatically move external money;
- connect to banks initially;
- promise investment results;
- provide legal or tax advice;
- invent Colombian regulatory requirements.

Production authentication uses Firebase Auth. Local development may use the explicit owner fallback when authentication is disabled.

## Phase status

| Phase | Status |
| --- | --- |
| 1 — Product definition | APPROVED / BUILT |
| 2 — Financial Domain Model v2 | APPROVED / BUILT |
| 3 — Firestore persistence design | APPROVED / BUILT |
| 4 — Go application foundation | APPROVED / BUILT |
| 5 — Accounts and transactions | APPROVED / BUILT |
| 6 — Budgeting | APPROVED / BUILT |
| 7 — Savings and financial habits | APPROVED / BUILT |
| 8 — Financial education | APPROVED / BUILT |
| 9 — Debts | APPROVED / BUILT |
| 10 — Assets, liabilities and net worth | APPROVED / BUILT |
| 11 — Reports and financial dashboard | APPROVED / BUILT |
| 12 — Authentication, privacy and audit | APPROVED / BUILT |
| 13 — Frontend product | APPROVED / BUILT |
| 14 — Testing hardening | APPROVED / BUILT |
| 15 — Payroll | APPROVED / BUILT |
| 16 — Private deployment and operations | APPROVED / BUILT |
| 17 — Production readiness & product UX | APPROVED / BUILT |

**Roadmap remaining: 0 phases.**

## Validation checkpoint

Local validation has been performed through:

`go test ./...`  
`go build ./...`  
`cd frontend && npm ci`  
`cd frontend && npm run build`

The frontend build generated the PWA manifest and service worker.

Runtime validation in development:

- `GET /health` → 200 OK
- `GET /ready` → 200 OK
- `financialServices` → true
- `firebase` → false in local development, as expected

This does not mean cloud production has been provisioned.

## Production boundary

Before real private production use, configure:

- Firebase project;
- Firestore;
- Firebase Authentication;
- production credentials/secrets;
- production CORS origins;
- deployment infrastructure;
- backup and recovery procedures.

See:

- `docs/PHASE-16-PRIVATE-DEPLOYMENT-OPERATIONS.md`
- `docs/OPERATIONS-RUNBOOK.md`

## Development workflow

PALMI  
→ problem / financial goal  
→ Nexsy  
→ analysis / architecture / implementation  
→ GitHub  
→ human pull/test/review  
→ validation feedback  
→ fixes  
→ documentation  
→ approval

The repository is the source of truth.

---

**Financial-D3v · PALMI-D3V · Context v4 · October 5, 2026**

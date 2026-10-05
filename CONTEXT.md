# CONTEXT — Financial-D3v

**Vision reset:** October 4, 2026

## Project identity

Financial-D3v is a **private personal-finance application and financial learning workspace**.

The owner is the first and only target user. The product is intentionally designed around a real personal workflow.

It is also a practical engineering project for learning Go, architecture, APIs, persistence, testing, security and AI-assisted development.

## Product purpose

The application should help the user:

- understand available money;
- record income and expenses;
- understand cash flow;
- plan spending;
- build savings;
- understand obligations;
- eventually understand assets, liabilities and net worth;
- learn financial concepts through real data;
- build better financial habits.

The product loop is:

**Record → Categorize → Understand → Plan → Save → Review → Learn → Adjust**

Payroll is a later specialized domain.

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

## Private operating model

The owner starts the application when needed.

It is not initially a public SaaS, financial institution or automatic external-money system.

Personal data must remain private and minimal.

## Product principles

1. Personal finance comes before payroll.
2. Financial clarity is more important than screen count.
3. The ledger is authoritative.
4. Derived metrics must be reproducible.
5. Education distinguishes fact, calculation, interpretation and action.
6. Saving is a first-class product outcome.
7. The UI explains; the domain decides.
8. Privacy is part of product design.
9. No invented legal, tax or regulatory rules.
10. Each phase must be rebuilt and validated against the current vision.

## Phase status

### FASE 1 — Product definition
**APPROVED / BUILT**

Canonical artifact:
`docs/PHASE-1-PRODUCT-SPEC.md`

### FASE 2 — Financial Domain Model v2
**PENDING**

The previous domain model is not authoritative.

### FASE 3 — Firestore persistence design
**PENDING**

### FASE 4 — Go application foundation
**PENDING**

### FASE 5 — Accounts and transactions
**PENDING**

### FASE 6 — Budgeting
**PENDING**

### FASE 7 — Savings and financial habits
**PENDING**

### FASE 8 — Financial education
**PENDING**

### FASE 9 — Debts
**PENDING**

### FASE 10 — Assets, liabilities and net worth
**PENDING**

### FASE 11 — Reports and financial dashboard
**PENDING**

### FASE 12 — Authentication, privacy and audit
**PENDING**

### FASE 13 — Frontend product
**PENDING**

### FASE 14 — Testing hardening
**PENDING**

### FASE 15 — Payroll
**PENDING**

### FASE 16 — Private deployment and operations
**PENDING**

### FASE 17 — Production readiness
**PENDING**

## Important reset rule

Older implementation work does not count as completion of the new phases.

The previous domain implementation has been neutralized so FASE 2 can rebuild the domain from the new product definition.

## Development workflow

PALMI
→ problem / financial goal
→ Nexsy
→ analysis / architecture / plan
→ implementation
→ human review
→ tests
→ validation
→ documentation
→ commit

The repository is the source of truth.

## Next execution point

**FASE 2 — Financial Domain Model v2**

Before implementing persistence or broad UI, define the new domain from the Phase 1 product specification.

---

Financial-D3v · PALMI-D3V · Context v3 · October 4, 2026

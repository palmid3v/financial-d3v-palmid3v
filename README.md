# Financial-D3v

Financial-D3v is a Go-first financial platform designed to cover personal finance, financial planning, wealth tracking, reporting, and payroll in one coherent system.

## Product direction

Financial-D3v is **not only a payroll application**.

Payroll is one specialized domain inside the broader financial platform.

The platform is intended to cover:

- Accounts and transactions
- Income and expenses
- Categories and budgets
- Savings goals
- Debts and liabilities
- Assets and net worth
- Financial reports and dashboards
- Payroll
- Employees and contracts
- Earnings and deductions
- Security and auditability

## Current foundation

Phases 1–3 are approved and the initial implementation foundation is now in place:

- Go 1.27 module.
- HTTP health endpoint.
- Deterministic Money value object using integer minor units.
- Core domain entities.
- PostgreSQL migration covering the approved domain foundation.
- Domain tests.
- GitHub Actions CI.
- Technical documentation.
- Responsive UI/UX contract with Dark Mode as the primary theme.

## UI direction

The approved product mockup targets both desktop and mobile.

Dark Mode is the primary experience, with:

- dashboard-first navigation;
- responsive desktop sidebar;
- mobile bottom navigation;
- quick transaction action;
- financial KPI cards;
- account, budget, savings and transaction summaries;
- accessible positive/negative states.

See docs/14-UI-UX-DESIGN.md.

## Project documentation

- CONTEXT.md
- STEP-BY-STEP-FINANCIAL-D3V-2026-10-04.md
- docs/README.md
- docs/03-ARCHITECTURE.md
- docs/04-DOMAIN-MODEL.md
- docs/05-DATABASE-DESIGN.md
- docs/07-FINANCIAL-RULES.md

## Development philosophy

Build the platform in small, validated phases.

Financial calculations must be deterministic, business rules must be explicit, important architectural decisions must be documented, and generated code must always be reviewed and tested.

## Source of truth

The repository is the source of truth for the project.

When continuing development from another chat, start with:

1. CONTEXT.md
2. STEP-BY-STEP-FINANCIAL-D3V-2026-10-04.md
3. Current repository tree
4. Current implementation and tests

---

**Financial-D3v · PALMI-D3V**

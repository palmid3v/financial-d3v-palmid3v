# FASE 11 — Reports and Financial Dashboard

**APPROVED / BUILT**

## Purpose

Turn authoritative financial domain data into explainable read-only reports.

## Delivered

- Period-based financial summary.
- Income and expenses.
- Net cash flow.
- Spending by category.
- Budget summaries reused from the budgeting service.
- Savings goal progress reused from the savings service.
- Debt balance summary.
- Net worth snapshot reused from the financial-position service.
- Dashboard response combining the same report.
- Transfers excluded from income/expense totals.

## API

- `GET /api/v1/reports/summary?start=...&end=...&currency=COP`
- `GET /api/v1/dashboard?start=...&end=...&currency=COP`

Both endpoints are owner-scoped.

## Architecture rule

Reports consume authoritative application services and do not maintain a second copy of financial calculations.

## Boundary

This phase does not build the React dashboard UI. That remains FASE 13.

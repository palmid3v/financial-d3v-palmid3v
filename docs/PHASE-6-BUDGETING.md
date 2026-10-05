# FASE 6 — Budgeting

Status: **APPROVED / BUILT**

FASE 6 turns the transaction ledger into a planning layer. A budget defines a financial period, assigns limits to expense categories, and compares planned limits with actual expense transactions.

## Objective

Help the owner answer:

- How much did I plan to spend?
- How much have I actually spent?
- How much remains?
- Which categories are over budget?
- What does planned versus actual tell me?

## Domain

A budget contains:

- owner
- name
- financial period
- currency
- expense-category limits

Budget limits use integer minor units and the same currency as the budget.

## Planned versus actual

Actual spending is derived from authoritative transactions:

`Budget limit → Expense transactions → Spent → Remaining → Utilization`

For each budget item:

- `spent = sum(expense transactions for the category during the period)`
- `remaining = limit - spent`
- `utilization = spent / limit * 100`
- `overspent = spent > limit`

Transfers and income do not count as budgeted expenses.

The ledger remains authoritative. Budget values are not used to mutate account balances.

## Category boundary

Budget items may reference only `expense` categories. Income categories remain outside the spending-limit calculation.

Category management endpoints were added because budgets require stable owner-scoped category identifiers.

## API

- `POST /api/v1/categories`
- `GET /api/v1/categories`
- `POST /api/v1/budgets`
- `GET /api/v1/budgets?start=...&end=...`
- `GET /api/v1/budgets/{budgetID}`
- `GET /api/v1/budgets/{budgetID}/summary`

The temporary `X-Owner-ID` header remains in use until FASE 12 authentication.

## Firestore

Budgets remain owner-scoped:

`users/{ownerId}/budgets/{budgetId}`

The existing budget period index remains active.

## Financial learning

The API exposes raw calculations that the future education layer can explain as:

**FACT:** budget limit and actual spending.

**CALCULATION:** remaining and utilization.

**INTERPRETATION:** whether a category is within or above its planned limit.

**ACTION:** a later UI/education layer can help the owner decide what to adjust.

FASE 6 does not provide investment, tax, legal or guaranteed financial advice.

## Debt boundary

Debt is still FASE 9. A future budget may plan a debt payment as a cash-flow obligation, but debt balance and liability accounting remain outside FASE 6.

In particular, debt principal must not automatically be treated as an ordinary expense. Interest and fees can later be modeled as expenses when the debt domain is implemented.

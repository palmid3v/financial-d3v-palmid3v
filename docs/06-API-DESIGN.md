# API Design

The HTTP API is the application boundary between the frontend and the financial domain.

## Initial HTTP surface

GET /health

Returns a machine-readable service status.

## Future resource groups

- /accounts
- /transactions
- /categories
- /budgets
- /savings-goals
- /debts
- /assets
- /liabilities
- /net-worth
- /reports
- /education
- /payroll
- /audit

## API principles

- JSON over HTTP.
- Explicit request and response contracts.
- Stable error structure.
- Server-side validation.
- Server-side authorization.
- No direct UI access to persistence as the authoritative write path.
- Financial mutations should be idempotent where operation semantics allow it.
- Educational endpoints return explanations/insights based on explicit domain facts.

## First useful vertical slice

Account → Transaction → Balance → Dashboard summary → Educational explanation

This gives the user both a working financial feature and a learning opportunity.

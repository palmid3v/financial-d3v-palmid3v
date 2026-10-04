# API Design

The initial HTTP surface is intentionally small.

## Health

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
- /payroll
- /reports
- /audit

Handlers must delegate business behavior to application/domain code.

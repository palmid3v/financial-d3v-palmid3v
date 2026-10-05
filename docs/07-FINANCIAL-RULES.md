# Financial Rules — Financial-D3v v2

**Status: FASE 2 APPROVED / BUILT**

## Money

- Money is integer minor units plus currency.
- Arithmetic requires equal currencies.
- Arithmetic rejects integer overflow.
- Financial amounts stored in the domain are never represented as floating point.

## Transactions

- Amounts are positive values.
- Income increases an account.
- Expense decreases an account.
- Transfer outgoing decreases its source account.
- Transfer incoming increases its destination account.
- Transfer pairs must share owner, transfer identifier, amount and currency, and use different accounts.

## Balance

For one account:

opening balance + income - expenses - outgoing transfers + incoming transfers

The balance is derived, not an independent source of truth.

## Budgets

- One currency per budget.
- One valid financial period per budget.
- One budget item per category.
- Limits must be positive and use the budget currency.

## Savings

- Target must be positive.
- Contributions cannot be negative.
- Contribution currency must match the target currency.
- Progress is capped at 100%.
- Remaining amount is never negative.

## Periods

Financial periods use [start, end).

This makes monthly reporting deterministic and avoids double-counting boundary dates.

## Education

Education follows:
FACT -> CALCULATION -> INTERPRETATION -> ACTION

The application must clearly distinguish observed records from calculated values and optional interpretations.

## Compliance boundary

No legal, tax, regulatory or investment rule is inferred from this domain model.

**FASE 2 FINANCIAL RULES EXIT: APPROVED**

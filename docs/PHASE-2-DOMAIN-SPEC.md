# FASE 2 — Financial Domain Model v2

**Status: APPROVED / BUILT**

FASE 2 rebuilds the financial domain from the approved personal-finance product specification. No previous domain struct is authoritative.

## Vocabulary

- Money: integer minor units plus currency.
- Account: an owned financial container with an opening balance.
- Transaction: an authoritative money movement affecting one account.
- Income: transaction that increases an account balance.
- Expense: transaction that decreases an account balance.
- Transfer: transaction that decreases one account and is paired with an equal incoming transaction in another account.
- Category: owner-scoped classification for income or expense.
- Financial Period: half-open date range [start, end).
- Budget: owner-scoped plan for a financial period and currency.
- Budget Item: category limit inside a budget.
- Savings Goal: target amount, optional target date and contribution progress.
- Education Context: structured context for connecting a financial metric with fact, calculation, interpretation and possible action.

## Money

Money uses int64 minor units.

Examples:
- COP 12,500 -> 12500 minor units.
- USD 19.99 -> 1999 minor units.

Arithmetic requires equal currencies and rejects integer overflow.

## Account balance

The authoritative balance is reproducible:

opening balance + income - expenses - outgoing transfers + incoming transfers

An outgoing transfer is represented by a negative ledger effect on its source account. Its paired incoming entry is represented separately on the destination account.

## Transaction invariants

- ID, owner and account are required.
- Amount must be strictly positive.
- Currency must be present.
- Occurrence time is required.
- Transaction type must be known.
- Transfers require a shared transfer identifier and an equal amount/currency on both sides.
- Transfer endpoints must belong to the same owner and be different accounts.

## Budget invariants

- A budget has one owner, name, currency and valid period.
- A category may appear at most once in a budget.
- Budget limits are positive and use the budget currency.

## Savings invariants

- Goal target is positive.
- Contributions cannot be negative.
- Contribution currency must equal target currency.
- Progress is capped at 100%.
- Remaining amount cannot become negative.

## Financial periods

Periods are represented as [start, end) to avoid overlap at boundaries and to support monthly calculations consistently.

## Educational boundary

The domain stores educational context as structured data:

FACT -> CALCULATION -> INTERPRETATION -> ACTION

The interpretation/action layer does not override financial facts or create legal, tax or investment claims.

## Tests

The domain test suite covers:
- currency mismatch;
- positive transaction amounts;
- period boundaries;
- duplicate budget categories;
- savings progress;
- reproducible account balance;
- transfer conservation.

**FASE 2 EXIT: APPROVED**

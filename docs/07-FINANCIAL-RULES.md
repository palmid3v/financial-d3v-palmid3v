# Financial Rules

## Money

Do not persist binary floating-point monetary amounts.

Use integer minor units plus an explicit currency code for deterministic financial calculations.

## Balance

Balance = Opening State + Authoritative Transaction Effects

Exact transaction sign semantics must be defined before the transaction module is implemented.

## Transfers

A transfer between owned accounts must conserve total value across the involved accounts.

## Net worth

Net Worth = Assets - Liabilities

## Budgets

Budget usage is derived from explicitly defined transaction inclusion rules and date boundaries.

## Savings

Savings progress must come from recorded contributions and/or explicitly defined account allocations, not UI-only values.

The application should make the difference between saving money, moving money, spending less and reaching a savings target easy to understand.

## Debts

Debt balances must be reproducible from authoritative debt records, payments and explicitly defined adjustments.

## Educational rules

The educational layer distinguishes:
1. Fact — what stored data says.
2. Calculation — what the system mathematically derives.
3. Interpretation — what a metric may indicate.
4. Suggestion — a possible next action for the user to consider.

An interpretation is never presented as a guaranteed outcome.

## Financial guidance boundary

The app is educational and personal-use software. It must not fabricate legal, tax, investment or regulatory facts.

Colombian payroll, tax and labor rules must be researched against authoritative sources and versioned before production-authoritative use.

## Payroll

Payroll calculations must reference the exact rule-set version used to produce the result.

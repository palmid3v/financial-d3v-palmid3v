# Financial Rules

## Money

Do not persist binary floating-point monetary amounts.

## Balance

Balance = opening balance + authoritative transaction effects.

Exact transaction sign semantics will be documented before the transaction module is implemented.

## Transfers

A transfer between owned accounts must conserve total value.

## Net worth

Net Worth = Assets - Liabilities.

## Budgets

Budget usage is derived from explicitly defined transaction inclusion rules and date boundaries.

## Payroll

Payroll calculations must use a versioned rule set. Colombian legal, tax and labor rules must be researched against authoritative sources before production use.

# Domain Model

## Core entities

User, Organization, Account, AccountType, Transaction, TransactionCategory, Budget, BudgetItem, SavingsGoal, Debt, DebtPayment, Asset, Liability, Employee, Contract, PayrollPeriod, PayrollRun, Earning, Deduction and AuditEvent.

## Money

Persist monetary values as integer minor units plus an explicit ISO currency code.

The application must not silently add values with different currencies.

## Financial invariants

- Account balance is reproducible from opening state plus authoritative transactions.
- Transfers preserve total value across the involved owned accounts.
- Savings progress comes from recorded contributions.
- Net worth is assets minus liabilities.
- Payroll results identify the exact rule-set version used.

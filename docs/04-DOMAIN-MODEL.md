# Domain Model

## Core entities

### Personal finance
User, Account, AccountType, Transaction, TransactionCategory, Budget, BudgetItem, SavingsGoal, Debt, DebtPayment, Asset and Liability.

### Payroll
Employee, Contract, PayrollPeriod, PayrollRun, Earning and Deduction.

### Platform
AuditEvent.

### Education
The educational layer interprets financial facts without replacing the financial ledger.

Potential concepts:
- FinancialLesson
- LearningTopic
- FinancialInsight
- GoalProgressSnapshot
- EducationPrompt

These should be introduced only when the behavior is sufficiently defined.

## Money

The domain uses deterministic monetary values with integer minor units and an explicit ISO currency code.

The application must not silently add values with different currencies.

## Financial invariants

- Account balance is reproducible from opening state plus authoritative transactions.
- Transfers preserve total value across involved accounts.
- Savings progress comes from recorded contributions.
- Net worth is assets minus liabilities.
- Budget utilization is reproducible from explicit inclusion rules and dates.
- Debt balances are reproducible from principal and authoritative payments/adjustments.
- Payroll results identify the exact rule-set version used.

## Educational invariants

- An educational explanation must not contradict an authoritative financial calculation.
- A financial insight must identify the underlying metric or records that produced it.
- Education distinguishes facts, calculations, interpretations and suggestions.
- Educational content must not silently modify financial records.

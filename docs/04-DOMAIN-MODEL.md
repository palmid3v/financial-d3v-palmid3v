# Domain Model — Financial-D3v v2

**Status: FASE 2 APPROVED / BUILT**

The domain was rebuilt from the approved personal-finance product specification.

## Core model

- Money
- Account
- Transaction
- Category
- Budget
- BudgetItem
- SavingsGoal
- SavingsProgress
- FinancialPeriod
- EducationContext

Later phases may add debts, assets, liabilities, net worth and payroll.

## Domain boundary

The domain owns:
- financial vocabulary;
- financial invariants;
- money arithmetic;
- transaction effects;
- balance calculation;
- budget constraints;
- savings progress;
- financial-period semantics.

The domain does not import Firestore, HTTP, React, Firebase Auth or UI concerns.

## Ledger rule

Transactions are the authoritative money-movement records.

Account balance is reproducible from:
opening balance + income - expenses - outgoing transfers + incoming transfers.

Transfers use paired transaction entries sharing a transfer identifier.

## Education rule

Education context follows:
FACT -> CALCULATION -> INTERPRETATION -> ACTION

The educational layer must not turn interpretations into financial facts or invent legal/tax/regulatory rules.

## Tests

The domain tests cover the core invariants and reproducibility rules.

**FASE 2 EXIT: APPROVED**

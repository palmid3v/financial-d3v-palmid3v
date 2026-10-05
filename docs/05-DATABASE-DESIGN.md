# Database Design — Firebase Firestore

**Status: FASE 3 APPROVED / BUILT**

Firebase Firestore is the approved persistence layer for Financial-D3v.

PostgreSQL is historical only and is not part of the active persistence design.

## Architecture

React/PWA → Go REST/HTTP API → Application Services → Financial Domain → Repository Contracts → Firestore Adapter → Firebase Firestore

FASE 3 defines the persistence boundary. Firebase SDK initialization and concrete repository implementations belong to FASE 4.

## Ownership

Active financial records use owner-scoped subcollections:

users/{ownerId}/accounts/{accountId}
users/{ownerId}/transactions/{transactionId}
users/{ownerId}/categories/{categoryId}
users/{ownerId}/budgets/{budgetId}
users/{ownerId}/savingsGoals/{goalId}

Later domains may add debts, assets, liabilities and payroll.

## Authoritative data

Transactions are the authoritative ledger.

Balances and dashboard values must be reproducible from authoritative records or explicitly documented snapshots.

## Monetary serialization

Money is stored as:
- minorUnits: int64-compatible integer;
- currency: ISO-style currency code string.

Floating-point money is not used for persistence.

## Repository contracts

Defined under internal/persistence:
- AccountRepository
- TransactionRepository
- CategoryRepository
- BudgetRepository
- SavingsGoalRepository

Contracts require owner scope for reads and writes.

## Query/index strategy

Initial composite indexes are defined in firebase/firestore.indexes.json.

The main query patterns are account history, transaction period history, transaction category history and budgets by period.

## Security

Ownership paths are designed now, but authentication, authorization middleware, Firestore rules, audit and secret management remain later phases.

**FASE 3 EXIT: APPROVED**

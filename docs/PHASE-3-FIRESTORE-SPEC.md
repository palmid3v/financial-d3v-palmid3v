# FASE 3 — Firestore Persistence Design

**Status: APPROVED / BUILT**

FASE 3 defines how the FASE 2 domain is persisted without coupling the domain to Firebase SDK details.

## Ownership model

All active financial documents are nested under the owner:

users/{ownerId}/...

The owner ID is part of every financial document and is also enforced by repository contracts.

## Collections

### Accounts

users/{ownerId}/accounts/{accountId}

Stores account identity, type, currency, opening balance and timestamps.

### Transactions

users/{ownerId}/transactions/{transactionId}

Stores the authoritative ledger entry.

Important fields:
- ownerId
- accountId
- type
- amount.minorUnits
- amount.currency
- categoryId
- transferId
- occurredAt
- createdAt

### Categories

users/{ownerId}/categories/{categoryId}

Stores owner-scoped income/expense classification.

### Budgets

users/{ownerId}/budgets/{budgetId}

Stores the period, currency and category limits.

### Savings goals

users/{ownerId}/savingsGoals/{goalId}

Stores target amount, currency, optional target date and timestamps.

## Query patterns

The first repository contract supports:
- get/list accounts by owner;
- get/list transactions by owner;
- list transactions for one account;
- list transactions inside a financial period;
- get/list categories by owner;
- get/list budgets by owner and period;
- get/list savings goals by owner.

## Index strategy

Initial composite indexes:
1. transactions: accountId ASC + occurredAt DESC;
2. transactions: occurredAt ASC + createdAt DESC;
3. transactions: categoryId ASC + occurredAt DESC;
4. budgets: startDate ASC + endDate ASC.

Single-field indexes remain Firestore defaults unless query behavior later proves otherwise.

## Serialization

The Firestore package defines persistence DTOs separate from domain entities.

Money is serialized as:
- minorUnits: integer;
- currency: string.

The domain never imports the Firestore SDK.

## Repository boundary

Repository interfaces live under internal/persistence.

FASE 4 will provide concrete Firestore implementations and Firebase initialization.

## Ledger authority

Transactions remain the authoritative financial record. Balances, budget utilization and dashboard values must be reproducible from persisted source records or explicitly documented snapshots.

## Security boundary

FASE 3 defines ownership paths but does not claim authentication/security completion. Firebase Auth, Firestore rules, authorization middleware, audit behavior and secret management remain later work.

**FASE 3 EXIT: APPROVED**

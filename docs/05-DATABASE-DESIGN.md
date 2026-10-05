# Database Design — Firebase Firestore

Firebase Firestore is the approved persistence layer for Financial-D3v.

PostgreSQL is no longer the active database target. The previous PostgreSQL migration is retained only as historical reference.

## Why Firestore

For the current private/personal application, Firestore provides:
- managed document persistence;
- straightforward personal-data storage;
- Firebase ecosystem integration;
- flexible document structures;
- security rules;
- low operational burden for a private project;
- a natural path to Firebase Authentication.

The Go API remains the authoritative application layer.

## Persistence principle

Preferred flow:

React/PWA → Go API → Repository → Firestore

Financial mutations should remain governed by the backend/domain layer.

## Proposed collection model

users/{userId}
  profile

users/{userId}/accounts/{accountId}
users/{userId}/transactions/{transactionId}
users/{userId}/categories/{categoryId}
users/{userId}/budgets/{budgetId}
users/{userId}/savingsGoals/{goalId}
users/{userId}/debts/{debtId}
users/{userId}/debtPayments/{paymentId}
users/{userId}/assets/{assetId}
users/{userId}/liabilities/{liabilityId}

users/{userId}/payrollEmployees/{employeeId}
users/{userId}/contracts/{contractId}
users/{userId}/payrollPeriods/{periodId}
users/{userId}/payrollRuns/{runId}

users/{userId}/auditEvents/{eventId}

The exact structure can change after query patterns and repository interfaces are designed.

## Document rules

- Every financial document has a stable identifier.
- Ownership is explicit.
- Monetary values use deterministic integer minor units plus currency.
- Timestamps are explicit and consistent.
- Historical financial records are append-oriented whenever possible.
- Derived values are reproducible from authoritative records.
- Denormalization is acceptable when documented and kept consistent.

## Security

Firestore access must be private and restricted.

Security rules are an additional boundary, not a replacement for server-side authorization.

## Historical PostgreSQL migration

The previous PostgreSQL migration represented an earlier architecture. It must not be used as the active persistence implementation. The historical artifact is preserved to maintain architectural traceability.

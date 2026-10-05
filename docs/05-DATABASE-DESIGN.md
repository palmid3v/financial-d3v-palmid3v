# Database Design — Financial-D3v

**Status:** HISTORICAL FIRESTORE DESIGN / ACTIVE VAULT BOUNDARY  
**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)

## Current decision

Financial-D3v no longer uses Firestore as the active financial-data source of truth.

The active source of truth is the encrypted user-controlled Financial Vault file:

```text
FDV1 encrypted .fdv
       ↓
browser unlock
       ↓
decrypted in-memory state
```

No plaintext financial database is required for the active $0 architecture.

## Historical Firestore model

The original Firestore design is preserved in this document because it records the earlier persistence boundary.

Historical owner-scoped collections included:

- users/{ownerId}/accounts
- users/{ownerId}/transactions
- users/{ownerId}/categories
- users/{ownerId}/budgets
- users/{ownerId}/savingsGoals

Those structures are not required for Vault mode.

## Authoritative financial data

Transactions remain the authoritative ledger concept.

Balances, budget actuals, savings progress, debt balances and net worth must be reproducible from authoritative domain records according to `docs/07-FINANCIAL-RULES.md`.

## Monetary representation

Money is represented as:
- integer minor units;
- currency code.

Floating-point values must not become the persisted financial source of truth.

## Legacy status

Firestore repository contracts and adapters remain available for historical/API continuity. They must not be treated as the active financial persistence layer unless a future phase explicitly changes the architecture.

## Security rule

Do not introduce a Firestore write path for plaintext Financial Vault data as part of normal Vault-mode development.

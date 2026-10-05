# FASE 9 — Debts

**Status: APPROVED / BUILT**

FASE 9 introduces debt as a specialized financial liability.

## Domain

A debt records:

- original principal;
- current outstanding balance;
- annual rate in basis points;
- minimum payment;
- active/paid status.

Debt payments separate:

- principal;
- interest;
- fees.

The payment amount must equal principal + interest + fees.

### Important accounting boundary

Only the **principal** portion reduces the debt balance.

Interest and fees are recorded as payment components but do not reduce principal.

Debt accounting is therefore not treated as an ordinary expense total automatically.

## API

- `POST /api/v1/debts`
- `GET /api/v1/debts`
- `GET /api/v1/debts/{debtID}`
- `GET /api/v1/debts/{debtID}/summary`
- `POST /api/v1/debts/{debtID}/payments`

## Persistence

Owner-scoped Firestore collections:

- `users/{ownerId}/debts/{debtId}`
- `users/{ownerId}/debtPayments/{paymentId}`

Debt payment history uses a composite index by debt and paid date.

## Product boundary

FASE 9 does not provide legal, tax or lending advice and does not execute payments externally.

Debt education remains available through FASE 8; FASE 9 supplies the underlying debt data.

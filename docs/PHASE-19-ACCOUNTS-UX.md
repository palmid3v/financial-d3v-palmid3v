# FASE 19 — Accounts UX

**Scope approved:** FASE 18–20  
**Implementation status:** BUILT / VALIDATION PENDING

## Objective

Make accounts the understandable foundation for balances and transactions.

## Implemented

- Accounts workspace
- Account creation
- Account name
- Account type
- Currency
- Opening balance
- Account cards
- Derived balance loading from the account balance endpoint
- Empty, loading and error states
- Mobile-first responsive layout
- Owner-scoped API integration

## Product rule

The transaction ledger remains authoritative. A displayed account balance is derived from the backend rather than maintained as a frontend-owned financial state.

## Validation

- [ ] `npm run build`
- [ ] Runtime account creation
- [ ] Runtime balance calculation/display
- [ ] Mobile UX review

**Phase completion:** pending user validation.

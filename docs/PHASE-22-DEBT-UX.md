# FASE 22 — Debt UX

**Scope approved:** FASE 20–22  
**Implementation status:** IMPLEMENTED / VALIDATION PENDING

## Objective

Make debt obligations transparent and explain exactly how payments affect the debt.

## Implemented

- Debt overview
- Debt creation
- Original principal
- Current balance
- Minimum payment
- Annual rate input
- Debt detail
- Active/paid status
- Payment entry
- Explicit principal / interest / fees fields
- Payment-total validation
- Payment history
- FACT → CALCULATION context
- Loading, empty and error states
- Owner-scoped API integration
- Mobile-first responsive workflow

## Financial boundary

The backend remains authoritative for debt balance changes. Principal reduces the debt balance; interest and fees remain payment components and are not silently treated as principal.

## Validation

- [ ] `npm run build`
- [ ] Runtime debt creation
- [ ] Runtime payment creation
- [ ] Runtime balance update
- [ ] Payment history review
- [ ] Mobile UX review

**Phase completion:** pending user validation.

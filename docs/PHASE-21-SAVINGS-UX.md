# FASE 21 — Savings UX

**Scope approved:** FASE 20–22  
**Implementation status:** IMPLEMENTED / VALIDATION PENDING

## Objective

Make savings goals visible, measurable and easy to continue without treating contributions as ordinary expenses.

## Implemented

- Savings goals workspace
- Goal creation
- Target amount
- Optional target date
- Goal list
- Goal detail
- Contribution entry
- Contribution history
- Saved amount
- Remaining amount
- Progress percentage
- FACT → CALCULATION → INTERPRETATION context
- Loading, empty and error states
- Owner-scoped API integration
- Mobile-first responsive workflow

## Financial boundary

Savings contributions are goal-progress records. They are not silently converted into ordinary expense transactions by the frontend.

## Validation

- [ ] `npm run build`
- [ ] Runtime goal creation
- [ ] Runtime contribution
- [ ] Runtime progress/summary
- [ ] Mobile UX review

**Phase completion:** pending user validation.

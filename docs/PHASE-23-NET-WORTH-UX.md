# FASE 23 — Net Worth UX

**Implementation status:** IMPLEMENTED / VALIDATION PENDING

## Implemented
- Net-worth overview
- Assets
- Liabilities
- Debt liabilities
- Backend-derived net worth
- Currency context
- FACT → CALCULATION → INTERPRETATION → ACTION
- Loading/error/retry states
- Responsive/mobile layout

## Boundary
The frontend does not calculate a replacement net-worth value. The backend remains authoritative; the UI explains the returned financial position.

## Validation
- [ ] npm run build
- [ ] Net-worth runtime request
- [ ] Values match backend position
- [ ] Mobile UX review

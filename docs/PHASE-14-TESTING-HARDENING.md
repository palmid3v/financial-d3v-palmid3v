# FASE 14 — Testing Hardening

**APPROVED / BUILT**

Testing hardening adds explicit domain coverage around payroll and strengthens the rule that financial calculations must remain deterministic and validated.

## Coverage

- Payroll net-pay calculation.
- Payroll invalid deduction guard.
- Existing domain, application and HTTP authentication tests retained.
- Financial-domain invariants continue to be covered by package tests.
- Local validation remains part of the delivery loop.

## Validation

The repository's latest user-run validation before this phase was:

```
go test ./...  → PASS
go build ./... → PASS
```

After the FASE 13–15 implementation, the user should run the same commands plus the frontend build:

```
go test ./...
go build ./...
cd frontend
npm install
npm run build
```

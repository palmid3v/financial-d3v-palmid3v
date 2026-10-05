# API Design — Financial-D3v

**Status:** LEGACY / HISTORICAL BOUNDARY  
**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)

## Current decision

The active Financial Vault architecture does not require a remote financial API.

Financial calculations and financial persistence happen locally:

```text
Vault memory → Go/WASM → React
```

The original Go REST/HTTP API remains in the repository for historical traceability and possible future non-Vault use.

## Legacy API resources

Historical resources include:
- accounts;
- transactions;
- categories;
- budgets;
- savings goals;
- debts;
- net worth;
- education;
- reports;
- dashboard;
- audit.

## Boundary rule

Do not send plaintext Financial Vault data to the legacy API.

If a future phase reintroduces a remote API, it requires an explicit architecture decision and a new security/privacy review.

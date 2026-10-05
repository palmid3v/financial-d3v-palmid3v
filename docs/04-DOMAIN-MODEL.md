# Domain Model — New Baseline

**Status: FASE 2 PENDING**

The previous domain model is no longer authoritative.

FASE 2 will rebuild the domain from the approved FASE 1 product specification.

## Expected MVP areas

- money;
- account;
- transaction;
- category;
- budget;
- savings goal;
- financial period;
- education context.

Later phases may introduce debt, assets, liabilities, net worth and payroll.

## Rule

Do not copy the previous structs into the new model.

The new domain must be derived from:
1. product jobs;
2. user flows;
3. financial invariants;
4. Firestore access requirements;
5. educational requirements.

The domain must not depend on UI concepts or persistence details.

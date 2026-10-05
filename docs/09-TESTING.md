# Testing — Financial-D3v

**Current status: FASE 2/3 DOMAIN AND PERSISTENCE DESIGN VALIDATED**

## FASE 2

Domain tests cover:
1. currency mismatch;
2. positive transaction amounts;
3. financial-period boundaries;
4. duplicate budget categories;
5. savings progress cap;
6. reproducible account balance;
7. transfer conservation.

## FASE 3

Persistence mapping tests cover:
1. owner and money preservation for account documents;
2. period and budget-item preservation.

## Later levels

1. Domain tests.
2. Application-service tests.
3. Firestore repository tests.
4. HTTP/API tests.
5. End-to-end critical flows.

Concrete Firestore integration tests require the adapter and Firebase configuration from FASE 4.

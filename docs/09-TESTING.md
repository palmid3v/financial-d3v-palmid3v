# Testing Strategy

## Levels

1. Unit/domain.
2. Application service.
3. Firestore repository integration.
4. HTTP/API.
5. End-to-end for critical flows.

## Financial regression cases

- transfer conservation;
- balance reproducibility;
- budget date boundaries;
- savings progress;
- debt balance;
- net worth;
- transaction categorization;
- educational explanation consistency;
- payroll reproducibility.

## Firestore tests

Repository tests must verify:
- document mapping;
- ownership paths;
- create/read/update behavior;
- query filters;
- missing-document behavior;
- concurrency/transaction behavior where required;
- security assumptions.

## Educational tests

Given the same financial state, deterministic educational metrics should produce the same result.

Educational text can vary in wording, but underlying facts and calculations must remain correct and traceable.

## Definition of done

A financial feature is complete when:
- domain behavior is tested;
- persistence behavior is tested;
- API behavior is tested;
- errors are defined;
- ownership is verified;
- the UI flow is understandable;
- documentation is updated.

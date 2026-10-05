# FASE 5 — Accounts and Transactions

**Status: APPROVED / BUILT**

FASE 5 establishes the first usable financial workflow:

**Account → Transaction → Balance**

## Account

An account requires owner, name, account type, currency and opening balance. Money is represented as integer minor units plus currency.

## Transactions

Transactions require owner, account, type, positive amount, currency and occurrence timestamp. The application service verifies that transaction currency matches the account currency.

Transfers remain explicit ledger records with a transfer identifier. Paired transfer conservation remains a domain rule.

## Balance

The balance is reproducible from the authoritative ledger:

`opening balance + income - expenses - outgoing transfers + incoming transfers`

No mutable balance field is introduced as the source of truth.

## Exit criteria

- accounts can be created, read and listed;
- transactions can be created, read and listed;
- account balance is calculated from ledger data;
- owner scoping is preserved;
- currency mismatches are rejected;
- health/readiness are observable;
- application tests cover the main financial path.

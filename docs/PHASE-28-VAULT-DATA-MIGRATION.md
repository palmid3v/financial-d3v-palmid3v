# FASE 28 — Vault Data Migration

**Status:** APPROVED / BUILT / VALIDATED  
**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)

## Objective

Move the financial product experience onto the encrypted Financial Vault as the local authoritative source of truth.

## Implemented domains

The Vault-backed workspace represents:
- Accounts;
- Categories;
- Transactions;
- Budgets;
- Savings goals and contributions;
- Debts and payments;
- Assets;
- Liabilities;
- Net Worth;
- Education;
- Dashboard/report calculations.

## Financial rules preserved

- Money = integer minor units + currency.
- Transfers are not ordinary expenses.
- Account balances derive from the authoritative ledger.
- Budget actuals derive from expense transactions.
- Savings contributions represent goal progress.
- Debt balance decreases only by principal.
- Interest and fees remain separate payment components.
- Net worth includes liabilities.

## Persistence boundary

While unlocked:
- decrypted state exists in active memory;
- edits remain in memory until save;
- save re-seals the vault and exports an encrypted `.fdv` file;
- lock clears active state and password reference.

No intentional financial plaintext persistence is used by the migrated workspace.

## Validation

FASE 28 behavior is covered by the automated domain tests, build/WASM validation and runtime Vault flow completed through FASE 31.

**Exit:** APPROVED / BUILT / VALIDATED.

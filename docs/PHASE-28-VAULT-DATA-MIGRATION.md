# FASE 28 — Vault Data Migration

**Status:** BUILT / VALIDATION PENDING  
**Date:** 2026-10-05

## Objective

Move the financial product experience from the legacy API-backed screens to the encrypted Financial Vault as the local authoritative source of truth.

## Implemented

### Vault-backed domain

The frontend now operates directly on the decrypted in-memory vault for:

- Accounts
- Categories
- Transactions
- Budgets
- Savings goals
- Savings contributions
- Debts
- Debt payments
- Assets
- Liabilities
- Education

The vault is normalized when opened so the existing FDV1 schema remains compatible while default financial categories and education content are available to the new product experience.

### Financial rules represented

- Money is stored as integer minor units plus currency.
- Transfers are not ordinary expenses.
- Account balances are derived from opening balances and ledger transactions.
- Budget actuals are derived from authoritative expense transactions.
- Savings contributions are goal-progress records, not ordinary budget expenses.
- Debt balances are derived from principal payments only.
- Debt interest and fees remain separate payment components.
- Net worth is assets minus all liabilities, with debt balances included as liabilities.

### Persistence boundary

While the vault is unlocked:

- decrypted financial state exists only in active application memory;
- changes are tracked as unsaved in-memory state;
- saving re-seals the current vault with the vault password and downloads a new encrypted .fdv;
- locking clears the active vault and password reference;
- the legacy API-backed application is no longer mounted when the Financial Vault feature is enabled.

No financial plaintext is intentionally sent to the legacy API, Firebase, Vercel, or browser storage by the migrated workspace.

## Product UI

The first Vault-backed workspace now includes the new Financial-D3v visual direction:

- desktop sidebar navigation;
- mobile bottom navigation;
- dashboard metric cards;
- income vs expense chart;
- category spending visualization;
- account summaries;
- budget progress;
- recent transactions;
- transaction entry;
- accounts;
- budgets;
- savings and goals;
- debts;
- net worth;
- education.

The visual system uses the approved dark, minimal language from the Financial-D3v mockups: restrained surfaces, subtle borders, strong numeric hierarchy, semantic financial colors, and lightweight motion.

### Motion foundation

Implemented for the migrated UI:

- metric/card entrance;
- chart bar reveal;
- progress growth;
- donut reveal;
- button and surface transitions;
- dirty-state pulse;
- prefers-reduced-motion support.

The full design-system and motion refinement remains part of FASE 30.

## Legacy architecture

The previous Go API / Firebase financial screens remain in the repository for historical traceability, but they are not mounted in Vault mode.

The old API is not the source of truth for the migrated workspace.

## Validation checklist

- [ ] npm run build
- [ ] Vault-backed dashboard renders from empty FDV1 vault
- [ ] Create account
- [ ] Record income
- [ ] Record expense
- [ ] Record transfer
- [ ] Verify derived account balances
- [ ] Create budget and verify actuals
- [ ] Create savings goal and contribution
- [ ] Create debt and payment
- [ ] Verify principal-only debt reduction
- [ ] Add assets/liabilities
- [ ] Verify net worth
- [ ] Save encrypted vault
- [ ] Lock and reopen
- [ ] Confirm no legacy API calls in Vault mode
- [ ] Confirm no plaintext financial browser persistence
- [ ] User approval

# Financial Integrity Review — 2026-10-18

**Scope:** focused source review of the approved local-first baseline before further UI redesign work.  
**Branch:** `fix/financial-integrity-guardrails`  
**Status:** review in progress; not a certification or a complete accounting audit.

## Principles retained

- Money remains integer minor units plus an explicit currency code.
- Transactions remain the source of truth for ledger-derived balances and budget actuals.
- Transfers are not income or expenses.
- Savings contributions are goal progress, not ordinary expenses.
- Only principal reduces debt balances.
- Net worth is assets minus liabilities.
- The encrypted `.fdv` vault remains the persistence boundary; plaintext financial records must not be moved to remote persistence.

## Corrected in this review branch

1. **Currency isolation in frontend summaries.** Cash-flow totals and monthly series now accept a reporting currency; budget actuals ignore transactions recorded in a different currency.
2. **Legacy currency normalization.** Missing transaction currency is inferred from its source account; missing currencies on records whose existing UI contract defaults to COP are normalized to COP.
3. **Debt-payment reconciliation.** New debt payments must be positive safe integer minor-unit amounts with nonnegative components and satisfy `amount = principal + interest + fees`.
4. **Debt UI safeguards.** The form explains mismatched totals and rejects principal above the outstanding balance. A blank principal is calculated as total minus entered interest and fees; explicit zero remains zero.
5. **Transfer UI safeguard.** New transfers can only select a destination account in the same currency as the source.
6. **Go/WASM currency isolation.** Savings goals and debts are filtered to the requested analysis currency before producing currency-specific results.
7. **Local transaction time.** The new transaction form initializes its `datetime-local` field from local wall-clock time rather than slicing a UTC ISO string, avoiding a default timestamp shift by the user's timezone offset.
8. **Regression tests.** Tests cover mixed-currency summaries/balances, payment reconciliation, legacy currency normalization and Go/WASM currency isolation.

## Open architectural decisions — do not silently change

### 1. Currency exponent and legacy amount semantics

The frontend currently converts entered amounts with a fixed `× 100` and formats by dividing by 100. That is a product-level storage convention, not a complete ISO-4217 minor-unit implementation for every currency. COP is displayed with zero fractional digits, while input allows two decimals; other currencies can have different minor-unit exponents.

Before broadening currency support, define a versioned amount contract, migration strategy for existing `.fdv` files, and display/input rounding rules. Do not reinterpret existing integer amounts without migration tests.

### 2. Net-worth coverage and double counting

Current net-worth totals include explicit assets, explicit liabilities and debts. Account balances are presented separately and are not automatically included in net worth. A future design must decide how cash/bank/investment accounts become assets and credit balances become liabilities while preventing a user-entered asset from duplicating an account balance.

### 3. One authoritative calculation boundary

The Go/WASM engine and frontend JavaScript both implement financial calculations. Some screens still call JavaScript directly, and the dashboard uses JavaScript fallback if WASM fails. This creates a risk of divergent rules. Future work should establish shared fixtures and parity tests first, then choose whether Go/WASM is authoritative for all supported calculations or whether a single tested domain module is authoritative.

### 4. Transfer integrity for imported or manually edited vaults

The UI now prevents new cross-currency transfers, but historical/imported vault data can still contain inconsistent transfer records. Add an explicit vault-integrity validation/reporting path before considering this fully closed. Do not silently discard or auto-convert such transactions.

### 5. Ledger validation and reconciliation

The current UI normalizes some inputs but does not yet provide a comprehensive import-time validator for all invariants (account existence, currency agreement, transaction amount bounds, transfer consistency, category kind, date/period validity, and debt-payment history). Add validation with clear diagnostics and tests without rewriting the encrypted file on load.

### 6. Inactivity auto-lock and unsaved work

The vault auto-lock clears active state after inactivity. Review whether dirty work should be warned, autosaved only through an encrypted export flow, or clearly recoverable. Do not weaken auto-lock or persist plaintext to avoid data loss.

## Motion Primitives applicability

The repository already has Tailwind CSS, CSS-based entrance/progress animations and reduced-motion support. Motion Primitives can be adopted selectively, not as a wholesale design-system replacement.

Potentially useful:
- `AnimatedGroup` for a restrained stagger of dashboard cards;
- `AnimatedNumber` only for non-sensitive presentation transitions, with immediate readable values and no animation that delays or obscures financial amounts;
- `InView` for long reports or educational sections if it improves performance/readability.

Avoid for this product:
- scramble/rolling effects on balances, totals, transaction amounts or security state;
- persistent cursor-following/glow effects;
- replacing existing CSS transitions with a second overlapping animation system.

The official installation guide expects Tailwind, the `motion` package, a class utility (`clsx` + `tailwind-merge`) and Lucide React for the documented setup. This repository has Tailwind but does not currently declare those additional dependencies or a full shadcn component setup. Prefer manually adding only a selected component and its minimal dependencies after checking bundle impact, keyboard behavior, touch behavior and `prefers-reduced-motion`. Do not run the shadcn installer blindly.

## Validation status

GitHub Actions must pass the frontend tests/build, WASM build, Go tests/build and source security audit for this branch. Runtime and responsive visual review remain separate from CI. No changes in this review authorize merging the separate visual-redesign PR automatically.

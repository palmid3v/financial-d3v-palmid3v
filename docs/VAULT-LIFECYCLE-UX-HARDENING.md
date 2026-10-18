# Vault lifecycle and UX hardening

## Scope
This branch starts the next hardening pass after the approved baseline and financial-integrity guardrails.

## Implemented in this branch
- Account cards expose edit actions for name, account type and currency.
- Currency changes are blocked when a transaction references the account, preserving historical ledger meaning.
- Account deletion is blocked when transactions reference it, preventing orphaned ledger entries.
- Currency codes are normalized and checked for a three-letter format in account creation/edit forms.
- Account create/edit/delete feedback explicitly reminds users that changes remain in memory until the vault is saved.
- Typography uses a local retro-futurist-oriented font stack and improves navigation/control text legibility without downloading fonts from third parties.
- The vault provider can write back to a selected file handle when one is supplied, and defers inactivity auto-lock while unsaved changes exist rather than silently discarding them.

## Important limitation to close before production
The current unlock UI must pass a File System Access API handle to `unlockFile(file, password, handle)` for direct overwrite to be available. Browsers without that API continue to download a new encrypted file on save. The current UI still needs a dedicated “Open file for direct saving” flow, save-as/backup UX, and a clear unsaved-changes state before this can be considered complete.

## Security and accounting constraints
- Do not store the password or decrypted vault in browser localStorage/sessionStorage.
- Keep the FDV encryption envelope and cryptographic parameters unchanged.
- Never delete an account with linked transactions; do not change the currency of an account with linked transactions.
- Importing external financial data is intentionally not implemented yet. Future import must include preview, mapping, validation, duplicate detection and user-confirmed commit.
- Money remains integer minor units under the current schema. Do not change currency exponent semantics without a versioned migration.
- This branch does not claim that all financial entities now support edit/delete; those require entity-specific ledger-safe rules and tests.

## Validation required
- Run frontend tests/build and Go/WASM checks.
- Exercise account create/edit/delete guards against a test vault with linked and unlinked transactions.
- Verify direct-save behavior in a supported Chromium browser and download fallback in unsupported browsers.
- Verify unsaved-change behavior during inactivity and manual lock.
- Check desktop/mobile layout at narrow widths and keyboard focus visibility.

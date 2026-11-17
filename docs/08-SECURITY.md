# Security — Financial-D3V

**Document review:** 2026-11-17  
**Security scope:** active local-first Personal Vault  
**Evidence baseline:** quality checkpoint 2026-11-12; successful maintenance CI reported 2026-11-13

Financial-D3V is private by design. The active financial-data security boundary is the user-controlled encrypted Financial Vault.

## Active data path

```text
Encrypted FDV1 .fdv file
        ↓
Browser unlock using the vault password
        ↓
Decrypted financial state in active memory
        ↓
React UI + local Go/WebAssembly calculations
        ↓
Lock / 15-minute inactivity timeout
        ↓
Clear active state and password reference
        ↓
LOCKED
```

## Vault cryptography and controls

- FDV1 versioned encrypted envelope.
- PBKDF2-SHA256 with 600,000 iterations for key derivation.
- AES-256-GCM with a 128-bit authentication tag.
- Fresh random salt and IV per vault encryption operation.
- Reject wrong passwords, modified ciphertext, unsupported versions and malformed inputs.
- Keep password references and decrypted vault state in memory while unlocked.
- Lock clears active state and password reference.
- Documented inactivity auto-lock: 15 minutes.
- Encrypted `.fdv` import/export; vault file and password are separate recovery dependencies.
- Local WASM loading is allowed. Loading the local engine resource is not financial-data transmission.

## Data handling invariants

Do not intentionally persist decrypted financial plaintext in localStorage, sessionStorage, IndexedDB, Firebase/Firestore, Vercel storage, GitHub, logs, analytics, crash reports or remote Go APIs. Do not upload `.fdv` files, passwords, derived keys or bank statements to remote services. Firebase Auth, when used, is identity only and is never the encryption key.

## Financial integrity invariants

- Money uses integer minor units and explicit currency.
- Transfers are not income or expenses.
- Savings contributions update goal progress and are not ordinary expenses.
- Debt payments distinguish principal, interest and fees; only principal reduces debt balance.
- Net worth = assets − liabilities.

## Validation evidence and limitations

The 2026-11-12 checkpoint documents 32/32 frontend tests and Go test/build passing on the maintenance PR on 2026-11-13. That does not replace manual HTTPS save → lock → reopen, account/ledger reconciliation or independent security review. Do not claim those gates passed unless new evidence is recorded.

This is an application-level security design. It is not an external penetration test, cryptographic audit or formal certification.

## Credentials and recovery

Never commit passwords, private keys, refresh tokens, CI credential files or decrypted `.fdv` contents. Recovery requires both the encrypted vault file and its correct password. There is no password reset or recovery service.

## Historical architecture

Older Firebase/Firestore/Cloud Run/Artifact Registry/Scheduler and Go REST security documentation is retained for traceability only. Those designs are not the active Personal Vault data path. Any future Business Finance integration must follow ADR-034, maintain an independent Business vault and transmit only approved minimized non-PII operational events; implementation is not yet started.

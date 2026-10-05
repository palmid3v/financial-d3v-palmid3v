# FASE 27 — Financial Vault / Private Data Architecture

**Status:** BUILT — SECURITY VALIDATION PENDING  
**Date:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)

## Objective

Replace the Google Cloud production-data path with a local-first encrypted Financial Vault.

Financial data must not be persisted in plaintext in:
- localStorage
- IndexedDB
- Firebase
- Vercel
- GitHub
- browser cache as an intentional persistence mechanism

The persistent source of truth is an encrypted vault file controlled by the user.

## Product model

```text
                 Vercel Hobby
                     |
              React + Vite PWA
                     |
              ┌──────▼──────┐
              │ Vault Gate  │
              │   LOCKED    │
              └──────┬──────┘
                     |
              vault file + password
                     |
              ┌──────▼──────┐
              │   MEMORY    │
              │ decrypted   │
              │ financial   │
              │ workspace   │
              └──────┬──────┘
                     |
              lock / timeout / exit
                     |
              ┌──────▼──────┐
              │ re-encrypt  │
              │ vault file  │
              └─────────────┘
```

## Security boundary

The encrypted file is the persistence boundary.

The password:
- is never stored in the vault;
- is never sent to a remote API;
- is never stored in localStorage/sessionStorage;
- exists only for the unlock/save operation.

The decrypted financial dataset:
- exists only in active application memory;
- is never intentionally sent to Firebase, Vercel, or a remote Go API;
- is cleared from application state on lock.

## Vault envelope v1

The first web vault format is versioned as `FDV1`.

Envelope:

```json
{
  "format": "FDV1",
  "version": 1,
  "kdf": {
    "name": "PBKDF2",
    "hash": "SHA-256",
    "iterations": 600000,
    "salt": "<base64>"
  },
  "cipher": {
    "name": "AES-GCM",
    "keyBits": 256,
    "iv": "<base64>",
    "tagBits": 128
  },
  "payload": "<base64 ciphertext>"
}
```

The payload is UTF-8 JSON containing the Financial-D3v domain state.

AES-GCM provides authenticated encryption. A fresh random IV is generated for every vault write.

## Important security status

This is an application-level vault format, not a formal cryptographic standard and not KDBX-compatible.

Before real financial use, validate:
- password cracking resistance;
- PBKDF2 cost on supported devices;
- AES-GCM parameter handling;
- file tamper detection;
- malformed-file handling;
- memory/session lifecycle;
- auto-lock behavior;
- browser cache behavior;
- export/import recovery;
- cross-browser compatibility.

Do not describe the vault as formally audited or cryptographically equivalent to KeePass/KDBX.

## Current implementation

`frontend/src/vault/crypto.js` provides:
- `sealVault`
- `openVault`
- `createEmptyVault`
- base64 helpers
- versioned envelope validation

`frontend/src/vault/VaultContext.jsx` now establishes the encrypted file as the persistence boundary when a new vault is created: the empty vault is sealed immediately and exported as `financial-d3v.fdv`, while the decrypted state remains in memory.

`frontend/src/vault/VaultGate.jsx` keeps the legacy API-backed application unmounted during FASE 27 validation. Once unlocked, the gate exposes only the Vault validation workspace with save/lock controls. FASE 28 will replace this temporary isolation with the migrated financial modules.

The module intentionally has no network dependency.

## Migration strategy

The existing Firebase-backed API remains intact temporarily so the product is not broken during migration.

Migration order:

1. Build vault format.
2. Build Vault Gate.
3. Build in-memory repository.
4. Migrate dashboard.
5. Migrate transactions/accounts/categories.
6. Migrate budgets.
7. Migrate savings.
8. Migrate debts.
9. Migrate net worth/assets/liabilities.
10. Migrate education.
11. Remove plaintext financial persistence from Firebase.
12. Keep Firebase Auth only if it adds value to account access; it must never become the financial-data encryption key.
13. Validate import/export and recovery.
14. Mark the vault production-ready only after the security gate passes.

## $0 deployment target

- GitHub: source control.
- Vercel Hobby: frontend deployment.
- Firebase Spark: optional authentication only.
- No Cloud Run.
- No Artifact Registry.
- No Cloud Scheduler.
- No paid Google Cloud billing dependency.

Vercel's Hobby plan is currently $0/month and supports Git-based deployment. Firebase's Spark plan does not require payment information and includes no-cost Firebase features and quotas. citeturn2search0turn0search0

## Acceptance criteria

FASE 27 is APPROVED only when:

- [ ] vault creation works;
- [ ] vault export produces a valid encrypted file;
- [ ] correct password opens the vault;
- [ ] wrong password fails;
- [ ] modified ciphertext fails;
- [ ] financial data is absent from plaintext browser persistence;
- [ ] lock clears active financial state;
- [ ] auto-lock clears active financial state;
- [ ] import/export round trip preserves all domain data;
- [ ] no plaintext financial payload reaches remote services;
- [ ] security review is complete;
- [ ] explicit user approval is recorded.

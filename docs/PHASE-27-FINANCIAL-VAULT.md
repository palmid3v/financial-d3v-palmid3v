# FASE 27 — Financial Vault / Private Data Architecture

**Status:** APPROVED / BUILT / VALIDATED  
**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)

## Objective

Replace the Google Cloud financial-data path with a local-first encrypted Financial Vault.

## Result

The encrypted user-controlled `.fdv` file is the persistent financial source of truth.

```text
LOCKED
  ↓
vault file + password
  ↓
decrypt in memory
  ↓
financial workspace
  ↓
save/export encrypted file
  ↓
lock / 15-minute timeout
  ↓
clear active state
  ↓
LOCKED
```

## Implemented

- FDV1 versioned envelope.
- PBKDF2 SHA-256, 600,000 iterations.
- AES-256-GCM, 256-bit key and 128-bit authentication tag.
- Fresh random salt and IV.
- Payload validation.
- Encrypted export/import.
- Vault Gate lifecycle.
- In-memory decrypted state.
- Password held only during the active unlocked session.
- Lock/session clear.
- 15-minute inactivity auto-lock.

## Validation

Automated and runtime validation were completed as part of FASES 27–31.

Regression coverage includes:
- round trip;
- incorrect password;
- modified ciphertext;
- unsupported version;
- malformed input.

## Security limitation

This is an application-level encryption design. It is not a formal external cryptographic audit or KDBX-equivalent implementation.

## Architecture decision

Firebase/Firestore/Cloud Run are no longer the financial persistence boundary for this phase. Historical implementation remains only for traceability.

**Exit:** APPROVED / BUILT / VALIDATED.

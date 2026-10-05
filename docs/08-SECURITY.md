# Security — Financial-D3v

**Status: FASE 30 APPROVED / FASE 31 BUILT / VALIDATION PENDING**

Financial-D3v is private by design.

## Active security boundary

```text
Encrypted FDV1 file
      ↓
Browser unlock + password
      ↓
decrypted financial state in active memory
      ↓
React + Go/WASM local computation
      ↓
lock / auto-lock
      ↓
active state and password reference cleared
      ↓
LOCKED
```

The legacy Firebase/Go API path remains in the repository for historical traceability but is not the source of truth for Vault mode.

## Vault controls

- FDV1 versioned encrypted envelope.
- PBKDF2 SHA-256 with 600,000 iterations.
- AES-256-GCM with authenticated metadata.
- Fresh random salt and IV for each vault write.
- Wrong-password, tamper, malformed-input and version regression tests.
- Password held only in an in-memory React ref while unlocked.
- Lock clears the vault state and password reference.
- 15-minute inactivity auto-lock.
- No intentional financial plaintext persistence in localStorage, sessionStorage or IndexedDB.
- Vault mode does not intentionally send financial plaintext to remote services.
- Encrypted .fdv export/import is the recovery boundary.

## FASE 31 gate

The implementation and source audit are built. Runtime and production evidence are still required before the phase is approved.

Run:

```powershell
.\scripts\validate.ps1
.\scripts\security-audit.ps1
```

Then complete the runtime checklist in docs/PHASE-31-SECURITY-RECOVERY-PRODUCTION.md.

## Credential handling

Do not commit private keys, passwords, refresh tokens, user credentials or CI credential files.

## Security posture

Financial-D3v is **not formally security audited**. The vault is an application-level encryption design using standard Web Crypto primitives. Do not describe it as KDBX-equivalent or independently audited without specialist review.

## Historical production path

The older Firebase/Cloud Run security controls remain in repository history and legacy documentation for traceability. They are not required by the $0 local-first Financial Vault architecture.
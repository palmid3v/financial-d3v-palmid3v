# Security — Financial-D3v

**Status:** FASE 31 APPROVED / BUILT / VALIDATED  
**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)

Financial-D3v is private by design. The active financial-data security boundary is the encrypted Financial Vault.

## Active boundary

`text
Encrypted FDV1 file
      ↓
Browser unlock + password
      ↓
decrypted financial state in active memory
      ↓
React + Go/WASM local computation
      ↓
lock / 15-minute inactivity timeout
      ↓
active state + password reference cleared
      ↓
LOCKED
`

## Vault controls

- FDV1 versioned encrypted envelope.
- PBKDF2 SHA-256 with 600,000 iterations.
- AES-256-GCM with 128-bit authentication tag.
- Fresh random salt and IV.
- Wrong-password rejection.
- Modified-ciphertext rejection.
- Unsupported-version rejection.
- Malformed-input rejection.
- Password held only in memory.
- Lock clears active vault state and password reference.
- 15-minute inactivity auto-lock.
- Encrypted .fdv export/import.
- No intentional financial plaintext in localStorage, sessionStorage or IndexedDB.
- No intentional financial plaintext sent to a remote financial API.
- Local WASM loading is allowed; `goEngine.js⟧ uses `fetch()⟧ only to load `/wasm/financial-engine.wasm⟧.

## Validation evidence

`text
Frontend dependencies          PASS
Frontend tests                 10/10 PASS
Frontend production build      PASS
Frontend WASM build            PASS
Vault security source audit    PASS
Go tests                       PASS
Go build                       PASS
Runtime Vault flow             PASS
Wrong-password rejection       PASS
Lock/unlock/recovery           PASS
`

The source audit is scoped to `frontend/src/vault⟧ and distinguishes the legitimate local WASM resource load from financial network transport.

## Commands

`powershell
.\scripts\validate.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\security-audit.ps1
cd frontend
npm run preview
`

## Credential handling

Never commit private keys, passwords, refresh tokens, user credentials, CI credential files or decrypted .fdv contents.

## Recovery

The encrypted .fdv file and password are separate recovery dependencies. There is no password recovery service.

## Limitation

FASE 31 is an application validation gate, not an external security audit. Do not describe Financial-D3v as formally audited, independently certified or KDBX-equivalent.

## Historical architecture

Firebase/Firestore/Cloud Run/Artifact Registry/Scheduler security controls remain for historical traceability only.

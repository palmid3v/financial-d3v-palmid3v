# Financial-D3v

Financial-D3v is a private personal-finance application and financial learning workspace.

## Product loop
Record → Categorize → Understand → Plan → Save → Review → Learn → Adjust

## $0 architecture target

Financial-D3v is being redesigned around a user-controlled encrypted vault.

```text
GitHub
  ↓
Vercel Hobby
  ↓
React + Vite PWA
  ↓
Financial Vault
  ├── encrypted file persistence
  ├── unlock with master password
  ├── decrypted state only in memory
  └── lock/auto-lock clears the active session
```

The persistent financial source of truth is the encrypted Financial Vault file.

Firebase remains optional. If Firebase Auth is retained, it is an access/account mechanism only; it is not the encryption key and it must not receive plaintext financial data.

## Approved stack

React + Vite · Tailwind · Dark Mode · PWA · Go 1.27 · REST/HTTP · Firebase Auth/Firestore where justified · GitHub Actions · Markdown.

## Deployment principle

The project must remain deployable at $0 for personal use.

Current target:
- GitHub for source control.
- Vercel Hobby for the web application.
- Firebase Spark only for features that remain inside its no-cost limits.
- No Cloud Run.
- No Artifact Registry.
- No Cloud Scheduler.
- No Google Cloud Billing dependency for the financial vault.

Vercel currently lists Hobby at $0/month and supports Git-based deployment. Firebase documents a no-cost Spark plan that does not require payment information; Firestore has a no-cost quota but can require billing for higher usage and certain features. citeturn2search0turn0search0turn0search1

## Current checkpoint

- FASES 1–17: APPROVED / BUILT
- FASES 18–24: IMPLEMENTED / VALIDATION PENDING
- FASE 25: APPROVED / BUILT
- FASE 26: APPROVED / BUILT
- FASES 27–28: RE-SCOPED — Google Cloud production path retired
- FASE 27: BUILT / SECURITY VALIDATION PENDING — Financial Vault foundation
- FASE 28: PLANNED — Vault migration of all financial modules
- FASE 29: PLANNED — Go financial engine / local computation boundary
- FASE 30: PLANNED — $0 Vercel + Firebase integration and deployment
- FASE 31: PLANNED — Security, recovery and production validation
- FASE 32+: CONTINUOUS EVOLUTION

## Financial Vault

The Financial Vault follows the privacy model established in PasswordVault:

- locked by default;
- user-controlled vault file;
- password required to unlock;
- decrypted data only in active memory;
- no plaintext financial persistence in browser storage;
- lock/auto-lock clears active financial state;
- encrypted export/import;
- versioned file format;
- no secrets committed to Git.

The current web vault foundation is `frontend/src/vault/crypto.js` and `docs/PHASE-27-FINANCIAL-VAULT.md`.

The vault uses Web Crypto primitives (PBKDF2 + AES-GCM) for the first version. This is an implementation foundation, not a formal security audit or a claim of KDBX equivalence. Web Crypto itself warns that secure cryptographic system design requires specialist review. citeturn1search1turn1search3

## Documentation

- `docs/PHASE-27-FINANCIAL-VAULT.md`
- `docs/13-ROADMAP.md`
- `docs/08-SECURITY.md`
- `docs/OPERATIONS-RUNBOOK.md`
- `STEP-BY-STEP-FINANCIAL-D3V-2026-10-04.md`

## Master execution rule

1. Define scope.
2. Implement.
3. Test.
4. Build.
5. Validate runtime.
6. Review UX/security.
7. Update documentation.
8. Mark APPROVED / BUILT only after evidence exists.
9. Move to the next phase.

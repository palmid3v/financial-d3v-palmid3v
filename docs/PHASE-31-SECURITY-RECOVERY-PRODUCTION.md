# FASE 31 — Security / Recovery / Production Validation

**Status:** BUILT — VALIDATION PENDING  
**Date:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)

## Objective

Close the first-release security and recovery gate for the local-first Financial Vault and validate the $0 production path.

FASE 31 does not introduce a new financial-data backend. The encrypted `FDV1` file remains the persistence boundary.

## Scope

1. Vault security review.
2. Automated cryptographic regression tests.
3. Browser persistence audit.
4. Auto-lock and session-clear validation.
5. Encrypted export/import recovery.
6. PWA/service-worker production validation.
7. Vercel Hobby deployment validation.
8. Release and recovery runbook.
9. Explicit approval after evidence.

## Security boundary

```text
Encrypted FDV1 file
        ↓
Browser unlock + password
        ↓
decrypted state in active memory
        ↓
React + Go/WASM local computation
        ↓
lock / inactivity timeout
        ↓
active state + password reference cleared
        ↓
LOCKED
```

The password is not persisted and is not sent to a remote service. Financial plaintext must not be intentionally persisted in browser storage or sent to the network.

## Automated gate

Run from repository root:

```powershell
.\scripts\validate.ps1
.\scripts\security-audit.ps1
```

The validation runner must pass:

- frontend dependency installation;
- frontend tests;
- frontend production build;
- WASM build;
- Go tests;
- Go build.

The security audit must pass its vault-source checks.

## Runtime security gate

In the production-like Vite preview build:

- [ ] Create a new encrypted vault.
- [ ] Verify the downloaded `.fdv` is not plaintext JSON domain data.
- [ ] Unlock with the correct password.
- [ ] Reject an incorrect password.
- [ ] Modify ciphertext and verify unlock fails.
- [ ] Lock the workspace and verify financial UI/state is cleared.
- [ ] Leave the unlocked workspace inactive for 15 minutes and verify auto-lock.
- [ ] Verify activity resets the inactivity timer.
- [ ] Reopen the exported vault and verify supported domain data is preserved.
- [ ] Verify browser storage contains no intentional financial plaintext.
- [ ] Verify Vault mode makes no financial network requests.
- [ ] Verify the console is clean during normal Vault flows.

## Recovery procedure

### Normal recovery

1. Keep the encrypted `.fdv` file in a user-controlled backup location.
2. Open Financial-D3v.
3. Select **Open vault**.
4. Select the `.fdv` file.
5. Enter the vault password.
6. Verify dashboard totals and representative records.
7. Continue working.
8. Save a new encrypted `.fdv` after meaningful changes.

### Lost password

There is no password recovery service in the local-first architecture.

If the password is lost, the encrypted vault cannot be recovered by the application. The user must restore from an independently preserved, still-readable vault/password combination.

### Corrupted or damaged vault

1. Preserve the original file without overwriting it.
2. Try a known-good backup.
3. Verify the backup opens with the expected password.
4. Confirm representative accounts, transactions, budgets, savings, debts and net worth.
5. Treat the original file as suspect until its integrity can be established.

### Backup rule

The `.fdv` file and its password are separate recovery dependencies. Backups should preserve the encrypted file and protect the password through a separate user-controlled mechanism.

## Production path

Target:

```text
GitHub main
   ↓
Vercel Hobby
   ↓
React/Vite PWA
   ↓
encrypted Financial Vault
```

Production deployment uses the existing root `vercel.json`.

No Cloud Run, Artifact Registry, Cloud Scheduler, Firestore financial persistence, or paid Google Cloud dependency is required for the Financial Vault.

Production deployment itself remains a validation activity until a real deployed URL has been checked.

## Acceptance criteria

FASE 31 is APPROVED only when all of the following have evidence:

- [ ] Automated validation PASS.
- [ ] Security audit PASS.
- [ ] Cryptographic regression tests PASS.
- [ ] Auto-lock behavior PASS.
- [ ] Lock/session-clear behavior PASS.
- [ ] Export/import recovery PASS.
- [ ] Browser persistence audit PASS.
- [ ] No intentional plaintext financial network persistence.
- [ ] Production Vercel deployment PASS.
- [ ] PWA install/update behavior PASS.
- [ ] Production runtime smoke test PASS.
- [ ] Recovery procedure reviewed.
- [ ] Explicit user approval recorded.

**Important:** BUILT does not mean security-audited. Do not describe Financial-D3v as formally security audited until an appropriate external review exists.
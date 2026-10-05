# Financial-D3v Operations Runbook

**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)

## Source of truth

GitHub `main⟧ is authoritative.

`powershell
git pull origin main
`

## Automated validation

`powershell
.\scripts\validate.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\security-audit.ps1
`

Expected checks:
- frontend dependencies;
- frontend tests;
- frontend build;
- WASM build;
- Vault security audit;
- Go tests;
- Go build.

## Runtime validation

`powershell
cd frontend
npm run preview
`

Validate:
1. Create Vault.
2. Save/export Vault.
3. Correct-password unlock.
4. Incorrect-password rejection.
5. Lock.
6. Unlock again.
7. Representative data.
8. Recovery/import.
9. PWA behavior.
10. No intentional plaintext browser persistence.

## Security lifecycle

While unlocked:
- decrypted financial data is active in memory;
- password is held only for the active session;
- Go/WASM receives in-memory calculation input.

When locked:
- active vault state is cleared;
- password reference is cleared;
- application returns to the locked boundary.

Auto-lock: **15 minutes of inactivity**.

## Recovery

### Normal
1. Preserve encrypted .fdv.
2. Open Financial-D3v.
3. Choose Open Vault.
4. Select the .fdv.
5. Enter password.
6. Verify representative totals and records.
7. Continue working.
8. Save a new encrypted file after meaningful changes.

### Incorrect password

Expected:

`text
Vault unavailable.
Unable to open the Financial Vault.
Check the password or file integrity.
`

### Lost password

There is no password recovery service. A valid encrypted file without its correct password cannot be recovered by the application.

### Damaged vault

1. Preserve the original.
2. Do not overwrite it.
3. Try a known-good encrypted backup.
4. Verify representative financial data.
5. Keep the damaged file isolated.

## Backup principle

The .fdv file and password are separate recovery dependencies.

Do not commit .fdv files, decrypted financial JSON or passwords to Git.

## Deployment

`text
GitHub main
   ↓
Vercel Hobby
   ↓
React/Vite PWA
   ↓
local encrypted Financial Vault
`

Root `vercel.json⟧ defines install, build and output for the frontend.

A real Vercel deployment remains a separate production smoke-test activity.

## Rollback

Frontend: redeploy a previous known-good Vercel deployment.

Financial data: restore the last known-good encrypted .fdv file.

There is no active remote financial database to roll back in Vault mode.

## Historical cloud path

Cloud Run, Firebase/Firestore and Scheduler procedures remain historical only.

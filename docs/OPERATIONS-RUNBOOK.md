# Financial-D3v Operations Runbook

## Local development

From repository root:

```powershell
.\scripts\validate.ps1
.\scripts\security-audit.ps1
```

Manual runtime:

```powershell
cd frontend
npm run preview
```

## Release validation

1. Pull the current main.
2. Run scripts/validate.ps1.
3. Run scripts/security-audit.ps1.
4. Run the FASE 31 runtime security checklist.
5. Verify Vault create/open/save/lock/auto-lock.
6. Verify export/import recovery.
7. Verify no intentional financial plaintext browser persistence.
8. Verify no financial network dependency in Vault mode.
9. Verify PWA/service-worker behavior.
10. Validate the Vercel deployment.
11. Record the evidence before marking FASE 31 APPROVED.

## Recovery

### Normal

1. Preserve the encrypted .fdv file.
2. Open Financial-D3v.
3. Select Open vault.
4. Select the .fdv file.
5. Enter the vault password.
6. Verify representative financial totals and records.
7. Continue working.
8. Save a new encrypted .fdv after meaningful changes.

### Lost password

There is no password recovery service. A lost password cannot be recovered by the application. Recovery requires a valid backup and its password.

### Damaged vault

1. Preserve the original file.
2. Do not overwrite it.
3. Try a known-good backup.
4. Verify it opens with the expected password.
5. Check representative accounts, transactions, budgets, savings, debts and net worth.

## Backup principle

The encrypted .fdv file and its password are separate recovery dependencies. Store backups under user-controlled protection and do not commit them to Git.

## Production

Target:

```text
GitHub main
   ↓
Vercel Hobby
   ↓
React/Vite PWA
   ↓
local encrypted Financial Vault
```

The root vercel.json defines the Vercel build and output configuration.

Production deployment is not considered validated until the deployed URL passes the runtime smoke test and PWA/service-worker checks.

## Rollback

For the frontend, redeploy the previous known-good Vercel deployment.

For financial data, restore the last known-good encrypted .fdv file. There is no server-side financial database to roll back in Vault mode.

## Historical cloud path

Older Cloud Run, Firestore and scheduler procedures remain in repository history for traceability. They are not part of the active $0 Financial Vault release path.
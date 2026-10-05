# Financial-D3v — Vercel Deployment

**Status:** ACTIVE DEPLOYMENT GUIDE  
**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)

## Target

```text
GitHub main → Vercel Hobby → frontend/dist
                         ↓
                 encrypted Financial Vault
```

The Financial Vault is local-first. No hosted database is required for financial data.

## Repository configuration

Root `vercel.json` defines:

- install: `cd frontend && npm ci`
- build: `cd frontend && npm run build`
- output: `frontend/dist`

## Local pre-deployment validation

From repository root:

```powershell
git pull origin main
.\scripts\validate.ps1
```

Runtime:

```powershell
cd frontend
npm run preview
```

Verify:
- Vault create/open/save;
- incorrect-password rejection;
- lock/unlock;
- recovery/import;
- PWA metadata;
- responsive UI;
- Go/WASM calculation path.

## Privacy requirements

Do not configure a hosted database as the Financial Vault persistence layer.

Do not upload:
- .fdv files;
- vault passwords;
- decrypted financial JSON;
- financial backups containing plaintext.

Firebase remains historical/optional infrastructure and is not the active financial-data store.

## Vercel deployment

Connect `palmid3v/financial-d3v-palmid3v` to Vercel and deploy the `main` branch.

After deployment, run a production smoke test against the real URL.

## Production smoke test

1. Open the deployed URL.
2. Verify the app loads over HTTPS.
3. Create a test Vault.
4. Save/export the encrypted .fdv.
5. Lock.
6. Reopen with the correct password.
7. Confirm incorrect password is rejected.
8. Confirm representative financial data is preserved.
9. Check PWA install/update metadata.
10. Record the exact result.

A production URL is not claimed as validated until this smoke test has actually been observed.

## Cost target

The active personal deployment target is $0 using Vercel Hobby.

No Cloud Run, Artifact Registry, Cloud Scheduler or paid Google Cloud dependency is required.

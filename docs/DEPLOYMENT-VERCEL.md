# Financial-D3v deployment

The application is designed for a $0 personal deployment:

`GitHub main → Vercel Hobby → frontend/dist`

## Vercel setup

Connect `palmid3v/financial-d3v-palmid3v` to Vercel.

The repository root `vercel.json` already defines:

- install: `cd frontend && npm ci`
- build: `cd frontend && npm run build`
- output: `frontend/dist`

No secret is required for the Financial Vault itself. The vault file and password remain user-controlled.

## Important privacy boundary

Do not configure a hosted database as the Financial Vault persistence layer.

Firebase, if retained later, is optional infrastructure for non-sensitive account/authentication concerns only.

## Local verification

```powershell
cd D:\PALMI-D3V\projects\financial-d3v-palmid3v\frontend
npm ci
npm test
npm run build
npm run build:wasm
npm run preview
```

Open the local preview and verify the vault gate, responsive navigation, PWA metadata and Go engine status.

Production deployment and PWA installation remain FASE 31 validation work.

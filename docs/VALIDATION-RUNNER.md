# Validación del Proyecto — Validation Runner

**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)

## Purpose

Financial-D3v uses a repository-local PowerShell validation runner for the Palmi → Nexsy workflow.

**Process:** Automated → Runtime → Security → Functional → PASS / FIX / APPROVED

## Automated runner

```powershell
.\scripts\validate.ps1
```

The runner detects frontend package/lock files, npm scripts, `go.mod` and Go availability.

Current checks:
1. `npm ci`.
2. `npm run test`.
3. `npm run build`.
4. `npm run build:wasm`.
5. Vault security source audit.
6. `go test ./...`.
7. `go build ./...`.

## Security audit

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\security-audit.ps1
```

The audit checks the Vault boundary for localStorage, sessionStorage, IndexedDB, navigator.sendBeacon, XMLHttpRequest and unexpected fetch() usage.

The legitimate fetch() in `frontend/src/vault/goEngine.js` is allowed because it loads the local `/wasm/financial-engine.wasm` resource.

## Manual runtime

```powershell
cd frontend
npm run preview
```

FASE 31 runtime evidence included Vault creation/save/open, incorrect-password rejection, lock/unlock, recovery/import and security-boundary review.

## Failure behavior

The runner stops on the first failed automated check.

Never convert failure into success.

Statuses remain distinct:
- AUTOMATED VALIDATION COMPLETED;
- RUNTIME VALIDATION COMPLETED;
- VALIDATION PENDING.

## Evidence rule

Never claim CI, deployment, runtime or security success without observed evidence.

## Workflow

```text
Nexsy implements
      ↓
GitHub main updated
      ↓
Palmi git pull
      ↓
scripts/validate.ps1
      ↓
Automated validation
      ↓
Runtime validation
      ↓
Palmi reports exact output
      ↓
Nexsy diagnoses/fixes
      ↓
Documentation update
```

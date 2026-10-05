# STEP-BY-STEP — FINANCIAL-D3V

**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)  
**Repository:** `palmid3v/financial-d3v-palmid3v`  
**Source of truth:** GitHub `main`

## 1. Product baseline

Financial-D3v is a private personal-finance application and financial learning workspace.

Core loop:

**Record → Categorize → Understand → Plan → Save → Review → Learn → Adjust**

Education:

**FACT → CALCULATION → INTERPRETATION → ACTION**

## 2. Evolution to the current architecture

The project evolved through these major stages:

1. Product definition and financial domain.
2. Go REST/HTTP + Firebase/Firestore architecture.
3. Accounts, transactions, budgets, savings, debts, net worth and education.
4. Product UI/UX and dashboard.
5. Authentication/security hardening.
6. Re-scope to a $0 local-first architecture.
7. Financial Vault encryption and migration.
8. Go moved to local WebAssembly computation.
9. Design system, motion and PWA refinement.
10. Security, recovery and validation gate.

Older cloud implementation remains in GitHub for traceability but is not the active financial-data architecture.

## 3. Current architecture

```text
GitHub
   ↓
Vercel Hobby
   ↓
React + Vite + Tailwind PWA
   ↓
Financial Vault Gate
   ↓
FDV1 encrypted .fdv
   ↓
decrypted in-memory state
   ↓
Go 1.27 / WASM
   ↓
React UI
```

The encrypted .fdv file is the persistent source of truth.

## 4. Financial Vault lifecycle

```text
LOCKED
  ↓
Open/Create Vault
  ↓
password
  ↓
decrypt
  ↓
ACTIVE IN MEMORY
  ↓
edit
  ↓
save/export encrypted .fdv
  ↓
LOCK / AUTO-LOCK
  ↓
clear state + password reference
  ↓
LOCKED
```

Auto-lock: **15 minutes of inactivity**.

The password is not persisted remotely or in browser storage.

## 5. Vault format

FDV1 uses:
- PBKDF2 SHA-256;
- 600,000 iterations;
- random salt;
- AES-256-GCM;
- random IV;
- 128-bit authentication tag;
- versioned envelope;
- authenticated ciphertext.

## 6. Financial domain rules

- Money = integer minor units + currency.
- Transfers are not budget expenses.
- Budget actuals come from authoritative expense transactions.
- Savings contributions are goal-progress records.
- Debt payment separates amount, principal, interest and fees.
- Only principal reduces debt balance.
- Net worth = assets − all liabilities.
- Debt balances are liabilities.

## 7. Go/WASM

The local Go engine computes:
- cash flow;
- account balances;
- transfers;
- budget actuals;
- savings progress;
- debt principal reduction;
- net worth.

Browser path:

```text
Vault memory
   ↓
JSON calculation request
   ↓
Go/WASM
   ↓
calculation result
   ↓
React
```

`frontend/src/vault/goEngine.js` may load the local WASM binary using `fetch()`. This is local resource loading, not financial-data transport.

## 8. PWA and design system

FASE 30 established:
- dark-first design;
- semantic financial colors;
- design tokens;
- responsive desktop/mobile navigation;
- motion foundation;
- reduced-motion support;
- Vite PWA manifest;
- standalone install metadata;
- service-worker update;
- stale-cache cleanup.

## 9. Validación del Proyecto

The project validation process is:

```text
Automated
   ↓
Runtime
   ↓
Security
   ↓
Functional
   ↓
PASS / FIX / APPROVED
```

### Automated

From repository root:

```powershell
git pull origin main
.\scripts\validate.ps1
```

Current automated gate:
- npm ci;
- frontend tests;
- frontend build;
- WASM build;
- Vault security audit;
- Go tests;
- Go build.

### Security audit

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\security-audit.ps1
```

### Runtime

```powershell
cd frontend
npm run preview
```

## 10. FASE 31 final validation evidence

Observed automated results:

- frontend dependencies: PASS;
- frontend tests: **10/10 PASS**;
- frontend build: PASS;
- PWA generation: PASS;
- WASM build: PASS;
- Vault security source audit: PASS;
- Go tests: PASS;
- Go build: PASS.

Observed runtime results:

- Vault creation/save/open: PASS;
- incorrect password: correctly rejected;
- lock/unlock: PASS;
- recovery/import: PASS;
- security boundary behavior: PASS.

Expected incorrect-password message:

```text
Vault unavailable.
Unable to open the Financial Vault.
Check the password or file integrity.
```

## 11. Recovery procedure

1. Preserve the encrypted .fdv.
2. Open Financial-D3v.
3. Select Open Vault.
4. Select the .fdv.
5. Enter the password.
6. Verify representative totals and records.
7. Continue working.
8. Save a new encrypted file after meaningful changes.

There is no password recovery service.

## 12. Development workflow

**Palmi → Nexsy → GitHub → Palmi pulls → Palmi runs validation → Palmi reports exact output → Nexsy fixes**

Rules:
- GitHub main is source of truth.
- Built = implementation exists in GitHub.
- Validated = evidence exists.
- Never claim unobserved CI, deployment or runtime success.
- Documentation is updated after each completed phase.

## 13. Phase status

| Phase | Status |
|---|---|
| FASES 1–17 | APPROVED / BUILT |
| FASES 18–24 | APPROVED / BUILT |
| FASE 25 | APPROVED / BUILT / VALIDATED |
| FASE 26 | APPROVED / BUILT / VALIDATED |
| FASE 27 | APPROVED / BUILT / VALIDATED |
| FASE 28 | APPROVED / BUILT / VALIDATED |
| FASE 29 | APPROVED / BUILT / VALIDATED |
| FASE 30 | APPROVED / BUILT / VALIDATED |
| FASE 31 | APPROVED / BUILT / VALIDATED |
| FASE 32 | PLANNED |

## 14. Next step

**FASE 32 — Historical Financial Intelligence**

The next phase must preserve:
- encrypted Vault as source of truth;
- local/private computation;
- no plaintext financial persistence;
- no remote financial-data dependency.

**Financial-D3v · PALMI-D3V · 2026-10-05 · America/Bogota**

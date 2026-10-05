# CONTEXT — Financial-D3v

## Chat Continuation Context

**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)  
**Repository:** `palmid3v/financial-d3v-palmid3v⟧  
**Source of truth:** GitHub `main⟧

> This file reflects the current GitHub state after completion of FASE 31.

## Product identity

Financial-D3v is a private personal-finance application and financial learning workspace.

Core loop:

**Record → Categorize → Understand → Plan → Save → Review → Learn → Adjust**

Education:

**FACT → CALCULATION → INTERPRETATION → ACTION**

## Current architecture

`text
GitHub
  ↓
Vercel Hobby
  ↓
React + Vite + Tailwind PWA
  ↓
Financial Vault
  ├── FDV1 encrypted file
  ├── password-controlled unlock
  ├── decrypted state only in memory
  └── lock/auto-lock clears active state
            ↓
      Go 1.27 / WASM
            ↓
      local financial calculations
`

The encrypted .fdv file is the financial source of truth.

Financial plaintext must not intentionally persist in:
- localStorage;
- sessionStorage;
- IndexedDB;
- remote Firebase/Firestore;
- Vercel storage;
- GitHub;
- a remote Go API.

Firebase Auth may remain useful for non-financial identity, but it is not the encryption key and does not receive plaintext financial data in Vault mode.

## Approved stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| UI | Tailwind CSS |
| Visual | Dark-first, calm, information-first |
| PWA | Vite PWA / Workbox |
| Local computation | Go 1.27 + WebAssembly |
| Legacy API | Go REST/HTTP |
| Legacy persistence | Firebase Firestore |
| Optional identity | Firebase Auth |
| CI | GitHub Actions |
| Docs | Markdown |

## Financial invariants

- Money uses integer minor units plus currency.
- Transfers are not budget expenses.
- Budget actuals come from authoritative expense transactions.
- Savings contributions are goal-progress records, not ordinary expenses.
- Debt payments contain amount/principal/interest/fees.
- Only principal reduces debt balance.
- Net worth = assets − all liabilities.
- Debt balances are liabilities.
- Domain/Go values are authoritative; UI explains them.

## Vault security model

- FDV1 versioned envelope.
- PBKDF2 SHA-256, 600,000 iterations.
- AES-256-GCM, 128-bit authentication tag.
- Fresh random salt and IV.
- Wrong-password rejection.
- Modified-ciphertext rejection.
- Unsupported-version rejection.
- Malformed-input rejection.
- Password held only in an in-memory reference while unlocked.
- Lock clears active vault state and password reference.
- 15-minute inactivity auto-lock.
- Encrypted export/import.
- No intentional plaintext browser persistence.
- No intentional financial plaintext remote transport.

This is an application-level encryption design, not a formal external security audit.

## Go/WASM boundary

`text
Encrypted FDV1
     ↓
browser decrypt
     ↓
in-memory financial state
     ↓
Go Financial Engine / WASM
     ↓
calculated result
     ↓
React UI
`

`frontend/src/vault/goEngine.js⟧ loads the local WASM runtime and `financial-engine.wasm⟧. Its `fetch()⟧ loads the local WASM resource; it is not the financial-data transport boundary.

Implemented local calculations:
- cash flow;
- account balances;
- transfer effects;
- budget actuals;
- savings progress;
- debt principal reduction;
- net worth.

## Validación del Proyecto

`text
Automated
   ↓
Runtime
   ↓
Security
   ↓
Functional
   ↓
PASS / FIX / APPROVED
`

Runner:

`powershell
.\scripts\validate.ps1
`

Security audit:

`powershell
powershell -ExecutionPolicy Bypass -File .\scripts\security-audit.ps1
`

Runtime:

`powershell
cd frontend
npm run preview
`

Latest observed automated validation:
- frontend dependencies: PASS;
- frontend tests: 10/10 PASS;
- frontend production build: PASS;
- WASM build: PASS;
- Vault security source audit: PASS;
- Go tests: PASS;
- Go build: PASS.

Runtime validation observed:
- Vault create/save/open: PASS;
- incorrect password rejection: PASS;
- lock/unlock/recovery: PASS;
- security behavior reviewed: PASS.

## Phase status

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
| FASE 33+ | CONTINUOUS EVOLUTION |

FASES 27–31 are the first-release local-first foundation.

## Historical architecture

Older Firebase/Firestore/Cloud Run/Artifact Registry/Scheduler implementation and documentation remain for traceability. They are retired from the active financial-data path.

Active deployment:

**GitHub → Vercel Hobby → React/Vite PWA → encrypted local Financial Vault**

## Development workflow

**Palmi → Nexsy → GitHub → Palmi pulls → Palmi runs validation → Palmi reports exact output → Nexsy fixes**

Rules:
- GitHub `main⟧ is source of truth.
- Never claim test, CI or deployment success without observed evidence.
- “Built” means implementation exists in GitHub.
- “Validated” means evidence exists.
- Documentation is updated after phase completion.

## Recovery

The .fdv file and password are separate recovery dependencies.

Normal recovery:
1. Preserve the encrypted file.
2. Open the application.
3. Choose Open Vault.
4. Select the .fdv.
5. Enter the password.
6. Verify representative totals/records.
7. Continue working.
8. Save a new encrypted vault after meaningful changes.

Lost password:
- no recovery service exists;
- the application cannot decrypt the vault without the password;
- recovery requires another valid encrypted vault/password combination.

## Next phase

FASE 31 is complete.

**FASE 32 — Historical Financial Intelligence** is the next planned evolution.

Do not change the privacy boundary to implement FASE 32.

## Documentation rule

Canonical Step-by-Step file:

`STEP-BY-STEP-FINANCIAL-D3V-2026-10-05.md⟧

The filename and `Last updated⟧ date use the actual Colombia documentation date.

**Financial-D3v · PALMI-D3V · 2026-10-05 · America/Bogota**

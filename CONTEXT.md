# CONTEXT — Financial-D3v

## Chat Continuation Context

**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)  
**Repository:** `palmid3v/financial-d3v-palmid3v`  
**Source of truth:** GitHub `main`

> This file reflects the current GitHub state after completion of FASE 31.

## Product identity

Financial-D3v is a private personal-finance application and financial learning workspace.

Core loop:

**Record → Categorize → Understand → Plan → Save → Review → Learn → Adjust**

Education:

**FACT → CALCULATION → INTERPRETATION → ACTION**

## Current architecture

```text
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
```

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

```text
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
```

`frontend/src/vault/goEngine.js` loads the local WASM runtime and `financial-engine.wasm`. Its `fetch()` loads the local WASM resource; it is not the financial-data transport boundary.

Implemented local calculations:
- cash flow;
- account balances;
- transfer effects;
- budget actuals;
- savings progress;
- debt principal reduction;
- net worth.

## Validación del Proyecto

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

Runner:

```powershell
.\scripts\validate.ps1
```

Security audit:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\security-audit.ps1
```

Runtime:

```powershell
cd frontend
npm run preview
```

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
- GitHub `main` is source of truth.
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

`STEP-BY-STEP-FINANCIAL-D3V-2026-10-05.md`

The filename and `Last updated` date use the actual Colombia documentation date.

**Financial-D3v · PALMI-D3V · 2026-10-05 · America/Bogota**


## Documentation checkpoint — 2026-10-18

README.md actualizado y se registra el desbloqueo probado en despliegue HTTPS de Vercel desde teléfono. La dirección HTTP local mediante --host no ofrece un contexto seguro fiable para Web Crypto en móvil. Pendiente: ciclo de guardar → bloquear → reabrir y reconciliación de cambios de cuentas/ledger con tests. La bóveda .fdv sigue siendo fuente de persistencia; los datos descifrados se mantienen en memoria.

Status labels describe the latest documented evidence, not a guarantee that every workflow is complete. Update this checkpoint when new validation results arrive.

## Ecosystem handoff — 2026-11-01

Financial-D3v is one of four separate PALMI-D3V applications launched by [PALMI-D3V Connected Workspace](https://github.com/palmid3v/PALMI-D3V-Connected-Workspace). Its local app directory is `frontend/` and local URL is `http://127.0.0.1:5183`. The other apps are DayFlow (5180), Cupboard (HTTPS 5181) and Sandwichies (5182). Workspace root: `D:\\PALMI-D3V\\projects`.

**Domain ownership:** Financial-D3v owns private personal financial records and learning. It must not share plaintext financial data with the other apps or cloud services.

**Active architecture:** React/Vite/Tailwind PWA, FDV1 encrypted `.fdv` vault, decrypted state in memory only, local Go 1.27/WebAssembly calculations, Vercel HTTPS hosting. The encrypted file is the source of truth. Historical Firestore/Go REST cloud architecture is retired from the active financial-data path.

**Privacy invariant:** do not persist decrypted financial plaintext in localStorage, sessionStorage, IndexedDB, Firebase/Firestore, Vercel, GitHub or a remote Go API. Firebase Auth, if used, is identity only, not the encryption key. Keep password and unlocked financial state in memory; lock clears them. Preserve PBKDF2-SHA256 (600,000 iterations), AES-256-GCM and 15-minute inactivity auto-lock unless an explicitly reviewed security decision changes them.

**Financial invariants:** money uses integer minor units and currency; transfers are not expenses; savings contributions update goal progress; debt payments separate principal/interest/fees and only principal reduces balance; net worth = assets minus liabilities.

**Latest documented validation is historical:** 10/10 frontend tests, build, WASM build, Vault security source audit and Go tests/build passed; 2026-10-18 HTTPS mobile unlock was validated. Manual save → lock → reopen and account/ledger reconciliation remained pending. Do not call these fresh tests.

**Next phase:** FASE 32 Historical Financial Intelligence is planned. Implement it without changing the local-first privacy boundary. Use `.\scripts\validate.ps1` and the security audit instructions in the repo after reviewing their current contents.

For the shared launcher, project boundaries and cross-app continuation instructions, read the [PALMI-D3V AI handoff](https://github.com/palmid3v/PALMI-D3V-Connected-Workspace/blob/main/AI-HANDOFF-2026-11-01.md).


## Bank statement import handoff — 2026-11-12

A new branch `feat/bank-statement-import-nequi` starts FASE 32.1. It adds a local CSV batch import screen, account selection against existing vault accounts, editable income/expense/transfer classification, destination account selection for transfers, duplicate fingerprints, and audit metadata in `vault.statementImports`. Transaction records keep import source/provider/period/fingerprint and optional statement balance metadata. The import does not create accounts and does not save original files. Changes remain in unlocked memory until the user saves the encrypted .fdv.

Current implementation is CSV-only. PDF.js/OCR, Nequi PDF parsing, January–November monthly balance continuity, cross-account transfer matching and semantic classification remain pending. Do not import the user's real historical PDF set or modify the primary vault until local tests/build/security/runtime validation pass. See `docs/32-BANK-STATEMENT-IMPORT.md`.


## PALMI Ecosystem Business Finance — ADR-034 (2026-11-12)

**Decision accepted; implementation not started.** See `docs/34-PALMI-ECOSYSTEM-BUSINESS-FINANCE-ADR.md`, event schema `docs/contracts/palmi-business-financial-event.schema.json`, and Phase 34 in `docs/13-ROADMAP.md`.

- Personal and Business are separate encrypted .fdv files, with independent passwords/keys, salts, IVs, lock state, backups and recovery.
- Cloud synchronization transports only minimized, authenticated, non-PII commercial events. It never transports a vault, password, derived key, bank statement or decrypted ledger.
- Business accounting uses cash basis: receipt recognized only when funds are actually received; expense recognized only when paid.
- Sandwichies owns orders/payment state; Cupboard owns inventory/stock movements; Financial-D3v Business owns the cash ledger; DayFlow owns reminders/workflows; PALMI Connected Workspace remains the local launcher, not the cloud financial relay.
- Import uses at-least-once delivery with idempotent processing. Financial-D3v must save the encrypted Business vault successfully before acknowledging the cloud event cursor.
- Inventory purchase cash outflow is recorded once; later stock consumption is operational costing information, not another cash expense.
- No code, cloud resources, credentials, billing or production configuration were changed by this ADR documentation.

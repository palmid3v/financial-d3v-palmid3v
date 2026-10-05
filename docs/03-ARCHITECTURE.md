# Architecture — Financial-D3v

**Status:** CURRENT BASELINE  
**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)

## Active product architecture

`text
GitHub
   ↓
Vercel Hobby
   ↓
React + Vite + Tailwind PWA
   ↓
Financial Vault Gate
   ↓
FDV1 encrypted file
   ↓
decrypted in-memory financial state
   ↓
Go 1.27 / WebAssembly
   ↓
React presentation
`

The encrypted Financial Vault file is the persistent source of truth for financial data.

## Privacy boundary

Financial plaintext is intentionally kept out of:
- localStorage;
- sessionStorage;
- IndexedDB;
- remote Firestore financial persistence;
- remote Go financial APIs;
- GitHub;
- Vercel application storage.

The browser holds decrypted state only while the vault is unlocked.

## Vault lifecycle

`text
LOCKED
  ↓
vault file + password
  ↓
decrypt
  ↓
ACTIVE IN-MEMORY WORKSPACE
  ↓
save → encrypt/export
  ↓
lock / 15-minute inactivity
  ↓
clear active state
  ↓
LOCKED
`

## Go/WASM boundary

Go remains part of the product as a local computation engine.

It receives in-memory calculation input and returns calculation results. It does not receive financial data through a remote HTTP service.

The browser-facing loader may fetch the local WASM binary from `/wasm/financial-engine.wasm⟧. This is resource loading, not financial-data transport.

## Domain rules

The domain/Go calculation layer owns financial meaning and invariants.

Core concepts include:
- Money;
- Account;
- Transaction;
- Category;
- Budget;
- SavingsGoal;
- Debt;
- Asset;
- Liability;
- EducationContext;
- Net Worth.

Rules:
- Money uses integer minor units plus currency.
- Transactions are authoritative for ledger-derived values.
- Transfers are not budget expenses.
- Savings contributions are goal progress.
- Only debt principal reduces debt balance.
- Net worth = assets − liabilities.

## Legacy architecture

The repository still contains the original Go REST/HTTP + Firebase/Firestore architecture.

That architecture is preserved for historical traceability. It is not the active financial-data source of truth.

## Deployment boundary

Active:

**GitHub main → Vercel Hobby → React/Vite PWA → encrypted local Financial Vault**

Historical cloud deployment material is not an active prerequisite.

## Dependency rule

Presentation → application/domain logic.

Persistence and platform adapters must not redefine financial meaning.

For current work, the encrypted Vault is the persistence boundary and Go/WASM is the local calculation boundary.

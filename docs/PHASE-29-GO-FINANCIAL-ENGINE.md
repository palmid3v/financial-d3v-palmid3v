# FASE 29 — Go Financial Engine / Local Computation Boundary

**Status:** BUILT / VALIDATION PENDING  
**Date:** 2026-10-05

## Objective

Keep financial computation in Go without reintroducing a remote backend or sending plaintext financial data to a server.

## Architecture

```
Encrypted FDV1 file
      ↓
Browser decrypts
      ↓
Active in-memory vault
      ↓
Go Financial Engine (WASM)
      ↓
Calculated result
      ↓
React UI
```

The Go engine is a pure computation boundary. It has no Firebase dependency, no HTTP client, no Firestore dependency, and no network access.

## Implemented calculations

- cash flow;
- account balances;
- transfer effects;
- budget actuals;
- savings progress;
- debt principal reduction;
- net worth.

Money remains represented as integer minor units plus currency.

## WASM interface

The browser-facing module is:

`frontend/src/vault/goEngine.js`

It loads:

- `/wasm/wasm_exec.js`
- `/wasm/financial-engine.wasm`

and calls:

`FinancialEngine.calculate(JSON.stringify(request))`

The WASM adapter accepts only in-memory JSON and returns calculated JSON. The vault file/password never crosses a network boundary.

## Build

From the repository root on Windows:

```powershell
.scriptsuild-financial-engine-wasm.ps1
```

Equivalent:

```powershell
$env:GOOS="js"
$env:GOARCH="wasm"
go build -trimpath -o frontend/public/wasm/financial-engine.wasm ./cmd/financial-engine-wasm
```

The build script copies Go's matching `wasm_exec.js` from GOROOT so the browser runtime stays aligned with the installed Go version.

## Validation gate

- [ ] `go test ./...`
- [ ] `go build ./...`
- [ ] Build WASM artifact
- [ ] Load WASM from Vault mode
- [ ] Compare selected Go results with existing JS calculations
- [ ] Confirm no network dependency
- [ ] Confirm no plaintext financial persistence
- [ ] User approval

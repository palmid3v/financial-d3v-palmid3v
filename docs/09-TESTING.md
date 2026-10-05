# Testing — Financial-D3v

**Status:** CURRENT VALIDATION BASELINE  
**Last updated:** 2026-10-05  
**Timezone:** America/Bogota (COT, UTC-05:00)

## Validation layers

Financial-D3v validates in this order:

1. Automated tests.
2. Production build.
3. WASM build.
4. Security source audit.
5. Go tests/build.
6. Runtime validation.
7. Functional/security review.

## Current automated coverage

The frontend runner executes:

- Financial Vault round trip;
- incorrect password;
- modified ciphertext;
- unsupported version;
- malformed input;
- account balance/transfer derivation;
- budget actuals;
- savings progress;
- debt principal-only reduction;
- net worth including debt liabilities.

Latest observed result: **10/10 frontend tests PASS**.

Go validation:
- `go test ./...` PASS;
- `go build ./...` PASS.

Frontend:
- `npm ci` PASS;
- `npm run build` PASS;
- `npm run build:wasm` PASS.

## Security validation

`scripts/security-audit.ps1` validates the Vault source boundary for forbidden browser persistence/network APIs and checks key Vault lifecycle/crypto markers.

## Runtime

Long-running runtime checks are manual:

```powershell
cd frontend
npm run preview
```

FASE 31 runtime validation included Vault creation/save/open, incorrect-password rejection, lock/unlock and recovery/import.

## Testing rule

A phase is not considered validated from code existence alone. Record the observed command output and runtime result.

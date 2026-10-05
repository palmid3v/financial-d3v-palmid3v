# Validation Runner

## Purpose

Financial-D3v uses a repository-local PowerShell validation runner so the Palmi → Nexsy workflow does not depend on manually remembering every command required by the current phase.

Run from the repository root:

```powershell
.\scripts\validate.ps1
```

## Design rule

The runner is **capability-driven**, not a permanently hard-coded checklist.

It detects:

- `frontend/package.json`
- `package-lock.json`
- available npm scripts
- `go.mod`
- the Go executable

The runner currently executes every supported validation that exists in the checkout:

1. `npm ci` when `frontend/package-lock.json` exists.
2. `npm run test` when the script exists.
3. `npm run build` when the script exists.
4. `npm run build:wasm` when the script exists.
5. `go test ./...` when `go.mod` and Go are available.
6. `go build ./...` when `go.mod` and Go are available.

If a future phase adds, removes, or changes validation commands, update `scripts/validate.ps1` and this document together.

## Manual runtime validation

`npm run preview` is intentionally **not** started automatically because it is a long-running server process.

After automated validation completes:

```powershell
cd frontend
npm run preview
```

Then perform the runtime checks required by the current phase and report the exact output to Nexsy.

## Failure behavior

The runner stops on the first failed automated check. A failure is not converted into a false success.

The final project state must distinguish:

- automated validation passed;
- runtime/manual validation passed;
- validation pending.

## Workflow

```text
Nexsy implements
      ↓
GitHub main updated
      ↓
Palmi git pull
      ↓
.\scripts\validate.ps1
      ↓
Automated validation
      ↓
Manual runtime validation
      ↓
Palmi reports exact result
      ↓
Nexsy diagnoses/fixes
```

This runner is part of the project's validation infrastructure and should evolve with the architecture.

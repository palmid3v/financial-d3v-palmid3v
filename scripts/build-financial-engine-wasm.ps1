$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$frontendPublic = Join-Path $root "frontend/public/wasm"
$goRoot = go env GOROOT
$wasmExec = Join-Path $goRoot "lib/wasm/wasm_exec.js"
if (-not (Test-Path $wasmExec)) {
  throw "Go wasm_exec.js not found at $wasmExec"
}

New-Item -ItemType Directory -Force $frontendPublic | Out-Null
Copy-Item $wasmExec (Join-Path $frontendPublic "wasm_exec.js") -Force

$env:GOOS = "js"
$env:GOARCH = "wasm"
go build -trimpath -o (Join-Path $frontendPublic "financial-engine.wasm") ./cmd/financial-engine-wasm

Write-Host "Financial-D3v Go engine WASM built in frontend/public/wasm"

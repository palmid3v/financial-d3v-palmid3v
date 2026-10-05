$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$vaultRoot = Join-Path $repoRoot "frontend/src/vault"

Write-Host "========================================"
Write-Host " FINANCIAL-D3V SECURITY AUDIT"
Write-Host "========================================"
Write-Host "Vault source: $vaultRoot"
Write-Host ""

if (-not (Test-Path $vaultRoot)) { throw "Vault source directory not found: $vaultRoot" }

$files = Get-ChildItem -Path $vaultRoot -Recurse -File | Where-Object { $_.Extension -in @('.js', '.jsx', '.ts', '.tsx') }
if (-not $files) { throw "No vault source files found." }

$forbiddenPatterns = @(
  "localStorage",
  "sessionStorage",
  "indexedDB",
  "navigator\\.sendBeacon",
  "XMLHttpRequest",
  "\\bfetch\\s*\\("
)

$violations = @()
foreach ($file in $files) {
  $content = Get-Content -Raw -LiteralPath $file.FullName
  foreach ($pattern in $forbiddenPatterns) {
    if ($content -match $pattern) { $violations += "$($file.FullName): forbidden pattern '$pattern'" }
  }
}

if ($violations.Count -gt 0) {
  $violations | ForEach-Object { Write-Host "[FAIL] $_" }
  throw "Vault security audit failed."
}

$contextPath = Join-Path $vaultRoot "VaultContext.jsx"
$cryptoPath = Join-Path $vaultRoot "crypto.js"
foreach ($required in @($contextPath, $cryptoPath)) {
  if (-not (Test-Path $required)) { throw "Required security boundary file missing: $required" }
}

$context = Get-Content -Raw -LiteralPath $contextPath
$crypto = Get-Content -Raw -LiteralPath $cryptoPath

$requiredContextPatterns = @(
  "passwordRef\\.current = null",
  "setVault\\(null\\)",
  "VAULT_AUTO_LOCK_MS"
)
foreach ($pattern in $requiredContextPatterns) {
  if ($context -notmatch $pattern) { throw "VaultContext security control missing: $pattern" }
}

$requiredCryptoPatterns = @(
  "PBKDF2",
  "AES-GCM",
  "600000",
  "crypto\\.getRandomValues",
  "tagLength: TAG_BITS"
)
foreach ($pattern in $requiredCryptoPatterns) {
  if ($crypto -notmatch $pattern) { throw "Crypto control missing: $pattern" }
}

Write-Host "[PASS] No browser persistence or network APIs detected in vault source."
Write-Host "[PASS] Lock/password clearing controls detected."
Write-Host "[PASS] Auto-lock control detected."
Write-Host "[PASS] PBKDF2/AES-GCM crypto controls detected."
Write-Host ""
Write-Host "STATUS: SECURITY SOURCE AUDIT PASSED"
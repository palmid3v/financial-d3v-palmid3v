# Financial-D3v validation runner
# Run from the repository root:
#   .\scripts\validate.ps1
#
# This runner is intentionally capability-driven. It detects the commands
# available in the current checkout instead of assuming a fixed execution order.

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

$Results = New-Object System.Collections.Generic.List[object]

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Run-Check([string]$Name, [scriptblock]$Action) {
    Write-Step $Name
    $started = Get-Date
    try {
        & $Action
        $duration = (Get-Date) - $started
        $Results.Add([pscustomobject]@{ Name = $Name; Status = "PASS"; Duration = $duration })
        Write-Host "[PASS] $Name" -ForegroundColor Green
    }
    catch {
        $duration = (Get-Date) - $started
        $Results.Add([pscustomobject]@{ Name = $Name; Status = "FAIL"; Duration = $duration })
        Write-Host "[FAIL] $Name" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        throw
    }
}

function Has-NpmScript([string]$ScriptName) {
    $packageJson = Join-Path $RepoRoot "frontend\package.json"
    if (-not (Test-Path $packageJson)) { return $false }

    $package = Get-Content $packageJson -Raw | ConvertFrom-Json
    return $null -ne $package.scripts -and ($package.scripts.PSObject.Properties.Name -contains $ScriptName)
}

Write-Host "========================================" -ForegroundColor White
Write-Host " FINANCIAL-D3V VALIDATION RUNNER" -ForegroundColor White
Write-Host "========================================" -ForegroundColor White
Write-Host "Repository: $RepoRoot"
Write-Host ""

# Frontend validation
$frontend = Join-Path $RepoRoot "frontend"
$packageJson = Join-Path $frontend "package.json"

if (Test-Path $packageJson) {
    Set-Location $frontend

    if (Test-Path "package-lock.json") {
        Run-Check "Frontend dependencies (npm ci)" {
            npm ci
            if ($LASTEXITCODE -ne 0) { throw "npm ci failed with exit code $LASTEXITCODE." }
        }
    }
    else {
        Write-Host "[SKIP] npm ci - package-lock.json not found." -ForegroundColor Yellow
    }

    foreach ($scriptName in @("test", "build", "build:wasm")) {
        if (Has-NpmScript $scriptName) {
            Run-Check "Frontend npm run $scriptName" {
                npm run $scriptName
                if ($LASTEXITCODE -ne 0) { throw "npm run $scriptName failed with exit code $LASTEXITCODE." }
            }
        }
        else {
            Write-Host "[SKIP] npm run $scriptName - script not defined." -ForegroundColor Yellow
        }
    }

    Set-Location $RepoRoot
}
else {
    Write-Host "[SKIP] Frontend - frontend/package.json not found." -ForegroundColor Yellow
}

# Security source validation
$securityAudit = Join-Path $RepoRoot "scripts\security-audit.ps1"
if (Test-Path $securityAudit) {
    Run-Check "Vault security source audit" {
        powershell -ExecutionPolicy Bypass -File $securityAudit
        if ($LASTEXITCODE -ne 0) { throw "Vault security source audit failed with exit code $LASTEXITCODE." }
    }
}
else {
    Write-Host "[SKIP] Vault security source audit - scripts/security-audit.ps1 not found." -ForegroundColor Yellow
}

# Go validation
$goMod = Join-Path $RepoRoot "go.mod"
if (Test-Path $goMod) {
    if (Get-Command go -ErrorAction SilentlyContinue) {
        Run-Check "Go tests" {
            go test ./...
            if ($LASTEXITCODE -ne 0) { throw "go test ./... failed with exit code $LASTEXITCODE." }
        }

        Run-Check "Go build" {
            go build ./...
            if ($LASTEXITCODE -ne 0) { throw "go build ./... failed with exit code $LASTEXITCODE." }
        }
    }
    else {
        Write-Host "[SKIP] Go validation - Go executable not found in PATH." -ForegroundColor Yellow
    }
}
else {
    Write-Host "[SKIP] Go validation - go.mod not found." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor White
Write-Host " AUTOMATED VALIDATION SUMMARY" -ForegroundColor White
Write-Host "========================================" -ForegroundColor White

$Results | Format-Table -AutoSize

Write-Host ""
Write-Host "MANUAL VALIDATION" -ForegroundColor Yellow
Write-Host "-----------------"
Write-Host "If the app has a preview script, run it manually:"
Write-Host "  cd frontend"
Write-Host "  npm run preview"
Write-Host ""
Write-Host "Then validate the runtime flows required by the current phase"
Write-Host "(Vault, lock/unlock, PWA, dashboard, UX/security, etc.)."
Write-Host ""
Write-Host "STATUS: AUTOMATED VALIDATION COMPLETED" -ForegroundColor Green
Write-Host "STATUS: RUNTIME VALIDATION REMAINS MANUAL" -ForegroundColor Yellow

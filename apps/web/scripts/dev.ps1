<#
.SYNOPSIS
  Inicia entorno de desarrollo local con API (D1) + Vite hot-reload.
  Debe ejecutarse desde apps/web/scripts/ del cliente.

.PARAMETER SkipBuild
  Omite npm run build.

.PARAMETER SkipMigrations
  Omite migraciones (client.sql + audit.sql).

.PARAMETER ProjectDir
  Ruta al directorio apps/web del cliente. Se auto-detecta si se llama
  desde el script delegado del cliente.
#>

param(
  [switch]$SkipBuild,
  [switch]$SkipMigrations,
  [string]$ProjectDir = (Split-Path -Parent (Split-Path -Parent $PSCommandPath))
)

$ErrorActionPreference = "Stop"

# --- Rutas ---
$wranglerToml = Join-Path $ProjectDir "wrangler.toml"
$dbDir        = [System.IO.Path]::Combine($ProjectDir, "db")
$distDir      = Join-Path $ProjectDir "dist"
$stateDir     = [System.IO.Path]::Combine($ProjectDir, ".wrangler", "state")
$clientName   = (Get-Item $ProjectDir).Parent.Parent.Name

# --- Detectar database_name desde wrangler.toml ---
function Get-DbName {
  if (-not (Test-Path $wranglerToml)) { return "local_dev" }
  $content = Get-Content -Path $wranglerToml -Raw
  if ($content -match 'database_name\s*=\s*"([^"]+)"') { return $matches[1] }
  return "local_dev"
}
$dbName = Get-DbName

# --- Encabezado ---
Write-Host "========================" -ForegroundColor Cyan
Write-Host "  NEXO Dev Environment" -ForegroundColor Cyan
Write-Host "  Cliente: $clientName" -ForegroundColor Cyan
Write-Host "  DB:      $dbName" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# --- Matar procesos anteriores en puerto 8788 ---
Write-Host "[OK] Liberando puerto 8788..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 8788 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }

# --- Build ---
if (-not $SkipBuild) {
  Write-Host "[OK] Construyendo frontend..." -ForegroundColor Cyan
  Set-Location $ProjectDir
  npx vite build
  if (-not $?) { throw "Build fallo" }
}

# --- Migraciones (client.sql + audit.sql) ---
if (-not $SkipMigrations -and (Test-Path $dbDir)) {
  Write-Host "[OK] Migraciones D1..." -ForegroundColor Cyan

  $clientSql = Join-Path $dbDir "client.sql"
  $auditSql  = Join-Path $dbDir "audit.sql"

  if (Test-Path $clientSql) {
    Write-Host "  > client.sql (DB operativa)"
    npx wrangler d1 execute $dbName --local --file="$clientSql"
  }

  if (Test-Path $auditSql) {
    Write-Host "  > audit.sql (DB auditoría)"
    npx wrangler d1 execute $dbName --local --file="$auditSql"
  }
}

# --- Arrancar Wrangler (API en :8788) ---
Write-Host "[OK] Arrancando API en :8788..." -ForegroundColor Green
Set-Location $ProjectDir
$job = Start-Process -PassThru -NoNewWindow cmd.exe "/c npx.cmd wrangler pages dev ./dist --d1 DB=$dbName --port 8788 --persist-to `"$stateDir`""
Start-Sleep -Seconds 3

# --- Arrancar Vite (Frontend en :5173) ---
Write-Host "[OK] Arrancando Vite en :5173..." -ForegroundColor Green
Write-Host ""
Write-Host "  http://localhost:5173  (frontend)" -ForegroundColor White
Write-Host "  http://localhost:8788  (api)" -ForegroundColor White
Write-Host ""

try {
  Set-Location $ProjectDir
  npx vite
} finally {
  Write-Host "[OK] Deteniendo servicios..." -ForegroundColor Yellow
  if ($job -and (Get-Process -Id $job.Id -ErrorAction SilentlyContinue)) {
    Stop-Process -Id $job.Id -Force -ErrorAction SilentlyContinue
  }
  Write-Host "[OK] Dev environment detenido" -ForegroundColor Green
}

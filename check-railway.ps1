# Script de verificación para Railway en Windows
# Ejecutar con: .\check-railway.ps1

Write-Host "🔍 Verificando configuración para Railway..." -ForegroundColor Cyan
Write-Host ""

# Archivos requeridos
$requiredFiles = @(
    "Dockerfile",
    ".dockerignore", 
    "railway.toml",
    "package.json",
    "src\index.js",
    "src\app.js",
    "src\config.js"
)

# Archivos opcionales
$optionalFiles = @(
    "RAILWAY_DEPLOY.md",
    "railway-check.js"
)

$allGood = $true

# Verificar archivos requeridos
Write-Host "📋 Archivos requeridos:" -ForegroundColor Yellow
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - REQUERIDO" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

# Verificar archivos opcionales
Write-Host "📋 Archivos opcionales:" -ForegroundColor Yellow
foreach ($file in $optionalFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $file - Recomendado" -ForegroundColor Yellow
    }
}

Write-Host ""

# Verificar package.json
Write-Host "📦 Verificando package.json..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    try {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        
        if ($packageJson.scripts.start) {
            Write-Host "✅ Script 'start' definido: $($packageJson.scripts.start)" -ForegroundColor Green
        } else {
            Write-Host "❌ Script 'start' no encontrado" -ForegroundColor Red
            $allGood = $false
        }
        
        if ($packageJson.type -eq "module") {
            Write-Host "✅ Configurado como ES Module" -ForegroundColor Green
        }
        
        # Verificar dependencias críticas
        $criticalDeps = @("express", "pg", "socket.io")
        foreach ($dep in $criticalDeps) {
            if ($packageJson.dependencies.$dep) {
                Write-Host "✅ Dependencia $dep`: $($packageJson.dependencies.$dep)" -ForegroundColor Green
            } else {
                Write-Host "❌ Dependencia $dep no encontrada" -ForegroundColor Red
                $allGood = $false
            }
        }
    } catch {
        Write-Host "❌ Error leyendo package.json: $($_.Exception.Message)" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "❌ package.json no encontrado" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# Verificar health check endpoint
Write-Host "🏥 Verificando health check..." -ForegroundColor Yellow
if (Test-Path "src\app.js") {
    $appContent = Get-Content "src\app.js" -Raw
    if ($appContent -match "/api/health") {
        Write-Host "✅ Endpoint /api/health encontrado" -ForegroundColor Green
    } else {
        Write-Host "❌ Endpoint /api/health no encontrado" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "❌ src\app.js no encontrado" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
Write-Host "=" * 50

# Resultado final
if ($allGood) {
    Write-Host "🚀 ¡Listo para desplegar en Railway!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Cyan
    Write-Host "1. Sube el código a GitHub" -ForegroundColor White
    Write-Host "2. Ve a railway.app e inicia sesión" -ForegroundColor White
    Write-Host "3. Crea nuevo proyecto desde GitHub repo" -ForegroundColor White
    Write-Host "4. Agrega servicio PostgreSQL" -ForegroundColor White
    Write-Host "5. ¡Deploy automático!" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Lee RAILWAY_DEPLOY.md para instrucciones detalladas" -ForegroundColor Cyan
} else {
    Write-Host "❌ Faltan archivos o configuraciones requeridas" -ForegroundColor Red
    Write-Host "Revisa los elementos marcados con ❌ antes de desplegar" -ForegroundColor Yellow
}

Write-Host "" 
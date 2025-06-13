# Script para solucionar problemas de build de Docker
# Ejecutar con: .\fix-docker-build.ps1

Write-Host "🔧 Solucionando problemas de build de Docker..." -ForegroundColor Cyan
Write-Host ""

# Paso 1: Limpiar dependencias
Write-Host "1️⃣ Limpiando dependencias existentes..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✅ node_modules eliminado" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "✅ package-lock.json eliminado" -ForegroundColor Green
}

Write-Host ""

# Paso 2: Reinstalar dependencias
Write-Host "2️⃣ Reinstalando dependencias..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error instalando dependencias: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Paso 3: Verificar package.json
Write-Host "3️⃣ Verificando package.json..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    Write-Host "✅ package.json válido" -ForegroundColor Green
    Write-Host "   Nombre: $($packageJson.name)" -ForegroundColor Gray
    Write-Host "   Versión: $($packageJson.version)" -ForegroundColor Gray
} else {
    Write-Host "❌ package.json no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Paso 4: Opciones de build
Write-Host "4️⃣ Opciones de build disponibles:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opción A - Build con Dockerfile original (recomendado):" -ForegroundColor Cyan
Write-Host "docker build -t cft-powershell ." -ForegroundColor White
Write-Host ""
Write-Host "Opción B - Build con Dockerfile alternativo (si A falla):" -ForegroundColor Cyan
Write-Host "docker build -f Dockerfile.alternative -t cft-powershell ." -ForegroundColor White
Write-Host ""
Write-Host "Opción C - Build sin cache (si hay problemas persistentes):" -ForegroundColor Cyan
Write-Host "docker build --no-cache -t cft-powershell ." -ForegroundColor White
Write-Host ""

# Paso 5: Verificar Docker
Write-Host "5️⃣ Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker disponible: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está disponible o no está ejecutándose" -ForegroundColor Red
    Write-Host "   Asegúrate de que Docker Desktop esté ejecutándose" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🚀 ¡Listo para intentar el build!" -ForegroundColor Green
Write-Host ""
Write-Host "Comando recomendado:" -ForegroundColor Cyan
Write-Host "docker build -t cft-powershell ." -ForegroundColor White
Write-Host ""
Write-Host "Si el build falla, intenta:" -ForegroundColor Yellow
Write-Host "docker build -f Dockerfile.alternative -t cft-powershell ." -ForegroundColor White 
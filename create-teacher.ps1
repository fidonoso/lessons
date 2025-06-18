# Script para crear un profesor en Railway
# Ejecutar con: .\create-teacher.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$RailwayUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$Name = "Fernando",

    [Parameter(Mandatory=$false)]
    [string]$LastName = "Donoso",
    
    [Parameter(Mandatory=$false)]
    [string]$Email = "fidonoso@gmail.com",
    
    [Parameter(Mandatory=$false)]
    [string]$Password = "191107Ft#"
)

Write-Host "👨‍🏫 Creando profesor en Railway..." -ForegroundColor Cyan
Write-Host ""

# Validar URL
if (-not $RailwayUrl.StartsWith("https://")) {
    Write-Host "❌ La URL debe comenzar con https://" -ForegroundColor Red
    Write-Host "Ejemplo: https://tu-app.railway.app" -ForegroundColor Yellow
    exit 1
}

# Datos del profesor
$teacherData = @{
    firstName = $Name
    lastName = $LastName
    email = $Email
    password = $Password
} | ConvertTo-Json

Write-Host "📋 Datos del profesor:" -ForegroundColor Yellow
Write-Host "   Nombre: $Name" -ForegroundColor White
Write-Host "   Nombre: $LastName" -ForegroundColor White
Write-Host "   Email: $Email" -ForegroundColor White
Write-Host "   Password: $Password" -ForegroundColor White
Write-Host ""

try {
    # Crear profesor
    Write-Host "🚀 Enviando solicitud de registro..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "$RailwayUrl/api/teacher/register" `
                                  -Method POST `
                                  -Body $teacherData `
                                  -ContentType "application/json" `
                                  -ErrorAction Stop
    
    Write-Host "✅ ¡Profesor creado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Información del profesor:" -ForegroundColor Cyan
    Write-Host "   ID: $($response.message)" -ForegroundColor White
    # Write-Host "   Nombre: $($response.teacher.name)" -ForegroundColor White
    # Write-Host "   Email: $($response.teacher.email)" -ForegroundColor White
    Write-Host ""
    Write-Host "🔑 Credenciales de acceso:" -ForegroundColor Yellow
    Write-Host "   Email: $Email" -ForegroundColor White
    Write-Host "   Password: $Password" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 URLs importantes:" -ForegroundColor Cyan
    Write-Host "   Dashboard: $RailwayUrl/teacher-dashboard.html" -ForegroundColor White
    Write-Host "   Login API: $RailwayUrl/api/teacher/login" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 Próximos pasos:" -ForegroundColor Green
    Write-Host "1. Ve al dashboard: $RailwayUrl/teacher-dashboard.html" -ForegroundColor White
    Write-Host "2. Inicia sesión con las credenciales mostradas arriba" -ForegroundColor White
    Write-Host "3. ¡Comienza a monitorear a tus estudiantes!" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error creando profesor:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Código de estado: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 409) {
            Write-Host ""
            Write-Host "💡 El profesor ya existe. Intenta hacer login:" -ForegroundColor Yellow
            Write-Host "   URL: $RailwayUrl/teacher-dashboard.html" -ForegroundColor White
            Write-Host "   Email: $Email" -ForegroundColor White
        }
    }
    
    Write-Host ""
    Write-Host "🔧 Soluciones posibles:" -ForegroundColor Yellow
    Write-Host "1. Verifica que la URL de Railway sea correcta" -ForegroundColor White
    Write-Host "2. Asegúrate de que la aplicación esté ejecutándose" -ForegroundColor White
    Write-Host "3. Verifica la conexión a la base de datos" -ForegroundColor White
    Write-Host "4. Revisa los logs en Railway dashboard" -ForegroundColor White
}

Write-Host "" 
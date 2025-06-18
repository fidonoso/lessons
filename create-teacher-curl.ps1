# Script alternativo usando curl para crear profesor
# Ejecutar con: .\create-teacher-curl.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$RailwayUrl
)

Write-Host "👨‍🏫 Creando profesor usando curl..." -ForegroundColor Cyan
Write-Host ""

# Datos del profesor
$name = "Fernando"
$lastname = "Donoso"
$email = "fidonoso@gmail.com"
$password = "191107Ft#"

Write-Host "📋 Datos del profesor:" -ForegroundColor Yellow
Write-Host "   Nombre: $name" -ForegroundColor White
Write-Host "   Apellido: $lastname" -ForegroundColor White
Write-Host "   Email: $email" -ForegroundColor White
Write-Host "   Password: $password" -ForegroundColor White
Write-Host ""

# JSON data
$jsonData = @"
{
    "firstName": "$name",
    "lastName": "$lastname",
    "email": "$email",
    "password": "$password"
}
"@

Write-Host "🚀 Comando curl generado:" -ForegroundColor Yellow
Write-Host ""
$curlCommand = "curl -X POST `"$RailwayUrl/api/teacher/register`" -H `"Content-Type: application/json`" -d '$jsonData'"
Write-Host $curlCommand -ForegroundColor Green
Write-Host ""

Write-Host "📋 También puedes usar este comando en cualquier terminal:" -ForegroundColor Cyan
Write-Host ""
Write-Host "curl -X POST \`"$RailwayUrl/api/teacher/register\`" \" -ForegroundColor White
Write-Host "     -H \`"Content-Type: application/json\`" \" -ForegroundColor White
Write-Host "     -d '{" -ForegroundColor White
Write-Host "       \`"name\`": \`"$name\`"," -ForegroundColor White
Write-Host "       \`"email\`": \`"$email\`"," -ForegroundColor White
Write-Host "       \`"password\`": \`"$password\`"" -ForegroundColor White
Write-Host "     }'" -ForegroundColor White
Write-Host ""

Write-Host "🌐 URLs importantes:" -ForegroundColor Cyan
Write-Host "   Dashboard: $RailwayUrl/teacher-dashboard.html" -ForegroundColor White
Write-Host "   API Health: $RailwayUrl/api/health" -ForegroundColor White
Write-Host "" 
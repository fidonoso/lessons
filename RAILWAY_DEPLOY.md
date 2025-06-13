# 🚀 Guía de Despliegue en Railway

Este documento describe cómo desplegar el Portal Educativo de PowerShell CFT en Railway.

## 📋 Prerrequisitos

1. Cuenta en [Railway.app](https://railway.app)
2. Repositorio Git con el código
3. Base de datos PostgreSQL (Railway puede proveerla)

## 🏗️ Pasos de Despliegue

### 1. Preparar el Repositorio

Asegúrate de que estos archivos estén en la raíz del proyecto:
- `Dockerfile` ✅
- `.dockerignore` ✅ 
- `railway.toml` ✅

### 2. Conectar a Railway

1. Ve a [railway.app](https://railway.app) e inicia sesión
2. Haz clic en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Autoriza Railway a acceder a tu repositorio
5. Selecciona el repositorio del proyecto

### 3. Configurar Base de Datos PostgreSQL

1. En tu proyecto de Railway, haz clic en "Add Service"
2. Selecciona "Database" → "PostgreSQL"
3. Railway automáticamente creará las variables de entorno

### 4. Variables de Entorno

Railway configurará automáticamente:
```bash
# Variables que Railway maneja automáticamente
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://...
POSTGRES_HOST=...
POSTGRES_PORT=5432
POSTGRES_DB=...
POSTGRES_USER=...
POSTGRES_PASSWORD=...
```

### 5. Configuración Adicional (Opcional)

Si necesitas variables personalizadas, agrégalas en Railway:
- Ve a tu servicio → "Variables"
- Agrega las variables necesarias

## 🔍 Verificación del Despliegue

### Health Check
Railway verificará automáticamente: `https://tu-app.railway.app/api/health`

### URLs Principales
- **Inicio**: `https://tu-app.railway.app/`
- **PowerShell Class**: `https://tu-app.railway.app/powershell`
- **API Health**: `https://tu-app.railway.app/api/health`
- **Teacher Dashboard**: `https://tu-app.railway.app/teacher-dashboard.html`

## 🐛 Troubleshooting

### Error de Conexión a Base de Datos
```bash
# Verifica las variables de entorno en Railway
DATABASE_URL debe estar configurada
```

### Error de Puerto
```bash
# Railway asigna PORT automáticamente
# No necesitas configurar PORT manualmente
```

### Error de Health Check
```bash
# Verifica que el endpoint /api/health esté funcionando
curl https://tu-app.railway.app/api/health
```

### Logs de la Aplicación
1. Ve a tu proyecto en Railway
2. Selecciona tu servicio
3. Ve a la pestaña "Logs"

## 📊 Monitoreo

### Métricas Disponibles
- CPU y memoria en Railway dashboard
- Logs en tiempo real
- Health checks automáticos

### Socket.io
- Railway soporta WebSockets automáticamente
- No requiere configuración adicional

## 🔧 Comandos Útiles

### Redeploy Manual
```bash
# En Railway dashboard, haz clic en "Deploy"
# O push a tu rama principal para auto-deploy
```

### Ver Logs
```bash
# Usa Railway CLI (opcional)
railway logs
```

### Variables de Entorno Local
```bash
# Para desarrollo local, crea .env
cp .env.example .env
# Edita .env con tus variables locales
```

## 🌐 Dominios Personalizados

1. En Railway dashboard → tu servicio
2. Ve a "Settings" → "Domains"
3. Agrega tu dominio personalizado
4. Configura los DNS según las instrucciones

## 🔐 Seguridad

### Variables Sensibles
- Nunca commits variables sensibles al repositorio
- Usa Railway Variables para datos sensibles
- El Dockerfile ya está configurado para producción

### SSL/TLS
- Railway provee HTTPS automáticamente
- Certificados SSL incluidos

## 📝 Notas Importantes

1. **Build Time**: ~2-5 minutos la primera vez
2. **Auto-deploy**: Se activa con cada push a main/master
3. **Escalado**: Railway maneja el escalado automáticamente
4. **Backup**: Configura backups para la base de datos

## 🎯 URLs de Ejemplo

Reemplaza `tu-app` con tu dominio real de Railway:

- Portal principal: `https://tu-app.railway.app`
- Lección PowerShell: `https://tu-app.railway.app/lessons/cyberhack.html`
- API status: `https://tu-app.railway.app/api/health`
- Dashboard profesor: `https://tu-app.railway.app/teacher-dashboard.html`

## 🔄 Actualizaciones

Para actualizar la aplicación:
1. Push cambios a tu repositorio
2. Railway detectará automáticamente los cambios
3. Iniciará un nuevo build y deploy

¡Tu Portal Educativo de PowerShell estará listo para usar! 🎓⚡ 
# Usar imagen oficial de Node.js LTS (Long Term Support)
FROM node:18-alpine

# Establecer información del mantenedor
LABEL maintainer="Fernando Donoso - CFT Valparaíso"
LABEL description="Portal educativo de PowerShell para ciberseguridad - CFT Valparaíso"

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    dumb-init \
    curl

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S cftapp -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (para optimizar cache de Docker)
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar el código fuente
COPY src/ ./src/

# Crear directorio de logs y temp
RUN mkdir -p /app/logs /app/temp && \
    chown -R cftapp:nodejs /app

# Cambiar al usuario no-root
USER cftapp

# Exponer el puerto (Railway asigna dinámicamente)
EXPOSE $PORT

# Variables de entorno para producción
ENV NODE_ENV=production
ENV NPM_CONFIG_CACHE=/tmp/.npm

# Healthcheck para Railway
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Usar dumb-init para manejo de señales
ENTRYPOINT ["dumb-init", "--"]

# Comando para iniciar la aplicación
CMD ["node", "src/index.js"] 
#!/usr/bin/env node

/**
 * Script de verificación para despliegue en Railway
 * Verifica que todos los archivos necesarios estén presentes
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const requiredFiles = [
    'Dockerfile',
    '.dockerignore',
    'railway.toml',
    'package.json',
    'src/index.js',
    'src/app.js',
    'src/config.js'
];

const optionalFiles = [
    '.env.example',
    'RAILWAY_DEPLOY.md'
];

console.log('🔍 Verificando configuración para Railway...\n');

// Verificar archivos requeridos
let allRequired = true;
requiredFiles.forEach(file => {
    if (existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - REQUERIDO`);
        allRequired = false;
    }
});

// Verificar archivos opcionales
console.log('\n📋 Archivos opcionales:');
optionalFiles.forEach(file => {
    if (existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`⚠️  ${file} - Recomendado`);
    }
});

// Verificar package.json
console.log('\n📦 Verificando package.json...');
try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts.start) {
        console.log('✅ Script "start" definido');
    } else {
        console.log('❌ Script "start" no encontrado');
        allRequired = false;
    }
    
    if (packageJson.type === 'module') {
        console.log('✅ Configurado como ES Module');
    } else {
        console.log('⚠️  No configurado como ES Module');
    }
    
    // Verificar dependencias críticas
    const criticalDeps = ['express', 'pg', 'socket.io'];
    criticalDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
            console.log(`✅ Dependencia ${dep}: ${packageJson.dependencies[dep]}`);
        } else {
            console.log(`❌ Dependencia ${dep} no encontrada`);
            allRequired = false;
        }
    });
    
} catch (error) {
    console.log('❌ Error leyendo package.json:', error.message);
    allRequired = false;
}

// Verificar endpoint de health
console.log('\n🏥 Verificando health check...');
try {
    const appContent = readFileSync('src/app.js', 'utf8');
    if (appContent.includes('/api/health')) {
        console.log('✅ Endpoint /api/health encontrado');
    } else {
        console.log('❌ Endpoint /api/health no encontrado');
        allRequired = false;
    }
} catch (error) {
    console.log('❌ Error leyendo src/app.js:', error.message);
    allRequired = false;
}

// Resultado final
console.log('\n' + '='.repeat(50));
if (allRequired) {
    console.log('🚀 ¡Listo para desplegar en Railway!');
    console.log('\nPróximos pasos:');
    console.log('1. Sube el código a GitHub');
    console.log('2. Conecta el repositorio a Railway');
    console.log('3. Agrega servicio PostgreSQL');
    console.log('4. ¡Deploy automático!');
    process.exit(0);
} else {
    console.log('❌ Faltan archivos o configuraciones requeridas');
    console.log('Revisa los elementos marcados con ❌ antes de desplegar');
    process.exit(1);
} 
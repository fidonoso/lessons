import { createServer } from 'http';
import app from './app.js';
import appConfig from './config.js';
import { networkInterfaces } from 'os';
import { testConnection, syncDatabase } from './database/connection.js';
import { initializeQuizData } from './models/index.js';
import { initializeSocket } from './socket/socketHandler.js';

// Función para obtener la IP local
const getLocalIP = () => {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
};

// Iniciar el servidor
const startServer = async () => {
    try {
        // Probar conexión a la base de datos
        await testConnection();
        
        // Sincronizar modelos con la base de datos
        await syncDatabase(false); // true = recrear tablas para aplicar cambios de schema
        
        // Inicializar datos del quiz
        await initializeQuizData();
        
        // Crear servidor HTTP
        const server = createServer(app);
        
        // Inicializar Socket.io
        const io = initializeSocket(server);
        console.log('🔌 Socket.io inicializado correctamente');
        
        const localIP = getLocalIP();
        
        server.listen(appConfig.port, '0.0.0.0', () => {
            console.log('🚀 Servidor iniciado exitosamente');
            console.log('========================================');
            console.log('📍 URL Local: http://localhost:' + appConfig.port);
            console.log('🌐 URL Red Local: http://' + localIP + ':' + appConfig.port);
            console.log('');
            console.log('🛡️  CLASE DE POWERSHELL DISPONIBLE EN:');
            console.log('   Local: http://localhost:' + appConfig.port + '/powershell');
            console.log('   Red:   http://' + localIP + ':' + appConfig.port + '/powershell');
            console.log('');
            console.log('🎯 SISTEMA DE QUIZ ACTIVADO');
            console.log('   Endpoint: /api/quiz/...');
            console.log('');
            console.log('👨‍🏫 SISTEMA DE PROFESORES DISPONIBLE:');
            console.log('   Crear profesor: POST /api/teacher/register');
            console.log('   Login: POST /api/teacher/login');
            console.log('   Dashboard: GET /api/teacher/dashboard');
            console.log('');
            console.log('🔌 SOCKET.IO ACTIVADO');
            console.log('   Tiempo real para profesores y estudiantes');
            console.log('');
            console.log('🌍 Entorno: ' + appConfig.nodeEnv);
            console.log('🕒 Fecha: ' + new Date().toLocaleString());
            console.log('========================================');
            console.log('💡 Comparte la URL de red con tus estudiantes');
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Manejo de cierre elegante del servidor
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM recibido. Cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT recibido. Cerrando servidor...');
    process.exit(0);
});

// Iniciar la aplicación
startServer();

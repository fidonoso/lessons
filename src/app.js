import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import appConfig from './config.js';
import quizRoutes from './routes/quizRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';

// Recrear __dirname y __filename para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear instancia de Express
const app = express();

// Middlewares
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'powerShell-cft-secret-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Cambiar a true en producción con HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Configurar archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas básicas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta específica para la clase de PowerShell
app.get('/powershell', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'lessons', 'powershell.html'));
});

app.use(lessonRoutes);

// Ruta alternativa para la clase de PowerShell
// app.get('/lessons/powershell', (req, res) => {
//     res.sendFile(path.join(__dirname, 'src', 'public', 'lessons', 'powershell.html'));
// });

// Ruta para el dashboard de profesores
app.get('/teacher/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teacher-dashboard.html'));
});

// Rutas de la API de Quiz
app.use('/api/quiz', quizRoutes);

// Rutas de la API de Profesores
app.use('/api/teacher', teacherRoutes);

// Ruta de ejemplo para API
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor funcionando correctamente',
        environment: appConfig.nodeEnv,
        timestamp: new Date().toISOString()
    });
});

// Middleware para manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        path: req.originalUrl 
    });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: appConfig.nodeEnv === 'development' ? err.message : 'Algo salió mal'
    });
});

export default app;

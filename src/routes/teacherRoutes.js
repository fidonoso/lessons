import express from 'express';
import { authController } from '../controllers/authController.js';
import { dashboardController } from '../controllers/dashboardController.js';
import { requireAuth, requireGuest, loadTeacher } from '../middleware/auth.js';

const router = express.Router();

// ==================== RUTAS DE AUTENTICACIÓN ====================

// Crear profesor (para Postman - sin autenticación)
router.post('/register', authController.createTeacher);

// Login de profesor
router.post('/login', requireGuest, authController.login);

// Logout de profesor
router.post('/logout', requireAuth, authController.logout);

// Verificar sesión
router.get('/session', loadTeacher, authController.checkSession);

// ==================== RUTAS DEL DASHBOARD ====================

// Todas las rutas del dashboard requieren autenticación
router.use(requireAuth);
router.use(loadTeacher);

// Dashboard principal
router.get('/dashboard', dashboardController.getDashboard);

// Análisis detallado de quiz específico
router.get('/dashboard/quiz/:quizId/analysis', dashboardController.getQuizAnalysis);

// Datos en tiempo real
router.get('/dashboard/realtime', dashboardController.getRealTimeData);

export default router; 
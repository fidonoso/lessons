import express from 'express';
import quizController from '../controllers/quizController.js';

const router = express.Router();

// Rutas para estudiantes
router.get('/quiz/:quizId', quizController.getQuiz);
router.post('/student/register', quizController.registerStudent);
router.get('/student/:studentId/quiz/:quizId/attempts', quizController.checkAttempts);
router.post('/attempt/start', quizController.startAttempt);
router.post('/attempt/submit', quizController.submitQuiz);
router.get('/attempt/:attemptId/results', quizController.getResults);

// Rutas para profesor (estadísticas)
router.get('/quiz/:quizId/stats', quizController.getStats);

export default router; 
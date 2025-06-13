import { Student, Quiz, QuizQuestion, QuizAttempt, QuizAnswer } from '../models/index.js';
import { Op } from 'sequelize';
import { emitToTeacher } from '../socket/socketHandler.js';

class QuizController {
    
    // Obtener información del quiz y sus preguntas
    async getQuiz(req, res) {
        try {
            const { quizId } = req.params;
            
            const quiz = await Quiz.findOne({
                where: { quizId },
                include: [{
                    model: QuizQuestion,
                    as: 'questions',
                    attributes: ['id', 'questionNumber', 'questionText', 'options', 'points'],
                    order: [['questionNumber', 'ASC']]
                }]
            });

            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz no encontrado'
                });
            }

            res.json({
                success: true,
                quiz: {
                    id: quiz.quizId,
                    title: quiz.title,
                    description: quiz.description,
                    timeLimit: quiz.timeLimit,
                    passingScore: quiz.passingScore,
                    maxAttempts: quiz.maxAttempts,
                    questions: quiz.questions
                }
            });

        } catch (error) {
            console.error('Error al obtener quiz:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Registrar o encontrar estudiante
    async registerStudent(req, res) {
        try {
            const { firstName, lastName } = req.body;

            if (!firstName || !lastName) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre y apellido son requeridos'
                });
            }

            // Buscar estudiante existente o crear nuevo
            const [student, created] = await Student.findOrCreate({
                where: {
                    firstName: firstName.trim(),
                    lastName: lastName.trim()
                },
                defaults: {
                    firstName: firstName.trim(),
                    lastName: lastName.trim()
                }
            });

            res.json({
                success: true,
                student: {
                    id: student.id,
                    firstName: student.firstName,
                    lastName: student.lastName
                },
                isNewStudent: created
            });

        } catch (error) {
            console.error('Error al registrar estudiante:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Verificar intentos restantes del estudiante
    async checkAttempts(req, res) {
        try {
            const { studentId, quizId } = req.params;

            const quiz = await Quiz.findOne({ where: { quizId } });
            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz no encontrado'
                });
            }

            const attempts = await QuizAttempt.findAll({
                where: {
                    studentId,
                    quizId
                },
                order: [['attemptNumber', 'DESC']]
            });

            const attemptsUsed = attempts.length;
            const attemptsRemaining = quiz.maxAttempts - attemptsUsed;
            const canAttempt = attemptsRemaining > 0;

            // Obtener mejor puntuación
            const bestScore = attempts.length > 0 
                ? Math.max(...attempts.map(a => a.score || 0))
                : 0;

            res.json({
                success: true,
                attemptsUsed,
                attemptsRemaining,
                maxAttempts: quiz.maxAttempts,
                canAttempt,
                bestScore,
                attempts: attempts.map(a => ({
                    attemptNumber: a.attemptNumber,
                    score: a.score,
                    passed: a.passed,
                    completedAt: a.completedAt
                }))
            });

        } catch (error) {
            console.error('Error al verificar intentos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Iniciar un nuevo intento de quiz
    async startAttempt(req, res) {
        try {
            const { studentId, quizId } = req.body;

            // Verificar que el quiz existe
            const quiz = await Quiz.findOne({ where: { quizId } });
            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz no encontrado'
                });
            }

            // Verificar intentos restantes
            const existingAttempts = await QuizAttempt.count({
                where: { studentId, quizId }
            });

            if (existingAttempts >= quiz.maxAttempts) {
                return res.status(400).json({
                    success: false,
                    message: 'Has alcanzado el número máximo de intentos'
                });
            }

            // Crear nuevo intento
            const attempt = await QuizAttempt.create({
                studentId,
                quizId,
                attemptNumber: existingAttempts + 1,
                startedAt: new Date()
            });

            // Obtener datos del estudiante para notificación
            const student = await Student.findByPk(studentId);
            
            // Notificar al profesor si el quiz tiene teacherId
            if (quiz.teacherId && student) {
                emitToTeacher(quiz.teacherId, 'student:quiz:started', {
                    student: `${student.firstName} ${student.lastName}`,
                    quiz: quiz.title,
                    attemptId: attempt.id,
                    timestamp: new Date()
                });
            }

            res.json({
                success: true,
                attempt: {
                    id: attempt.id,
                    attemptNumber: attempt.attemptNumber,
                    startedAt: attempt.startedAt
                }
            });

        } catch (error) {
            console.error('Error al iniciar intento:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Enviar respuestas del quiz
    async submitQuiz(req, res) {
        try {
            const { attemptId, answers, timeSpent } = req.body;

            // Verificar que el intento existe
            const attempt = await QuizAttempt.findByPk(attemptId);
            if (!attempt) {
                return res.status(404).json({
                    success: false,
                    message: 'Intento no encontrado'
                });
            }

            // Verificar que no esté ya completado
            if (attempt.completedAt) {
                return res.status(400).json({
                    success: false,
                    message: 'Este intento ya fue completado'
                });
            }

            // Obtener preguntas del quiz
            const questions = await QuizQuestion.findAll({
                where: { quizId: attempt.quizId },
                order: [['questionNumber', 'ASC']]
            });

            let totalPoints = 0;
            let earnedPoints = 0;
            const results = [];

            // Evaluar cada respuesta
            for (const question of questions) {
                totalPoints += question.points;
                
                const studentAnswer = answers.find(a => a.questionId === question.id);
                const isCorrect = studentAnswer && 
                    JSON.stringify(studentAnswer.answer) === JSON.stringify(question.correctAnswer);
                
                const pointsEarned = isCorrect ? question.points : 0;
                earnedPoints += pointsEarned;

                // Guardar respuesta individual
                await QuizAnswer.create({
                    attemptId: attempt.id,
                    questionId: question.id,
                    studentAnswer: studentAnswer ? studentAnswer.answer : null,
                    selectedAnswer: studentAnswer ? JSON.stringify(studentAnswer.answer) : null,
                    isCorrect,
                    pointsEarned
                });

                results.push({
                    questionId: question.id,
                    questionNumber: question.questionNumber,
                    questionText: question.questionText,
                    options: question.options,
                    correctAnswer: question.correctAnswer,
                    studentAnswer: studentAnswer ? studentAnswer.answer : null,
                    isCorrect,
                    pointsEarned,
                    explanation: question.explanation
                });
            }

            // Calcular puntuación final
            const score = Math.round((earnedPoints / totalPoints) * 100);
            const quiz = await Quiz.findOne({ where: { quizId: attempt.quizId } });
            const passed = score >= quiz.passingScore;

            // Actualizar intento
            await attempt.update({
                score,
                totalPoints,
                earnedPoints,
                passed,
                timeSpent,
                status: 'completed',
                completedAt: new Date()
            });

            // Obtener datos del estudiante para notificación
            const student = await Student.findByPk(attempt.studentId);
            
            // Notificar al profesor si el quiz tiene teacherId
            if (quiz.teacherId && student) {
                emitToTeacher(quiz.teacherId, 'student:quiz:completed', {
                    student: `${student.firstName} ${student.lastName}`,
                    quiz: quiz.title,
                    score,
                    totalQuestions: questions.length,
                    passed,
                    timestamp: new Date()
                });
            }

            res.json({
                success: true,
                results: {
                    score,
                    totalPoints,
                    earnedPoints,
                    passed,
                    passingScore: quiz.passingScore,
                    timeSpent,
                    questions: results
                }
            });

        } catch (error) {
            console.error('Error al enviar quiz:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener resultados de un intento específico
    async getResults(req, res) {
        try {
            const { attemptId } = req.params;

            const attempt = await QuizAttempt.findByPk(attemptId, {
                include: [
                    {
                        model: Student,
                        as: 'student'
                    },
                    {
                        model: Quiz,
                        as: 'quiz'
                    },
                    {
                        model: QuizAnswer,
                        as: 'answers',
                        include: [{
                            model: QuizQuestion,
                            as: 'question'
                        }]
                    }
                ]
            });

            if (!attempt) {
                return res.status(404).json({
                    success: false,
                    message: 'Resultados no encontrados'
                });
            }

            const results = attempt.answers.map(answer => ({
                questionNumber: answer.question.questionNumber,
                questionText: answer.question.questionText,
                options: answer.question.options,
                correctAnswer: answer.question.correctAnswer,
                studentAnswer: answer.studentAnswer,
                isCorrect: answer.isCorrect,
                pointsEarned: answer.pointsEarned,
                explanation: answer.question.explanation
            }));

            res.json({
                success: true,
                attempt: {
                    id: attempt.id,
                    attemptNumber: attempt.attemptNumber,
                    score: attempt.score,
                    totalPoints: attempt.totalPoints,
                    earnedPoints: attempt.earnedPoints,
                    passed: attempt.passed,
                    timeSpent: attempt.timeSpent,
                    completedAt: attempt.completedAt
                },
                student: {
                    firstName: attempt.student.firstName,
                    lastName: attempt.student.lastName
                },
                quiz: {
                    title: attempt.quiz.title,
                    passingScore: attempt.quiz.passingScore
                },
                results
            });

        } catch (error) {
            console.error('Error al obtener resultados:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener estadísticas del profesor (opcional)
    async getStats(req, res) {
        try {
            const { quizId } = req.params;

            const quiz = await Quiz.findOne({
                where: { quizId },
                include: [{
                    model: QuizAttempt,
                    as: 'attempts',
                    where: { completedAt: { [Op.not]: null } },
                    required: false,
                    include: [{
                        model: Student,
                        as: 'student'
                    }]
                }]
            });

            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz no encontrado'
                });
            }

            const completedAttempts = quiz.attempts || [];
            const totalAttempts = completedAttempts.length;
            const passedAttempts = completedAttempts.filter(a => a.passed).length;
            const averageScore = totalAttempts > 0 
                ? completedAttempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts
                : 0;

            res.json({
                success: true,
                stats: {
                    totalAttempts,
                    passedAttempts,
                    passRate: totalAttempts > 0 ? (passedAttempts / totalAttempts * 100) : 0,
                    averageScore: Math.round(averageScore * 100) / 100,
                    attempts: completedAttempts.map(a => ({
                        studentName: `${a.student.firstName} ${a.student.lastName}`,
                        attemptNumber: a.attemptNumber,
                        score: a.score,
                        passed: a.passed,
                        completedAt: a.completedAt
                    }))
                }
            });

        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

export default new QuizController();
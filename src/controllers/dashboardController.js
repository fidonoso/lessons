import { Op } from 'sequelize';
import { Teacher, Quiz, QuizQuestion, Student, QuizAttempt, QuizAnswer } from '../models/associations.js';

export const dashboardController = {
    // Vista principal del dashboard
    async getDashboard(req, res) {
        try {
            const teacherId = req.session.teacherId;

            // Estadísticas generales
            const [
                totalQuizzes,
                totalStudents,
                totalAttempts,
                activeAttempts
            ] = await Promise.all([
                Quiz.count({ where: { teacherId } }),
                Student.count(),
                QuizAttempt.count({
                    include: [{
                        model: Quiz,
                        as: 'quiz',
                        where: { teacherId }
                    }]
                }),
                QuizAttempt.count({
                    where: { 
                        status: 'in_progress',
                        startedAt: {
                            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
                        }
                    },
                    include: [{
                        model: Quiz,
                        as: 'quiz',
                        where: { teacherId }
                    }]
                })
            ]);

            // Quizzes del profesor con estadísticas
            const quizzes = await Quiz.findAll({
                where: { teacherId },
                include: [
                    {
                        model: QuizAttempt,
                        as: 'attempts',
                        attributes: ['id', 'status', 'score', 'startedAt', 'completedAt']
                    },
                    {
                        model: QuizQuestion,
                        as: 'questions',
                        attributes: ['id', 'questionText']
                    }
                ]
            });

            const quizStats = quizzes.map(quiz => {
                const completedAttempts = quiz.attempts.filter(a => a.status === 'completed');
                const inProgressAttempts = quiz.attempts.filter(a => a.status === 'in_progress');
                
                const avgScore = completedAttempts.length > 0 
                    ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length
                    : 0;

                return {
                    id: quiz.id,
                    quizId: quiz.quizId,
                    title: quiz.title,
                    totalQuestions: quiz.questions.length,
                    totalAttempts: quiz.attempts.length,
                    completedAttempts: completedAttempts.length,
                    inProgressAttempts: inProgressAttempts.length,
                    averageScore: Math.round(avgScore * 100) / 100,
                    passingScore: quiz.passingScore
                };
            });

            res.json({
                success: true,
                data: {
                    summary: {
                        totalQuizzes,
                        totalStudents,
                        totalAttempts,
                        activeAttempts
                    },
                    quizzes: quizStats,
                    teacher: req.teacher
                }
            });

        } catch (error) {
            console.error('Error getting dashboard:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cargar el dashboard'
            });
        }
    },

    // Análisis detallado de un quiz específico
    async getQuizAnalysis(req, res) {
        try {
            const { quizId } = req.params;
            const teacherId = req.session.teacherId;

            // Verificar que el quiz pertenece al profesor
            const quiz = await Quiz.findOne({
                where: { quizId, teacherId },
                include: [
                    {
                        model: QuizQuestion,
                        as: 'questions',
                        attributes: ['id', 'questionText', 'options', 'correctAnswer', 'questionOrder']
                    }
                ]
            });

            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz no encontrado'
                });
            }

            // Obtener todos los intentos con estudiantes y respuestas
            const attempts = await QuizAttempt.findAll({
                where: { quizId: quiz.id },
                include: [
                    {
                        model: Student,
                        as: 'student',
                        attributes: ['id', 'firstName', 'lastName']
                    },
                    {
                        model: QuizAnswer,
                        as: 'answers',
                        include: [
                            {
                                model: QuizQuestion,
                                as: 'question',
                                attributes: ['id', 'questionText', 'correctAnswer']
                            }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            // Análisis por pregunta
            const questionAnalysis = quiz.questions.map(question => {
                const allAnswers = attempts.flatMap(attempt => 
                    attempt.answers.filter(answer => answer.questionId === question.id)
                );

                const correctAnswers = allAnswers.filter(answer => answer.isCorrect).length;
                const totalAnswers = allAnswers.length;
                const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

                // Distribución de respuestas
                const answerDistribution = {};
                allAnswers.forEach(answer => {
                    const selectedAnswer = answer.selectedAnswer;
                    answerDistribution[selectedAnswer] = (answerDistribution[selectedAnswer] || 0) + 1;
                });

                return {
                    questionId: question.id,
                    questionText: question.questionText,
                    questionOrder: question.questionOrder,
                    correctAnswer: question.correctAnswer,
                    totalAnswers,
                    correctAnswers,
                    incorrectAnswers: totalAnswers - correctAnswers,
                    accuracy: Math.round(accuracy * 100) / 100,
                    answerDistribution,
                    difficulty: accuracy >= 80 ? 'Fácil' : 
                               accuracy >= 60 ? 'Medio' : 
                               accuracy >= 40 ? 'Difícil' : 'Muy Difícil'
                };
            });

            // Análisis por estudiante
            const studentAnalysis = attempts.map(attempt => {
                const correctCount = attempt.answers.filter(answer => answer.isCorrect).length;
                const totalQuestions = attempt.answers.length;

                return {
                    attemptId: attempt.id,
                    student: attempt.student,
                    status: attempt.status,
                    score: attempt.score,
                    startedAt: attempt.startedAt,
                    completedAt: attempt.completedAt,
                    timeSpent: attempt.completedAt && attempt.startedAt 
                        ? Math.round((new Date(attempt.completedAt) - new Date(attempt.startedAt)) / 1000 / 60) 
                        : null,
                    correctAnswers: correctCount,
                    totalQuestions,
                    answers: attempt.answers.map(answer => ({
                        questionId: answer.questionId,
                        questionText: answer.question.questionText,
                        selectedAnswer: answer.selectedAnswer,
                        correctAnswer: answer.question.correctAnswer,
                        isCorrect: answer.isCorrect,
                        timeSpent: answer.timeSpent
                    }))
                };
            });

            // Estadísticas generales del quiz
            const completedAttempts = attempts.filter(a => a.status === 'completed');
            const stats = {
                totalAttempts: attempts.length,
                completedAttempts: completedAttempts.length,
                inProgressAttempts: attempts.filter(a => a.status === 'in_progress').length,
                averageScore: completedAttempts.length > 0 
                    ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length
                    : 0,
                passRate: completedAttempts.length > 0 
                    ? (completedAttempts.filter(a => a.score >= quiz.passingScore).length / completedAttempts.length) * 100
                    : 0,
                averageTimeSpent: completedAttempts.length > 0 
                    ? completedAttempts.reduce((sum, a) => {
                        if (a.completedAt && a.startedAt) {
                            return sum + (new Date(a.completedAt) - new Date(a.startedAt)) / 1000 / 60;
                        }
                        return sum;
                    }, 0) / completedAttempts.length
                    : 0
            };

            res.json({
                success: true,
                data: {
                    quiz: {
                        id: quiz.id,
                        quizId: quiz.quizId,
                        title: quiz.title,
                        description: quiz.description,
                        timeLimit: quiz.timeLimit,
                        passingScore: quiz.passingScore,
                        maxAttempts: quiz.maxAttempts
                    },
                    stats,
                    questionAnalysis,
                    studentAnalysis
                }
            });

        } catch (error) {
            console.error('Error getting quiz analysis:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cargar el análisis del quiz'
            });
        }
    },

    // Obtener respuestas en tiempo real
    async getRealTimeData(req, res) {
        try {
            const teacherId = req.session.teacherId;

            // Intentos activos (en progreso)
            const activeAttempts = await QuizAttempt.findAll({
                where: { 
                    status: 'in_progress',
                    updatedAt: {
                        [Op.gte]: new Date(Date.now() - 10 * 60 * 1000) // Últimos 10 minutos
                    }
                },
                include: [
                    {
                        model: Quiz,
                        as: 'quiz',
                        where: { teacherId },
                        attributes: ['quizId', 'title']
                    },
                    {
                        model: Student,
                        as: 'student',
                        attributes: ['firstName', 'lastName']
                    },
                    {
                        model: QuizAnswer,
                        as: 'answers',
                        attributes: ['questionId', 'selectedAnswer', 'isCorrect', 'createdAt']
                    }
                ],
                order: [['updatedAt', 'DESC']]
            });

            // Actividad reciente (últimos 30 minutos)
            const recentActivity = await QuizAnswer.findAll({
                where: {
                    created_at: {
                        [Op.gte]: new Date(Date.now() - 30 * 60 * 1000)
                    }
                },
                include: [
                    {
                        model: QuizAttempt,
                        as: 'attempt',
                        include: [
                            {
                                model: Quiz,
                                as: 'quiz',
                                where: { teacherId },
                                attributes: ['quizId', 'title']
                            },
                            {
                                model: Student,
                                as: 'student',
                                attributes: ['firstName', 'lastName']
                            }
                        ]
                    },
                    {
                        model: QuizQuestion,
                        as: 'question',
                        attributes: ['questionText']
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: 50
            });

            res.json({
                success: true,
                data: {
                    activeAttempts: activeAttempts.map(attempt => ({
                        attemptId: attempt.id,
                        student: `${attempt.student.firstName} ${attempt.student.lastName}`,
                        quiz: attempt.quiz.title,
                        startedAt: attempt.startedAt,
                        questionsAnswered: attempt.answers.length,
                        lastActivity: attempt.updatedAt
                    })),
                    recentActivity: recentActivity.map(answer => ({
                        student: `${answer.attempt.student.firstName} ${answer.attempt.student.lastName}`,
                        quiz: answer.attempt.quiz.title,
                        questionText: answer.question.questionText.substring(0, 50) + '...',
                        selectedAnswer: answer.selectedAnswer,
                        isCorrect: answer.isCorrect,
                        timestamp: answer.createdAt
                    }))
                }
            });

        } catch (error) {
            console.error('Error getting real-time data:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener datos en tiempo real'
            });
        }
    }
}; 
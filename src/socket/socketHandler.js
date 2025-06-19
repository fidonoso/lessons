import { Server } from 'socket.io';
import { Op } from 'sequelize';
import { QuizAttempt, QuizAnswer, Student, Quiz } from '../models/associations.js';

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔗 Socket conectado: ${socket.id}`);

        // ==================== EVENTOS DE PROFESOR ====================
        
        // Profesor se une al room de administrador
        socket.on('teacher:join', (data) => {
            const { teacherId } = data;
            socket.join(`teacher:${teacherId}`);
            socket.teacherId = teacherId;
            console.log(`👨‍🏫 Profesor ${teacherId} conectado al dashboard`);
            
            // Enviar estadísticas iniciales
            emitRealTimeStats(teacherId);
        });

        // ==================== EVENTOS DE ESTUDIANTE ====================
        
        // ==================== EVENTOS DE LECCIONES ESTÁTICAS ====================
        
        // Estudiante inicia quiz en lección estática (como cyberhack.html)
        socket.on('lesson:quiz:started', (data) => {
            try {
                const { student, lesson, lessonType, timestamp } = data;
                console.log(`📚 [${lessonType}] Estudiante ${student} inició quiz: ${lesson}`);
                
                // Emitir a todos los profesores conectados (para lecciones estáticas)
                socket.broadcast.emit('lesson:student:quiz:started', {
                    student,
                    lesson,
                    lessonType,
                    timestamp
                });
            } catch (error) {
                console.error('Error handling lesson quiz start:', error);
            }
        });

        // Estudiante responde pregunta en lección estática
        socket.on('lesson:question:answered', (data) => {
            try {
                const { student, lesson, lessonType, question, totalQuestions, selectedAnswer, isCorrect, timestamp } = data;
                console.log(`✅ [${lessonType}] ${student} respondió pregunta ${question}/${totalQuestions}: ${isCorrect ? 'Correcta' : 'Incorrecta'}`);
                
                // Emitir a todos los profesores conectados
                socket.broadcast.emit('lesson:student:question:answered', {
                    student,
                    lesson,
                    lessonType,
                    question,
                    totalQuestions,
                    selectedAnswer,
                    isCorrect,
                    timestamp
                });
            } catch (error) {
                console.error('Error handling lesson question answer:', error);
            }
        });

        // Estudiante completa quiz en lección estática
        socket.on('lesson:quiz:completed', (data) => {
            try {
                const { student, lesson, lessonType, score, correctAnswers, totalQuestions, timeSpent, completedAt, detailedResults } = data;
                const passed = score >= 70; // 70% como criterio de aprobación por defecto
                
                console.log(`🎯 [${lessonType}] ${student} completó quiz "${lesson}" con ${score}% (${correctAnswers}/${totalQuestions}) - ${passed ? 'APROBADO' : 'REPROBADO'}`);
                
                // Emitir a todos los profesores conectados
                socket.broadcast.emit('lesson:student:quiz:completed', {
                    student,
                    lesson,
                    lessonType,
                    score,
                    correctAnswers,
                    totalQuestions,
                    timeSpent,
                    passed,
                    completedAt,
                    detailedResults
                });
            } catch (error) {
                console.error('Error handling lesson quiz completion:', error);
            }
        });

        // Estudiante envía respuestas de ejercicios prácticos
        socket.on('lesson:exercises:submitted', (data) => {
            try {
                const { student, lesson, lessonType, responses, statistics, timestamp } = data;
                
                console.log(`📝 [${lessonType}] ${student} envió ${statistics.completedResponses}/${statistics.totalExercises} ejercicios de "${lesson}" (${statistics.completionPercentage}%)`);
                
                // Log detallado de las respuestas
                Object.entries(responses).forEach(([exerciseId, response]) => {
                    console.log(`  └─ ${response.exerciseType}: ${response.exerciseTitle} [${response.exerciseLevel}] - ${response.characterCount} caracteres`);
                });
                
                // Emitir a todos los profesores conectados
                socket.broadcast.emit('lesson:student:exercises:submitted', {
                    student,
                    lesson,
                    lessonType,
                    responses,
                    statistics,
                    timestamp,
                    submissionId: `${student.replace(/\s+/g, '_')}_${Date.now()}` // ID único para esta submisión
                });
                
            } catch (error) {
                console.error('Error handling lesson exercises submission:', error);
            }
        });
        
        // ==================== EVENTOS DE QUIZ CON BASE DE DATOS ====================
        
        // Estudiante inicia un quiz
        socket.on('student:quiz:start', async (data) => {
            try {
                const { attemptId, studentId, quizId } = data;
                
                socket.join(`quiz:${quizId}`);
                socket.join(`attempt:${attemptId}`);
                socket.attemptId = attemptId;
                socket.studentId = studentId;
                
                // Obtener datos del estudiante y quiz
                const attempt = await QuizAttempt.findByPk(attemptId, {
                    include: [
                        {
                            model: Student,
                            as: 'student',
                            attributes: ['firstName', 'lastName']
                        },
                        {
                            model: Quiz,
                            as: 'quiz',
                            attributes: ['title', 'teacherId']
                        }
                    ]
                });

                if (attempt) {
                    console.log(`📝 Estudiante ${attempt.student.firstName} ${attempt.student.lastName} inició quiz: ${attempt.quiz.title}`);
                    
                    // Notificar al profesor
                    io.to(`teacher:${attempt.quiz.teacherId}`).emit('student:quiz:started', {
                        student: `${attempt.student.firstName} ${attempt.student.lastName}`,
                        quiz: attempt.quiz.title,
                        attemptId,
                        timestamp: new Date()
                    });

                    // Actualizar estadísticas en tiempo real
                    emitRealTimeStats(attempt.quiz.teacherId);
                }
            } catch (error) {
                console.error('Error handling student quiz start:', error);
            }
        });

        // Estudiante responde una pregunta
        socket.on('student:question:answer', async (data) => {
            try {
                const { attemptId, questionId, selectedAnswer, isCorrect, timeSpent } = data;
                
                // Obtener datos del intento
                const attempt = await QuizAttempt.findByPk(attemptId, {
                    include: [
                        {
                            model: Student,
                            as: 'student',
                            attributes: ['firstName', 'lastName']
                        },
                        {
                            model: Quiz,
                            as: 'quiz',
                            attributes: ['title', 'teacherId']
                        }
                    ]
                });

                if (attempt) {
                    console.log(`✅ ${attempt.student.firstName} respondió pregunta ${questionId}: ${isCorrect ? 'Correcta' : 'Incorrecta'}`);
                    
                    // Notificar al profesor en tiempo real
                    io.to(`teacher:${attempt.quiz.teacherId}`).emit('student:question:answered', {
                        student: `${attempt.student.firstName} ${attempt.student.lastName}`,
                        quiz: attempt.quiz.title,
                        questionId,
                        selectedAnswer,
                        isCorrect,
                        timeSpent,
                        timestamp: new Date()
                    });

                    // Actualizar estadísticas en tiempo real
                    emitRealTimeStats(attempt.quiz.teacherId);
                }
            } catch (error) {
                console.error('Error handling student answer:', error);
            }
        });

        // Estudiante completa el quiz
        socket.on('student:quiz:complete', async (data) => {
            try {
                const { attemptId, score, totalQuestions } = data;
                
                const attempt = await QuizAttempt.findByPk(attemptId, {
                    include: [
                        {
                            model: Student,
                            as: 'student',
                            attributes: ['firstName', 'lastName']
                        },
                        {
                            model: Quiz,
                            as: 'quiz',
                            attributes: ['title', 'teacherId', 'passingScore']
                        }
                    ]
                });

                if (attempt) {
                    const passed = score >= attempt.quiz.passingScore;
                    console.log(`🎯 ${attempt.student.firstName} completó quiz con ${score}% - ${passed ? 'APROBADO' : 'REPROBADO'}`);
                    
                    // Notificar al profesor
                    io.to(`teacher:${attempt.quiz.teacherId}`).emit('student:quiz:completed', {
                        student: `${attempt.student.firstName} ${attempt.student.lastName}`,
                        quiz: attempt.quiz.title,
                        score,
                        totalQuestions,
                        passed,
                        timestamp: new Date()
                    });

                    // Actualizar estadísticas finales
                    emitRealTimeStats(attempt.quiz.teacherId);
                }
            } catch (error) {
                console.error('Error handling quiz completion:', error);
            }
        });

        // ==================== EVENTOS GENERALES ====================
        
        socket.on('disconnect', () => {
            console.log(`❌ Socket desconectado: ${socket.id}`);
            
            // Si es un profesor, notificar desconexión
            if (socket.teacherId) {
                console.log(`👨‍🏫 Profesor ${socket.teacherId} desconectado del dashboard`);
            }
            
            // Si es un estudiante, notificar al profesor
            if (socket.attemptId && socket.studentId) {
                // Notificar desconexión del estudiante (opcional)
            }
        });
    });

    return io;
};

// ==================== FUNCIONES AUXILIARES ====================

// Emitir estadísticas en tiempo real al profesor
const emitRealTimeStats = async (teacherId) => {
    try {
        if (!io) return;

        // Obtener datos en tiempo real
        const [activeAttempts, recentAnswers] = await Promise.all([
            QuizAttempt.count({
                where: { status: 'in_progress' },
                include: [{
                    model: Quiz,
                    as: 'quiz',
                    where: { teacherId }
                }]
            }),
            QuizAnswer.count({
                where: {
                    created_at: {
                        [Op.gte]: new Date(Date.now() - 5 * 60 * 1000) // Últimos 5 minutos
                    }
                },
                include: [{
                    model: QuizAttempt,
                    as: 'attempt',
                    include: [{
                        model: Quiz,
                        as: 'quiz',
                        where: { teacherId }
                    }]
                }]
            })
        ]);

        // Emitir estadísticas actualizadas
        io.to(`teacher:${teacherId}`).emit('realtime:stats', {
            activeAttempts,
            recentAnswers,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Error emitting real-time stats:', error);
    }
};

// Función para emitir eventos desde controladores
export const emitToTeacher = (teacherId, event, data) => {
    if (io) {
        io.to(`teacher:${teacherId}`).emit(event, data);
    }
};

// Función para emitir a estudiantes de un quiz específico
export const emitToQuiz = (quizId, event, data) => {
    if (io) {
        io.to(`quiz:${quizId}`).emit(event, data);
    }
};

export { io }; 
import Teacher from './Teacher.js';
import Student from './Student.js';
import Quiz from './Quiz.js';
import QuizQuestion from './QuizQuestion.js';
import QuizAttempt from './QuizAttempt.js';
import QuizAnswer from './QuizAnswer.js';

// Importar todas las asociaciones
import './associations.js';

// Función para inicializar datos de ejemplo
const initializeQuizData = async () => {
    try {
        // Buscar si hay algún profesor para asignar el quiz
        let assignedTeacherId = null;
        const existingTeacher = await Teacher.findOne();
        if (existingTeacher) {
            assignedTeacherId = existingTeacher.id;
        }

        // Crear quiz de PowerShell si no existe
        const [quiz, created] = await Quiz.findOrCreate({
            where: { quizId: 'powershell-cybersecurity' },
            defaults: {
                title: 'PowerShell para Ciberseguridad',
                description: 'Evaluación de conocimientos sobre PowerShell aplicado a ciberseguridad y diagnóstico de sistemas',
                timeLimit: 30,
                passingScore: 70,
                maxAttempts: 5,
                teacherId: assignedTeacherId
            }
        });

        if (created) {
            // Crear preguntas de ejemplo
            const questions = [
                {
                    questionNumber: 1,
                    questionText: '¿Cuál es el cmdlet correcto para listar todos los procesos en ejecución?',
                    options: ["Get-Process", "List-Process", "Show-Process", "View-Process"],
                    correctAnswer: 0,
                    explanation: 'Get-Process es el cmdlet estándar de PowerShell para mostrar información sobre los procesos que se ejecutan en el sistema local.',
                    points: 10
                },
                {
                    questionNumber: 2,
                    questionText: '¿Qué comando utilizarías para ver las conexiones de red activas?',
                    options: ["Get-NetConnection", "Get-NetTCPConnection", "Show-Network", "Get-Connection"],
                    correctAnswer: 1,
                    explanation: 'Get-NetTCPConnection muestra información sobre las conexiones TCP actuales en el sistema, esencial para análisis de red en ciberseguridad.',
                    points: 10
                },
                {
                    questionNumber: 3,
                    questionText: '¿Cuál es la principal ventaja de PowerShell para profesionales de ciberseguridad?',
                    options: ["Es más rápido que CMD", "Permite automatización y análisis profundo del sistema", "Solo funciona en Windows", "Es más fácil de usar"],
                    correctAnswer: 1,
                    explanation: 'PowerShell permite automatización avanzada, análisis profundo del sistema y es especialmente útil para tareas de ciberseguridad como detección de amenazas y análisis forense.',
                    points: 10
                },
                {
                    questionNumber: 4,
                    questionText: '¿Qué cmdlet usarías para obtener eventos del registro de seguridad de Windows?',
                    options: ["Get-EventLog", "Get-WinEvent", "Show-SecurityLog", "Get-SecurityEvent"],
                    correctAnswer: 1,
                    explanation: 'Get-WinEvent es el cmdlet moderno y más potente para acceder a los logs de eventos de Windows, incluyendo el registro de seguridad.',
                    points: 10
                },
                {
                    questionNumber: 5,
                    questionText: '¿Cuál de estas técnicas NO es una buena práctica de seguridad al usar PowerShell?',
                    options: ["Verificar la política de ejecución", "Ejecutar scripts sin revisar su contenido", "Usar módulos firmados digitalmente", "Monitorear la actividad de PowerShell"],
                    correctAnswer: 1,
                    explanation: 'Ejecutar scripts sin revisar su contenido es peligroso y va contra las mejores prácticas de seguridad. Siempre debes verificar y entender el código antes de ejecutarlo.',
                    points: 10
                }
            ];

            for (const questionData of questions) {
                await QuizQuestion.create({
                    quizId: 'powershell-cybersecurity',
                    ...questionData
                });
            }

            console.log('✅ Quiz de PowerShell y preguntas inicializados correctamente');
        }
    } catch (error) {
        console.error('❌ Error al inicializar datos del quiz:', error);
    }
};

export {
    Teacher,
    Student,
    Quiz,
    QuizQuestion,
    QuizAttempt,
    QuizAnswer,
    initializeQuizData
};

export default {
    Teacher,
    Student,
    Quiz,
    QuizQuestion,
    QuizAttempt,
    QuizAnswer,
    initializeQuizData
}; 
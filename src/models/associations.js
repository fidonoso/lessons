import Teacher from './Teacher.js';
import Quiz from './Quiz.js';
import QuizQuestion from './QuizQuestion.js';
import Student from './Student.js';
import QuizAttempt from './QuizAttempt.js';
import QuizAnswer from './QuizAnswer.js';

// Asociaciones Teacher-Quiz
Teacher.hasMany(Quiz, {
    foreignKey: 'teacherId',
    sourceKey: 'id',
    as: 'quizzes'
});

Quiz.belongsTo(Teacher, {
    foreignKey: 'teacherId',
    targetKey: 'id',
    as: 'teacher'
});

// Asociaciones Quiz-QuizQuestion
Quiz.hasMany(QuizQuestion, {
    foreignKey: 'quizId',
    sourceKey: 'quizId',
    as: 'questions'
});

QuizQuestion.belongsTo(Quiz, {
    foreignKey: 'quizId',
    targetKey: 'quizId',
    as: 'quiz'
});

// Asociaciones Student-QuizAttempt
Student.hasMany(QuizAttempt, {
    foreignKey: 'studentId',
    as: 'attempts'
});

QuizAttempt.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student'
});

// Asociaciones Quiz-QuizAttempt
Quiz.hasMany(QuizAttempt, {
    foreignKey: 'quizId',
    sourceKey: 'quizId',
    as: 'attempts'
});

QuizAttempt.belongsTo(Quiz, {
    foreignKey: 'quizId',
    targetKey: 'quizId',
    as: 'quiz'
});

// Asociaciones QuizAttempt-QuizAnswer
QuizAttempt.hasMany(QuizAnswer, {
    foreignKey: 'attemptId',
    as: 'answers'
});

QuizAnswer.belongsTo(QuizAttempt, {
    foreignKey: 'attemptId',
    as: 'attempt'
});

// Asociaciones QuizQuestion-QuizAnswer
QuizQuestion.hasMany(QuizAnswer, {
    foreignKey: 'questionId',
    as: 'answers'
});

QuizAnswer.belongsTo(QuizQuestion, {
    foreignKey: 'questionId',
    as: 'question'
});

export {
    Teacher,
    Quiz,
    QuizQuestion,
    Student,
    QuizAttempt,
    QuizAnswer
}; 
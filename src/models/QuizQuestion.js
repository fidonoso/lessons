import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../database/connection.js';

const QuizQuestion = sequelize.define('QuizQuestion', {
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
        allowNull: false
    },
    quizId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'quiz_id',
        references: {
            model: 'quizzes',
            key: 'quiz_id'
        }
    },
    questionNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'question_number'
    },
    questionType: {
        type: DataTypes.STRING(50),
        defaultValue: 'multiple-choice',
        field: 'question_type'
    },
    questionText: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'question_text'
    },
    options: {
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Array de opciones para multiple choice'
    },
    correctAnswer: {
        type: DataTypes.JSONB,
        allowNull: false,
        field: 'correct_answer',
        comment: 'Respuesta correcta (puede ser index, boolean, array, etc.)'
    },
    explanation: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Retroalimentación para la pregunta'
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    }
}, {
    tableName: 'quiz_questions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default QuizQuestion; 
import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../database/connection.js';

const QuizAnswer = sequelize.define('QuizAnswer', {
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
        allowNull: false
    },
    attemptId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'attempt_id',
        references: {
            model: 'quiz_attempts',
            key: 'id'
        }
    },
    questionId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'question_id',
        references: {
            model: 'quiz_questions',
            key: 'id'
        }
    },
    studentAnswer: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: 'student_answer',
        comment: 'Respuesta del estudiante'
    },
    selectedAnswer: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'selected_answer'
    },
    timeSpent: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'time_spent',
        comment: 'Tiempo en segundos para responder'
    },
    isCorrect: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'is_correct'
    },
    pointsEarned: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'points_earned'
    }
}, {
    tableName: 'quiz_answers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default QuizAnswer; 
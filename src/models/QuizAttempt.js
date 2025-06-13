import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../database/connection.js';

const QuizAttempt = sequelize.define('QuizAttempt', {
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
        allowNull: false
    },
    studentId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'student_id',
        references: {
            model: 'students',
            key: 'id'
        }
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
    attemptNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'attempt_number'
    },
    status: {
        type: DataTypes.ENUM('in_progress', 'completed', 'abandoned'),
        defaultValue: 'in_progress',
        allowNull: false
    },
    score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Porcentaje obtenido'
    },
    totalPoints: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'total_points'
    },
    earnedPoints: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'earned_points'
    },
    passed: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    timeSpent: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'time_spent',
        comment: 'Tiempo en segundos'
    },
    startedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'started_at'
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'completed_at'
    }
}, {
    tableName: 'quiz_attempts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['student_id', 'quiz_id', 'attempt_number']
        }
    ]
});

export default QuizAttempt; 
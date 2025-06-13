import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../database/connection.js';

const Quiz = sequelize.define('Quiz', {
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
        allowNull: false
    },
    quizId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: 'quiz_id'
    },
    teacherId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'teacher_id',
        references: {
            model: 'teachers',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    timeLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'time_limit',
        comment: 'Tiempo límite en minutos'
    },
    passingScore: {
        type: DataTypes.INTEGER,
        defaultValue: 70,
        field: 'passing_score',
        comment: 'Porcentaje mínimo para aprobar'
    },
    maxAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
        field: 'max_attempts'
    }
}, {
    tableName: 'quizzes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Quiz; 
import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import sequelize from '../database/connection.js';

const Teacher = sequelize.define('Teacher', {
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'first_name'
    },
    lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'last_name'
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login'
    }
}, {
    tableName: 'teachers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        // Hash password before saving
        beforeCreate: async (teacher) => {
            if (teacher.password) {
                const saltRounds = 10;
                teacher.password = await bcrypt.hash(teacher.password, saltRounds);
            }
        },
        beforeUpdate: async (teacher) => {
            if (teacher.changed('password')) {
                const saltRounds = 10;
                teacher.password = await bcrypt.hash(teacher.password, saltRounds);
            }
        }
    }
});

// Método de instancia para validar contraseña
Teacher.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Método estático para buscar por email y validar contraseña
Teacher.authenticate = async function(email, password) {
    try {
        const teacher = await this.findOne({
            where: { 
                email: email.toLowerCase(),
                isActive: true
            }
        });
        
        if (!teacher) {
            return null;
        }
        
        const isValid = await teacher.validatePassword(password);
        return isValid ? teacher : null;
    } catch (error) {
        throw error;
    }
};

export default Teacher; 
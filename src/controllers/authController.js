import Teacher from '../models/Teacher.js';
import { Quiz } from '../models/associations.js';

export const authController = {
    // Crear profesor (vía Postman)
    async createTeacher(req, res) {
        try {
            const { firstName, lastName, email, password } = req.body;

            // Validaciones básicas
            if (!firstName || !lastName || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son obligatorios',
                    required: ['firstName', 'lastName', 'email', 'password']
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                });
            }

            // Verificar si el email ya existe
            const existingTeacher = await Teacher.findOne({
                where: { email: email.toLowerCase() }
            });

            if (existingTeacher) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un profesor con este email'
                });
            }

            // Crear el profesor
            const teacher = await Teacher.create({
                firstName,
                lastName,
                email: email.toLowerCase(),
                password
            });

            // Asignar quizzes sin profesor al nuevo profesor
            await Quiz.update(
                { teacherId: teacher.id },
                { where: { teacherId: null } }
            );

            // Respuesta sin contraseña
            const { password: _, ...teacherData } = teacher.toJSON();

            res.status(201).json({
                success: true,
                message: 'Profesor creado exitosamente',
                data: {
                    teacher: teacherData,
                    loginUrl: '/teacher/login'
                }
            });

        } catch (error) {
            console.error('Error creating teacher:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Login de profesor
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son obligatorios'
                });
            }

            // Autenticar profesor
            const teacher = await Teacher.authenticate(email, password);

            if (!teacher) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Actualizar último login
            await teacher.update({ lastLogin: new Date() });

            // Crear sesión
            req.session.teacherId = teacher.id;
            req.session.teacherEmail = teacher.email;

            // Respuesta sin contraseña
            const { password: _, ...teacherData } = teacher.toJSON();

            res.json({
                success: true,
                message: 'Login exitoso',
                data: {
                    teacher: teacherData,
                    redirectTo: '/teacher/dashboard'
                }
            });

        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    // Logout de profesor
    async logout(req, res) {
        try {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error al cerrar sesión'
                    });
                }

                res.clearCookie('connect.sid'); // Limpiar cookie de sesión
                res.json({
                    success: true,
                    message: 'Sesión cerrada exitosamente',
                    redirectTo: '/teacher/login'
                });
            });

        } catch (error) {
            console.error('Error during logout:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },

    // Verificar estado de sesión
    async checkSession(req, res) {
        try {
            if (req.session && req.session.teacherId) {
                const teacher = await Teacher.findByPk(req.session.teacherId, {
                    attributes: ['id', 'firstName', 'lastName', 'email', 'lastLogin', 'isActive']
                });

                if (teacher && teacher.isActive) {
                    return res.json({
                        success: true,
                        authenticated: true,
                        data: { teacher }
                    });
                }
            }

            res.json({
                success: true,
                authenticated: false,
                message: 'No hay sesión activa'
            });

        } catch (error) {
            console.error('Error checking session:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}; 
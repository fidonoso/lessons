import Teacher from '../models/Teacher.js';

// Middleware para verificar si el usuario está autenticado
export const requireAuth = (req, res, next) => {
    if (req.session && req.session.teacherId) {
        return next();
    } else {
        return res.status(401).json({
            success: false,
            message: 'Acceso no autorizado. Debe iniciar sesión como profesor.',
            redirectTo: '/teacher/login'
        });
    }
};

// Middleware para cargar datos del profesor autenticado
export const loadTeacher = async (req, res, next) => {
    try {
        if (req.session && req.session.teacherId) {
            const teacher = await Teacher.findByPk(req.session.teacherId, {
                attributes: ['id', 'firstName', 'lastName', 'email', 'lastLogin']
            });
            
            if (teacher) {
                req.teacher = teacher;
            }
        }
        next();
    } catch (error) {
        console.error('Error loading teacher:', error);
        next();
    }
};

// Middleware para rutas que solo son accesibles sin autenticación
export const requireGuest = (req, res, next) => {
    if (req.session && req.session.teacherId) {
        return res.status(400).json({
            success: false,
            message: 'Ya está autenticado como profesor.',
            redirectTo: '/teacher/dashboard'
        });
    }
    next();
}; 
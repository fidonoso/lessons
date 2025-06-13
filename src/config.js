import { config } from 'dotenv';

// Configurar dotenv
config();

// Objeto de configuración con valores por defecto
const appConfig = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Configuración de base de datos PostgreSQL
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        name: process.env.DB_NAME || 'cft_quiz_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    }
};

export default appConfig;

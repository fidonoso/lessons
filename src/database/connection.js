import { Sequelize } from 'sequelize';
import appConfig from '../config.js';

// Configuración de Sequelize para PostgreSQL
const sequelize = new Sequelize(
    appConfig.database.name,
    appConfig.database.user,
    appConfig.database.password,
    {
        host: appConfig.database.host,
        port: appConfig.database.port,
        dialect: 'postgresql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        }
    }
);

// Función para probar la conexión
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida correctamente');
    } catch (error) {
        console.error('❌ Error al conectar con PostgreSQL:', error);
    }
};

// Función para sincronizar modelos
const syncDatabase = async (force = false) => {
    try {
        await sequelize.sync({ force });
        console.log('🗄️ Base de datos sincronizada correctamente');
    } catch (error) {
        console.error('❌ Error al sincronizar la base de datos:', error);
    }
};

// Manejar cierre elegante
process.on('SIGINT', () => {
    console.log('🛑 Cerrando conexiones de base de datos...');
    sequelize.close();
});

process.on('SIGTERM', () => {
    console.log('🛑 Cerrando conexiones de base de datos...');
    sequelize.close();
});

export { sequelize, testConnection, syncDatabase };
export default sequelize;

 
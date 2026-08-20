import pg from "pg";
import dotenv from 'dotenv'


// Asegurar que carguen las variables de entorno del archivo .env
dotenv.config();

const {Pool} =pg
// Configuración del Pool de conexiones usando las variables de entorno

const pool= new Pool({
    connectionString: process.env.DATABASE_URL,
    user:process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
})

// Escuchar eventos del Pool para monitorear errores o conexiones exitosas
pool.on('connect', () => {
    console.log(' PostgreSQL Pool connected successfully');
});

pool.on('error', (err) => {
    console.error(' Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
});

// Función helper para realizar consultas (queries) en cualquier parte del backend
export const query = (text: string, params?: any[]) => {
    return pool.query(text, params);
};

export default pool;
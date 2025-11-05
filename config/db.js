import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde config/.env si existe
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = mysql.createPool({
    host: process.env.HOST || 'localhost',
    user: process.env.USER || 'root',
    password: process.env.PASS || '',
    database: process.env.DB || 'farmacia_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar una conexión al iniciar (no lanzar si falla, solo log)
pool.getConnection()
    .then(conn => {
        console.log('✅ Conexión MySQL (pool) establecida');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Error al conectar a la base de datos:', err.message);
    });

export default pool;

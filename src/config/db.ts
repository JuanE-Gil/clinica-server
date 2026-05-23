/**
 * Configuración de la conexión a la base de datos PostgreSQL.
 * Implementa el patrón Singleton para asegurar una única instancia del pool de conexiones.
 */
import { Pool } from 'pg';
import process from 'process';
import dotenv from 'dotenv';

// Carga las variables de entorno desde el archivo .env
dotenv.config();

/**
 * Clase DatabasePool que gestiona el pool de conexiones a la base de datos.
 */
class DatabasePool {
    private static instance: DatabasePool;
    private readonly pool: Pool;

    /**
     * Constructor privado que inicializa el pool de conexiones con la configuración del entorno.
     */
    private constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
        });

        // Manejo de errores inesperados en clientes inactivos
        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
    }

    /**
     * Obtiene la instancia única de DatabasePool.
     * @returns Instancia de DatabasePool.
     */
    public static getInstance(): DatabasePool {
        if (!DatabasePool.instance) {
            DatabasePool.instance = new DatabasePool();
        }
        return DatabasePool.instance;
    }

    /**
     * Obtiene el pool de conexiones de PostgreSQL.
     * @returns Pool de conexiones.
     */
    public getPool(): Pool {
        return this.pool;
    }

    /**
     * Cierra todas las conexiones en el pool.
     */
    public async disconnect(): Promise<void> {
        await this.pool.end();
    }
}

// Exporta la instancia del pool de conexiones para su uso en el resto de la aplicación
export default DatabasePool.getInstance().getPool();

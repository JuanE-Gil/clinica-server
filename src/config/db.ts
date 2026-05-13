import { Pool } from 'pg';
import process from 'process';
import dotenv from 'dotenv';

dotenv.config();

class DatabasePool {
    private static instance: DatabasePool;
    private pool: Pool;

    private constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
        });

        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
    }

    public static getInstance(): DatabasePool {
        if (!DatabasePool.instance) {
            DatabasePool.instance = new DatabasePool();
        }
        return DatabasePool.instance;
    }

    public getPool(): Pool {
        return this.pool;
    }

    public async disconnect(): Promise<void> {
        await this.pool.end();
    }
}

export default DatabasePool.getInstance().getPool();

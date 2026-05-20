/**
 * Modelo para la gestión del personal de enfermería en la base de datos.
 */
import pool from '../config/db.js';

/**
 * Interfaz que define la estructura de una enfermera.
 */
export interface INurse {
    id?: string;
    name: string;
    license_number: string;
    created_at?: Date;
}

/**
 * Operaciones de base de datos para el personal de enfermería.
 */
export const NurseModel = {
    /**
     * Obtiene todas las enfermeras activas ordenadas por nombre.
     */
    async findAll(): Promise<INurse[]> {
        const { rows } = await pool.query('SELECT * FROM nurses WHERE is_active = true ORDER BY name ASC');
        return rows;
    },

    /**
     * Busca una enfermera por su identificador único.
     * @param id ID de la enfermera.
     */
    async findById(id: string): Promise<INurse | null> {
        const { rows } = await pool.query('SELECT * FROM nurses WHERE id = $1', [id]);
        return rows[0] || null;
    },

    /**
     * Registra una nueva enfermera.
     * @param data Datos de la enfermera.
     */
    async create(data: INurse): Promise<INurse> {
        const query = `
            INSERT INTO nurses (name, license_number)
            VALUES ($1, $2)
            RETURNING *`;
        const { rows } = await pool.query(query, [data.name, data.license_number]);
        return rows[0];
    },

    /**
     * Actualiza la información de una enfermera existente.
     * @param id ID de la enfermera.
     * @param data Campos a actualizar.
     */
    async update(id: string, data: Partial<INurse>): Promise<INurse | null> {
        const query = `
            UPDATE nurses
            SET name = $1, license_number = $2
            WHERE id = $3
            RETURNING *`;
        const { rows } = await pool.query(query, [data.name, data.license_number, id]);
        return rows[0] || null;
    },

    /**
     * Realiza una eliminación lógica (is_active = false) de una enfermera.
     * @param id ID de la enfermera.
     */
    async delete(id: string): Promise<INurse | null> {
        const { rows } = await pool.query('UPDATE nurses SET is_active = false WHERE id = $1', [id]);
        return rows[0] || null;
    },
};

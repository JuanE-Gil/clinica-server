import pool from '../config/db.js';

export interface INurse {
    id?: string;
    name: string;
    license_number: string;
    created_at?: Date;
}

export const NurseModel = {
    // Obtener todas las enfermeras ordenadas por nombre
    async findAll(): Promise<INurse[]> {
        const { rows } = await pool.query('SELECT * FROM nurses ORDER BY name ASC');
        return rows;
    },

    // Buscar una enfermera por su ID
    async findById(id: string): Promise<INurse | null> {
        const { rows } = await pool.query('SELECT * FROM nurses WHERE id = $1', [id]);
        return rows[0] || null;
    },

    // Registrar una nueva enfermera
    async create(data: INurse): Promise<INurse> {
        const query = `
            INSERT INTO nurses (name, license_number)
            VALUES ($1, $2)
            RETURNING *`;
        const { rows } = await pool.query(query, [data.name, data.license_number]);
        return rows[0];
    },

    // Actualizar datos de una enfermera
    async update(id: string, data: Partial<INurse>): Promise<INurse | null> {
        const query = `
            UPDATE nurses
            SET name = $1, license_number = $2
            WHERE id = $3
            RETURNING *`;
        const { rows } = await pool.query(query, [data.name, data.license_number, id]);
        return rows[0] || null;
    },

    // Eliminar una enfermera del sistema
    async delete(id: string): Promise<INurse | null> {
        const { rows } = await pool.query('DELETE FROM nurses WHERE id = $1 RETURNING *', [id]);
        return rows[0] || null;
    },
};

import pool from '../config/db.js';

export interface ITreatment {
    id?: string;
    name: string;
    base_cost: number;
    created_at?: Date;
}

export const TreatmentModel = {
    // Obtener todos los tratamientos disponibles
    async findAll(): Promise<ITreatment[]> {
        const { rows } = await pool.query('SELECT * FROM treatments WHERE is_active = true ORDER BY name ASC');
        return rows;
    },

    // Buscar un tratamiento específico (útil para validar costos en la administración)
    async findById(id: string): Promise<ITreatment | null> {
        const { rows } = await pool.query('SELECT * FROM treatments WHERE id = $1', [id]);
        return rows[0] || null;
    },

    // En caso de que necesites gestión administrativa de tratamientos:
    async create(data: ITreatment): Promise<ITreatment> {
        const query = `
            INSERT INTO treatments (name, base_cost)
            VALUES ($1, $2)
            RETURNING *`;
        const { rows } = await pool.query(query, [data.name, data.base_cost]);
        return rows[0];
    },

    async update(id: string, data: Partial<ITreatment>): Promise<ITreatment | null> {
        const query = `
            UPDATE treatments
            SET name = $1, base_cost = $2
            WHERE id = $3
            RETURNING *`;
        const { rows } = await pool.query(query, [data.name, data.base_cost, id]);
        return rows[0] || null;
    },

    async delete(id: string): Promise<ITreatment | null> {
        const { rows } = await pool.query('UPDATE treatments SET is_active = false WHERE id = $1', [id]);
        return rows[0] || null;
    },
};

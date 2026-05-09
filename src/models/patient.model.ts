/* eslint-disable max-len */
import pool from '../config/db.js';

export interface IPatient {
    id?: string;
    full_name: string;
    dni: string;
    address: string;
    phone: string;
    birth_date: string;
    created_at?: Date;
}

export const PatientModel = {
    // Obtener todos los pacientes ordenados
    async findAll(): Promise<IPatient[]> {
        const { rows } = await pool.query('SELECT * FROM patients ORDER BY full_name ASC');
        return rows;
    },

    // Buscar paciente por ID
    async findById(id: string): Promise<IPatient | null> {
        const { rows } = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
        return rows[0] || null;
    },

    // Registrar nuevo paciente
    async create(data: IPatient): Promise<IPatient> {
        const query = `
            INSERT INTO patients (full_name, dni, address, phone, birth_date)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        const { rows } = await pool.query(query, [data.full_name, data.dni, data.address, data.phone, data.birth_date]);
        return rows[0];
    },

    // Actualizar datos de paciente
    async update(id: string, data: Partial<IPatient>): Promise<IPatient | null> {
        const query = `
            UPDATE patients
            SET full_name = $1, dni = $2, address = $3, phone = $4, birth_date = $5
            WHERE id = $6 RETURNING *`;
        const { rows } = await pool.query(query, [data.full_name, data.dni, data.address, data.phone, data.birth_date, id]);
        return rows[0] || null;
    },

    // Eliminar paciente
    async delete(id: string): Promise<IPatient | null> {
        const { rows } = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING *', [id]);
        return rows[0] || null;
    },

    // --- CONSULTAS ESPECIALIZADAS ---

    // Obtener historial clínico (Para la UI)
    async findHistory(patientId: string) {
        const query = `
        SELECT
            h.id, h.administered_at as fecha, t.name as tratamiento, n.name as enfermera,
            h.base_cost_at_time as costo_proc,
            JSON_AGG(JSON_BUILD_OBJECT('nombre', p.name, 'cant', i.quantity, 'subtotal', (i.quantity * i.price_at_time))) as materiales,
            (h.base_cost_at_time + SUM(i.quantity * i.price_at_time)) as costo_total
        FROM administration_header h
        JOIN treatments t ON h.treatment_id = t.id
        JOIN nurses n ON h.nurse_id = n.id
        LEFT JOIN administration_items i ON i.header_id = h.id
        LEFT JOIN products p ON i.product_id = p.id
        WHERE h.patient_id = $1
        GROUP BY h.id, t.name, n.name
        ORDER BY h.administered_at DESC`;

        const { rows } = await pool.query(query, [patientId]);
        return rows;
    },

    // Obtener datos consolidados para el reporte (Para el PDF)
    async findReportData(id: string) {
        const query = `
        SELECT
            h.administered_at,
            t.name as tratamiento,
            n.name as enfermera,
            COALESCE(JSON_AGG(p.name || ' (x' || i.quantity || ')') FILTER (WHERE p.name IS NOT NULL), '[]') as materiales,
            (h.base_cost_at_time + COALESCE(SUM(i.quantity * i.price_at_time), 0)) as total
        FROM administration_header h
        JOIN treatments t ON h.treatment_id = t.id
        JOIN nurses n ON h.nurse_id = n.id
        LEFT JOIN administration_items i ON i.header_id = h.id
        LEFT JOIN products p ON i.product_id = p.id
        WHERE h.patient_id = $1
        GROUP BY h.id, t.name, n.name
        ORDER BY h.administered_at DESC`;

        const { rows } = await pool.query(query, [id]);
        return rows;
    },
};

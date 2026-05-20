/**
 * Modelo para la gestión de Pacientes en la base de datos PostgreSQL.
 */
/* eslint-disable max-len */
import pool from '../config/db.js';

/**
 * Interfaz que define la estructura de un Paciente.
 */
export interface IPatient {
    id?: string;
    full_name: string;
    dni: string;
    address: string;
    phone: string;
    birth_date: string;
    created_at?: Date;
}

/**
 * Objeto que contiene las operaciones CRUD y consultas especializadas para Pacientes.
 */
export const PatientModel = {
    /**
     * Obtiene todos los pacientes activos ordenados alfabéticamente por nombre.
     * @returns Lista de pacientes.
     */
    async findAll(): Promise<IPatient[]> {
        const { rows } = await pool.query('SELECT * FROM patients WHERE is_active = true ORDER BY full_name');
        return rows;
    },

    /**
     * Busca un paciente por su ID único.
     * @param id ID del paciente.
     * @returns El paciente encontrado o null.
     */
    async findById(id: string): Promise<IPatient | null> {
        const { rows } = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
        return rows[0] || null;
    },

    /**
     * Registra un nuevo paciente en el sistema.
     * @param data Datos del paciente a crear.
     * @returns El paciente creado con su ID generado.
     */
    async create(data: IPatient): Promise<IPatient> {
        const query = `
            INSERT INTO patients (full_name, dni, address, phone, birth_date)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        const { rows } = await pool.query(query, [data.full_name, data.dni, data.address, data.phone, data.birth_date]);
        return rows[0];
    },

    /**
     * Actualiza la información de un paciente existente.
     * @param id ID del paciente a actualizar.
     * @param data Datos parciales o totales a actualizar.
     * @returns El paciente actualizado o null.
     */
    async update(id: string, data: Partial<IPatient>): Promise<IPatient | null> {
        const query = `
            UPDATE patients
            SET full_name = $1, dni = $2, address = $3, phone = $4, birth_date = $5
            WHERE id = $6 RETURNING *`;
        const { rows } = await pool.query(query, [data.full_name, data.dni, data.address, data.phone, data.birth_date, id]);
        return rows[0] || null;
    },

    /**
     * Realiza una eliminación lógica de un paciente (cambia is_active a false).
     * @param id ID del paciente a eliminar.
     * @returns El registro actualizado o null.
     */
    async delete(id: string): Promise<IPatient | null> {
        const { rows } = await pool.query('UPDATE patients SET is_active = false WHERE id = $1', [id]);
        return rows[0] || null;
    },

    /**
     * Obtiene el historial detallado de atenciones de un paciente para mostrar en la interfaz.
     * @param patientId ID del paciente.
     * @returns Lista de atenciones con detalles de tratamiento, enfermera e insumos.
     */
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

    /**
     * Obtiene datos consolidados de atenciones para generar reportes en PDF.
     * @param id ID del paciente.
     * @returns Lista de atenciones formateada para el reporte.
     */
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

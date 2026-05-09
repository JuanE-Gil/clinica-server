/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import type { Request, Response } from 'express';
import pool from '../config/db.js';
import { generateClinicalReportPdf } from '../utils/pdf.generator.js';

export const getAllPatients = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM patients ORDER BY full_name ASC');
        console.log(`\n📦 [GET] Enviando ${result.rows.length} pacientes.`);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getPatientById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Paciente no encontrado' });
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getPatientHistory = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
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

        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const createPatient = async (req: Request, res: Response) => {
    const { full_name, dni, address, phone, birth_date } = req.body;
    try {
        const query =
            'INSERT INTO patients (full_name, dni, address, phone, birth_date) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const result = await pool.query(query, [full_name, dni, address, phone, birth_date]);
        console.log(`\n👤 [POST] Nuevo paciente: ${full_name}`);
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        if (err.code === '23505') return res.status(400).json({ error: 'El DNI ya existe.' });
        res.status(500).json({ error: err.message });
    }
};

export const updatePatient = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { full_name, dni, address, phone, birth_date } = req.body;
    try {
        const query =
            'UPDATE patients SET full_name = $1, dni = $2, address = $3, phone = $4, birth_date = $5 WHERE id = $6 RETURNING *';
        const result = await pool.query(query, [full_name, dni, address, phone, birth_date, id]);
        res.json(result.rows[0]);
    } catch (err: any) {
        if (err.code === '23505') return res.status(400).json({ error: 'El DNI ya existe.' });
        res.status(500).json({ error: err.message });
    }
};

export const deletePatient = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json({ message: 'Paciente eliminado' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getPatientDataForReport = async (id: string) => {
    const pRes = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
    const patient = pRes.rows[0];

    if (!patient) return null;

    const hRes = await pool.query(
        `
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
        ORDER BY h.administered_at DESC`,
        [id]
    );

    return {
        patient,
        history: hRes.rows,
    };
};

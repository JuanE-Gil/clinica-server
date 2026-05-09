/* eslint-disable max-len */
import type { Request, Response } from 'express';
import pool from '../config/db.js';

export const getAllNurses = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM nurses ORDER BY name ASC');
        console.log(`\n📦 [GET] Enviando ${result.rows.length} enfermeras.`);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getNurseById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM nurses WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Enfermera no encontrada' });
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const createNurse = async (req: Request, res: Response) => {
    const { name, license_number } = req.body;
    try {
        const result = await pool.query('INSERT INTO nurses (name, license_number) VALUES ($1, $2) RETURNING *', [
            name,
            license_number,
        ]);
        console.log(`\n👤 [POST] Nueva enfermera registrada: ${name}`);
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        if (err.code === '23505') return res.status(400).json({ error: 'El número de licencia ya existe.' });
        res.status(500).json({ error: err.message });
    }
};

export const updateNurse = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, license_number } = req.body;
    try {
        const result = await pool.query('UPDATE nurses SET name = $1, license_number = $2 WHERE id = $3 RETURNING *', [
            name,
            license_number,
            id,
        ]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrada' });
        console.log(`\n👤 [PUT] Enfermera actualizada: ${name}`);
        res.json(result.rows[0]);
    } catch (err: any) {
        if (err.code === '23505') return res.status(400).json({ error: 'El número de licencia ya existe.' });
        res.status(500).json({ error: err.message });
    }
};

export const deleteNurse = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM nurses WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrada' });
        console.log(`\n🗑️ [DELETE] Enfermera eliminada (ID: ${id})`);
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

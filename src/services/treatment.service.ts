import type { Request, Response } from 'express';
import pool from '../config/db.js';

export const getAllTreatments = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM treatments ORDER BY name ASC');
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

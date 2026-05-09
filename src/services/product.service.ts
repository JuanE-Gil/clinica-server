/* eslint-disable max-len */
import type { Request, Response } from 'express';
import pool from '../config/db.js';

export const getAllProducts = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY name ASC');
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const createNewProduct = async (req: Request, res: Response) => {
    const { name, amount, price_cost, price_sale } = req.body;

    if (price_cost < 0 || price_sale < 0 || amount < 0) {
        return res.status(400).json({ error: 'Valores negativos no permitidos.' });
    }

    try {
        const query = `
        INSERT INTO products (name, amount, price_cost, price_sale) VALUES ($1, $2, $3, $4) RETURNING *`;
        const result = await pool.query(query, [name, amount, price_cost, price_sale]);
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, amount, price_cost, price_sale } = req.body;

    try {
        const query = `
            UPDATE products
            SET name = $1, amount = $2, price_cost = $3, price_sale = $4
            WHERE id = $5
            RETURNING *`;
        const result = await pool.query(query, [name, amount, price_cost, price_sale, id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json({ message: 'Producto eliminado', product: result.rows[0] });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getProductsForReport = async () => {
    const result = await pool.query('SELECT name, amount, price_cost, price_sale FROM products ORDER BY amount ASC');
    return result.rows;
};

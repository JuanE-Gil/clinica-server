import pool from '../config/db.js';
import type { PoolClient } from 'pg';

export interface IProduct {
    id?: string;
    name: string;
    amount: number;
    price_cost: number;
    price_sale: number;
    created_at?: Date;
}

export const ProductModel = {
    async findAll(): Promise<IProduct[]> {
        const { rows } = await pool.query('SELECT * FROM products WHERE is_active = true ORDER BY name ASC');
        return rows;
    },

    async findById(id: string): Promise<IProduct | null> {
        const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        return rows[0] || null;
    },

    async create(data: IProduct): Promise<IProduct> {
        const query = `
            INSERT INTO products (name, amount, price_cost, price_sale)
            VALUES ($1, $2, $3, $4) RETURNING *`;
        const { rows } = await pool.query(query, [data.name, data.amount, data.price_cost, data.price_sale]);
        return rows[0];
    },

    async update(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
        const query = `
            UPDATE products
            SET name = $1, amount = $2, price_cost = $3, price_sale = $4
            WHERE id = $5 RETURNING *`;
        const { rows } = await pool.query(query, [data.name, data.amount, data.price_cost, data.price_sale, id]);
        return rows[0] || null;
    },

    async delete(id: string): Promise<IProduct | null> {
        const { rows } = await pool.query('UPDATE products SET is_active = false WHERE id = $1', [id]);
        return rows[0] || null;
    },

    async findAllForReport(): Promise<IProduct[]> {
        const { rows } = await pool.query('SELECT name, amount, price_cost, price_sale FROM products ORDER BY amount ASC');
        return rows;
    },

    async updateStockWithClient(client: PoolClient, id: string, quantity: number) {
        const query = `
            UPDATE products
            SET amount = amount - $1
            WHERE id = $2
            RETURNING amount`;

        const { rows } = await client.query(query, [quantity, id]);
        return rows[0];
    },
};

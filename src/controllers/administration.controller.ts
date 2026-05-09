/* eslint-disable max-len */
import type { Request, Response } from 'express';
import pool from '../config/db.js';

export const createAdministration = async (req: Request, res: Response) => {
    const { patientId, nurseId, treatmentId, items } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Obtener costo base actual del tratamiento
        const tRes = await client.query('SELECT base_cost FROM treatments WHERE id = $1', [treatmentId]);
        const baseCost = tRes.rows[0].base_cost;

        // 2. Insertar Cabecera
        const hRes = await client.query(
            'INSERT INTO administration_header (patient_id, nurse_id, treatment_id, base_cost_at_time) VALUES ($1, $2, $3, $4) RETURNING id',
            [patientId, nurseId, treatmentId, baseCost]
        );
        const headerId = hRes.rows[0].id;

        // 3. Procesar Insumos y Actualizar Stock
        for (const item of items) {
            const pRes = await client.query('SELECT price_sale, amount, name FROM products WHERE id = $1', [item.productId]);
            const prod = pRes.rows[0];

            if (prod.amount < item.quantity) {
                throw new Error(`Stock insuficiente para: ${prod.name}`);
            }

            await client.query(
                'INSERT INTO administration_items (header_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4)',
                [headerId, item.productId, item.quantity, prod.price_sale]
            );

            await client.query('UPDATE products SET amount = amount - $1 WHERE id = $2', [item.quantity, item.productId]);
        }

        await client.query('COMMIT');
        console.log(`\n✅ [ADMIN] Atención registrada con éxito (ID: ${headerId})`);
        res.status(201).json({ message: 'Atención registrada correctamente', id: headerId });
    } catch (err: any) {
        await client.query('ROLLBACK');
        console.error(`\n❌ [ADMIN] Error: ${err.message}`);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

/* eslint-disable max-len */
import type { PoolClient } from 'pg';

export interface IAdministrationItem {
    productId: string;
    quantity: number;
    price_at_time?: number;
}

export interface IAdministration {
    patientId: string;
    nurseId: string;
    treatmentId: string;
    items: IAdministrationItem[];
}

export const AdministrationModel = {
    // Insertar la cabecera del registro médico
    async createHeader(
        client: PoolClient,
        data: { patientId: string; nurseId: string; treatmentId: string; baseCost: number }
    ) {
        const query = `
            INSERT INTO administration_header (patient_id, nurse_id, treatment_id, base_cost_at_time) 
            VALUES ($1, $2, $3, $4) RETURNING id`;
        const { rows } = await client.query(query, [data.patientId, data.nurseId, data.treatmentId, data.baseCost]);
        return rows[0].id;
    },

    // Insertar cada insumo utilizado en esa sesión
    async createItem(
        client: PoolClient,
        data: { headerId: string; productId: string; quantity: number; priceAtTime: number }
    ) {
        const query = `
            INSERT INTO administration_items (header_id, product_id, quantity, price_at_time) 
            VALUES ($1, $2, $3, $4)`;
        await client.query(query, [data.headerId, data.productId, data.quantity, data.priceAtTime]);
    },
};

/**
 * Modelo para la gestión de administraciones médicas en PostgreSQL.
 */
import type { PoolClient } from 'pg';

/**
 * Interfaz que define un insumo utilizado en una administración.
 */
export interface IAdministrationItem {
    productId: string;
    quantity: number;
    price_at_time?: number;
}

/**
 * Interfaz que define la estructura de una administración médica completa.
 */
export interface IAdministration {
    patientId: string;
    nurseId: string;
    treatmentId: string;
    items: IAdministrationItem[];
}

/**
 * Objeto con operaciones de base de datos para Administraciones.
 */
export const AdministrationModel = {
    /**
     * Inserta la cabecera de un registro de atención médica.
     * @param client Cliente de PostgreSQL (para transacciones).
     * @param data Datos de la cabecera.
     */
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

    /**
     * Inserta un detalle de insumo vinculado a una cabecera de atención.
     * @param client Cliente de PostgreSQL.
     * @param data Datos del item.
     */
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

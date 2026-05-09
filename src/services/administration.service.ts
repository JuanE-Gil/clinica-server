/* eslint-disable max-len */
import pool from '../config/db.js';
import { AdministrationModel, type IAdministration } from '../models/administration.model.js';
import { ProductModel } from '../models/product.model.js';
import { TreatmentModel } from '../models/treatment.model.js';

export const processMedicalAdministration = async (data: IAdministration) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Inicio de la transacción atómica

        // 1. Obtener el costo base actual del tratamiento
        const treatment = await TreatmentModel.findById(data.treatmentId);
        if (!treatment) throw new Error('El tratamiento seleccionado no existe.');

        // 2. Crear la cabecera
        const headerId = await AdministrationModel.createHeader(client, {
            patientId: data.patientId,
            nurseId: data.nurseId,
            treatmentId: data.treatmentId,
            baseCost: treatment.base_cost,
        });

        // 3. Procesar cada insumo
        for (const item of data.items) {
            const product = await ProductModel.findById(item.productId);

            if (!product) throw new Error(`Producto con ID ${item.productId} no encontrado.`);
            if (product.amount < item.quantity) {
                throw new Error(`Stock insuficiente para: ${product.name}. Disponible: ${product.amount}`);
            }

            // Registrar el item con el precio de venta del momento
            await AdministrationModel.createItem(client, {
                headerId,
                productId: item.productId,
                quantity: item.quantity,
                priceAtTime: product.price_sale,
            });

            // Actualizar el stock en la tabla de productos
            await ProductModel.updateStockWithClient(client, item.productId, item.quantity);
        }

        await client.query('COMMIT');
        return { success: true, headerId };
    } catch (err: any) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

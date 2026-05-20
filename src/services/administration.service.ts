/**
 * Servicio para procesar administraciones médicas (atenciones).
 * Gestiona la lógica de negocio compleja, incluyendo transacciones de base de datos y control de stock.
 */
import pool from '../config/db.js';
import { AdministrationModel, type IAdministration } from '../models/administration.model.js';
import { ProductModel } from '../models/product.model.js';
import { TreatmentModel } from '../models/treatment.model.js';

/**
 * Procesa una administración médica completa de forma atómica.
 * Registra la cabecera, los items (insumos) utilizados y actualiza el stock de productos.
 * @param data Datos de la administración médica.
 * @returns Objeto con el estado de la operación y el ID de la cabecera generada.
 * @throws Error si el tratamiento no existe, si algún producto no existe o si no hay stock suficiente.
 */
export const processMedicalAdministration = async (data: IAdministration) => {
    // Se obtiene un cliente del pool para manejar la transacción de forma manual
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Inicio de la transacción atómica

        // 1. Obtener el costo base actual del tratamiento para persistirlo en el historial
        const treatment = await TreatmentModel.findById(data.treatmentId);
        if (!treatment) throw new Error('El tratamiento seleccionado no existe.');

        // 2. Crear la cabecera de la administración médica
        const headerId = await AdministrationModel.createHeader(client, {
            patientId: data.patientId,
            nurseId: data.nurseId,
            treatmentId: data.treatmentId,
            baseCost: treatment.base_cost,
        });

        // 3. Procesar cada insumo (producto) utilizado en la atención
        for (const item of data.items) {
            const product = await ProductModel.findById(item.productId);

            if (!product) throw new Error(`Producto con ID ${item.productId} no encontrado.`);
            
            // Verificación crítica de disponibilidad de stock
            if (product.amount < item.quantity) {
                throw new Error(`Stock insuficiente para: ${product.name}. Disponible: ${product.amount}`);
            }

            // Registrar el item vinculado a la cabecera con el precio de venta actual
            await AdministrationModel.createItem(client, {
                headerId,
                productId: item.productId,
                quantity: item.quantity,
                priceAtTime: product.price_sale,
            });

            // Actualizar (restar) el stock en la tabla de productos dentro de la misma transacción
            await ProductModel.updateStockWithClient(client, item.productId, item.quantity);
        }

        // Si todo es correcto, se confirman los cambios en la base de datos
        await client.query('COMMIT');
        return { success: true, headerId };
    } catch (err: any) {
        // En caso de cualquier error, se deshacen todos los cambios realizados en la transacción
        await client.query('ROLLBACK');
        throw err;
    } finally {
        // Se libera el cliente de vuelta al pool
        client.release();
    }
};

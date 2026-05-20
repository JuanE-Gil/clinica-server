/**
 * Servicio para la gestión de productos e inventario.
 */
import { ProductModel, type IProduct } from '../models/product.model.js';

/**
 * Obtiene la lista completa de productos disponibles.
 */
export const getAllProducts = async () => {
    return await ProductModel.findAll();
};

/**
 * Busca un producto por su ID único.
 * @param id ID del producto.
 */
export const getProductById = async (id: string) => {
    const product = await ProductModel.findById(id);
    if (!product) throw new Error('Producto no encontrado');
    return product;
};

/**
 * Registra un nuevo producto en el inventario.
 * @param data Datos del producto.
 * @throws Error si los valores numéricos son negativos.
 */
export const createNewProduct = async (data: IProduct) => {
    if (data.price_cost < 0 || data.price_sale < 0 || data.amount < 0) {
        throw new Error('No se permiten valores negativos en el inventario.');
    }

    return await ProductModel.create(data);
};

/**
 * Actualiza la información de un producto.
 * @param id ID del producto.
 * @param data Datos parciales a actualizar.
 */
export const updateProduct = async (id: string, data: Partial<IProduct>) => {
    const product = await ProductModel.findById(id);
    if (!product) throw new Error('El producto que intenta actualizar no existe.');

    const updated = await ProductModel.update(id, data);
    return updated;
};

/**
 * Elimina un producto del sistema.
 * @param id ID del producto.
 */
export const deleteProduct = async (id: string) => {
    const deleted = await ProductModel.delete(id);
    if (!deleted) throw new Error('No se pudo eliminar: Producto no encontrado.');

    return deleted;
};

/**
 * Obtiene los productos con datos optimizados para reportes de inventario.
 */
export const getProductsForReport = async () => {
    return await ProductModel.findAllForReport();
};

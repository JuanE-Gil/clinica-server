import { ProductModel, type IProduct } from '../models/product.model.js';

// 1. Obtener todos los productos
export const getAllProducts = async () => {
    return await ProductModel.findAll();
};

// 2. Obtener un producto por ID
export const getProductById = async (id: string) => {
    const product = await ProductModel.findById(id);
    if (!product) throw new Error('Producto no encontrado');
    return product;
};

// 3. Crear un nuevo producto
export const createNewProduct = async (data: IProduct) => {
    if (data.price_cost < 0 || data.price_sale < 0 || data.amount < 0) {
        throw new Error('No se permiten valores negativos en el inventario.');
    }

    return await ProductModel.create(data);
};

// 4. Actualizar un producto
export const updateProduct = async (id: string, data: Partial<IProduct>) => {
    const product = await ProductModel.findById(id);
    if (!product) throw new Error('El producto que intenta actualizar no existe.');

    const updated = await ProductModel.update(id, data);
    return updated;
};

// 5. Eliminar un producto
export const deleteProduct = async (id: string) => {
    const deleted = await ProductModel.delete(id);
    if (!deleted) throw new Error('No se pudo eliminar: Producto no encontrado.');

    return deleted;
};

// 6. Obtener datos para el reporte
export const getProductsForReport = async () => {
    return await ProductModel.findAllForReport();
};

/**
 * Controlador para la gestión de productos e inventario.
 */
import type { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service.js';
import { generateInventoryReportPdf } from '../utils/pdf.generator.js';
import { ValidationError, NotFoundError } from '../utils/errors/AppError.js';

/**
 * Obtiene la lista completa de productos.
 * @param _req Objeto de petición (no utilizado).
 * @param res Objeto de respuesta.
 */
export const getAllProducts = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await productService.getAllProducts();
        res.json({
            status: 'success',
            data: products
        });
    } catch (err: any) {
        next(err);
    }
};

/**
 * Busca un producto por su ID único.
 * @param req Objeto de petición que contiene el ID.
 * @param res Objeto de respuesta.
 */
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError('El ID es obligatorio', [], 'MISSING_ID');
        }

        const product = await productService.getProductById(id as string);
        if (!product) {
            throw new NotFoundError('Producto no encontrado', 'PRODUCT_NOT_FOUND');
        }

        res.json({
            status: 'success',
            data: product
        });
    } catch (err: any) {
        next(err);
    }
};

/**
 * Registra un nuevo producto en el inventario.
 * @param req Objeto de petición que contiene los datos del producto.
 * @param res Objeto de respuesta.
 */
export const createNewProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const createdProduct = await productService.createNewProduct(req.body);
        res.status(201).json({
            status: 'success',
            data: createdProduct
        });
    } catch (err: any) {
        next(err);
    }
};

/**
 * Actualiza la información de un producto existente.
 * @param req Objeto de petición que contiene el ID y los datos.
 * @param res Objeto de respuesta.
 */
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError('El ID es obligatorio', [], 'MISSING_ID');
        }

        const updatedProduct = await productService.updateProduct(id as string, req.body);
        res.json({
            status: 'success',
            data: updatedProduct
        });
    } catch (err: any) {
        next(err);
    }
};

/**
 * Elimina un producto del sistema.
 * @param req Objeto de petición que contiene el ID.
 * @param res Objeto de respuesta.
 */
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError('El ID es obligatorio', [], 'MISSING_ID');
        }

        const result = await productService.deleteProduct(id as string);
        res.json({
            status: 'success',
            message: 'Producto eliminado correctamente',
            data: result
        });
    } catch (err: any) {
        next(err);
    }
};

/**
 * Genera y descarga el reporte de inventario en formato PDF.
 * @param _req Objeto de petición (no utilizado).
 * @param res Objeto de respuesta.
 */
export const getInventoryReport = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await productService.getProductsForReport();

        if (!products || products.length === 0) {
            throw new NotFoundError('No hay productos para generar el reporte.', 'INVENTORY_EMPTY');
        }

        const buffer = await generateInventoryReportPdf(products);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Inventario_SaidSalud.pdf');
        res.send(buffer);
    } catch (err: any) {
        console.error('❌ Error en reporte:', err.message);
        next(err);
    }
};

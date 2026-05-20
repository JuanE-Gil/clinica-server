/**
 * Controlador para la gestión de productos e inventario.
 */
import type { Request, Response } from 'express';
import * as productService from '../services/product.service.js';
import { generateInventoryReportPdf } from '../utils/pdf.generator.js';

/**
 * Obtiene la lista completa de productos.
 * @param _req Objeto de petición (no utilizado).
 * @param res Objeto de respuesta.
 */
export const getAllProducts = async (_req: Request, res: Response) => {
    try {
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (err: any) {
        res.status(500).json({ error: 'Error al obtener productos', message: err.message });
    }
};

/**
 * Busca un producto por su ID único.
 * @param req Objeto de petición que contiene el ID.
 * @param res Objeto de respuesta.
 */
export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'El ID es obligatorio' });
        }

        const product = await productService.getProductById(id as string);
        res.json(product);
    } catch (err: any) {
        res.status(404).json({ error: err.message });
    }
};

/**
 * Registra un nuevo producto en el inventario.
 * @param req Objeto de petición que contiene los datos del producto.
 * @param res Objeto de respuesta.
 */
export const createNewProduct = async (req: Request, res: Response) => {
    try {
        const createdProduct = await productService.createNewProduct(req.body);
        res.status(201).json(createdProduct);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Actualiza la información de un producto existente.
 * @param req Objeto de petición que contiene el ID y los datos.
 * @param res Objeto de respuesta.
 */
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'El ID es obligatorio' });
        }

        const updatedProduct = await productService.updateProduct(id as string, req.body);
        res.json(updatedProduct);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Elimina un producto del sistema.
 * @param req Objeto de petición que contiene el ID.
 * @param res Objeto de respuesta.
 */
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'El ID es obligatorio' });
        }

        const result = await productService.deleteProduct(id as string);
        res.json({ message: 'Producto eliminado correctamente', product: result });
    } catch (err: any) {
        res.status(404).json({ error: err.message });
    }
};

/**
 * Genera y descarga el reporte de inventario en formato PDF.
 * @param _req Objeto de petición (no utilizado).
 * @param res Objeto de respuesta.
 */
export const getInventoryReport = async (_req: Request, res: Response) => {
    try {
        const products = await productService.getProductsForReport();

        if (!products || products.length === 0) {
            return res.status(404).json({ error: 'No hay productos para generar el reporte.' });
        }

        const buffer = await generateInventoryReportPdf(products);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Inventario_SaidSalud.pdf');
        res.send(buffer);
    } catch (err: any) {
        console.error('❌ Error en reporte:', err.message);
        res.status(500).json({ error: 'Error al generar el PDF del inventario.' });
    }
};

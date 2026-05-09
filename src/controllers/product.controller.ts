import type { Request, Response } from 'express';
import * as productService from '../services/product.service.js';
import { generateInventoryReportPdf } from '../utils/pdf.generator.js';

// 1. Obtener todos los productos
export const getAllProducts = async (_req: Request, res: Response) => {
    try {
        const products = await productService.getAllProducts();
        res.json(products);
    } catch (err: any) {
        res.status(500).json({ error: 'Error al obtener productos', message: err.message });
    }
};

// 2. Obtener un producto por ID
export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'El ID es obligatorio' });
        }

        const product = await productService.getProductById(id as string);
        res.json(product);
    } catch (err: any) {
        // Si el servicio lanza "Producto no encontrado", devolvemos 404
        res.status(404).json({ error: err.message });
    }
};

// 3. Crear nuevo producto
export const createNewProduct = async (req: Request, res: Response) => {
    try {
        // Pasamos req.body directamente al servicio
        const createdProduct = await productService.createNewProduct(req.body);
        res.status(201).json(createdProduct);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// 4. Actualizar producto
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

// 5. Eliminar producto
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

// 6. Generar reporte PDF
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

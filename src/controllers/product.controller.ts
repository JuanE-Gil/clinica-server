import type { Request, Response } from 'express';
import { generateInventoryReportPdf } from '../utils/pdf.generator.js';

import * as productService from '../services/product.service.js';

export const getAllProducts = async (_req: Request, res: Response) => {
    const allProducts = await productService.getAllProducts(_req, res);
    res.json(allProducts);
};

export const getProductById = async (req: Request, res: Response) => {
    const productById = await productService.getProductById(req, res);
    res.json(productById);
};

export const createNewProduct = async (req: Request, res: Response) => {
    const createdProduct = await productService.createNewProduct(req, res);
    res.json(createdProduct);
};

export const updateProduct = async (req: Request, res: Response) => {
    const updatedProduct = await productService.updateProduct(req, res);
    res.json(updatedProduct);
};

export const deleteProduct = async (req: Request, res: Response) => {
    const deletedProduct = await productService.deleteProduct(req, res);
    res.json(deletedProduct);
};

export const getInventoryReport = async (req: Request, res: Response) => {
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

import { Router } from 'express';
import * as productCtrl from '../../controllers/product.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Gestión de inventario de insumos clínicos
 */

/**
 * @swagger
 * /products/:
 *  get:
 *    summary: Listado completo de inventario
 *    tags: [Products]
 *  responses:
 *    200:
 *      description: Lista de productos obtenida
 *    content:
 *      application/json:
 *        schema:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/Product'
 */
router.get('/', productCtrl.getAllProducts);

/**
 * @swagger
 * /products/report:
 *   get:
 *     summary: Descargar inventario completo en PDF
 *     tags: [Products]
 *   responses:
 *     200:
 *       description: Archivo PDF del inventario
 */
router.get('/report', productCtrl.getInventoryReport);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Buscar por ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           items:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Producto encontrado
 */
router.get('/:id', productCtrl.getProductById);

/**
 * @swagger
 * /products/:
 *   post:
 *     summary: Registrar producto
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Creado
 */
router.post('/', productCtrl.createNewProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Actualizar producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Producto actualizado con éxito
 *       404:
 *         description: No se encontró el producto
 */
router.put('/:id', productCtrl.updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Eliminar producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Eliminado
 */
router.delete('/:id', productCtrl.deleteProduct);

export default router;

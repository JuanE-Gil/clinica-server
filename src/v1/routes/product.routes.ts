import { Router } from 'express';
import * as productCtrl from '../../controllers/product.controller.js';
import { verifyToken, checkRole } from '../../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

const allowAll = checkRole(['admin', 'user']);
const allowAdmin = checkRole(['admin']);

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Gestión de inventario de insumos clínicos
 */

/**
 * @swagger
 * /products/:
 *   get:
 *     summary: Listado completo de inventario
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de productos obtenida
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', allowAll, productCtrl.getAllProducts);

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
router.get('/report', allowAll, productCtrl.getInventoryReport);

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
 *           format: uuid
 *     responses:
 *       200:
 *         description: Producto encontrado
 */
router.get('/:id', allowAll, productCtrl.getProductById);

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
router.post('/', allowAll, productCtrl.createNewProduct);

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
router.put('/:id', allowAll, productCtrl.updateProduct);

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
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Eliminado
 */
router.delete('/:id', allowAdmin, productCtrl.deleteProduct);

export default router;

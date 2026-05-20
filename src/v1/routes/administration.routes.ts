/**
 * Rutas para la gestión de administraciones médicas.
 * Define los endpoints relacionados con el registro de atenciones.
 */
import { Router } from 'express';
import * as adminCtrl from '../../controllers/administration.controller.js';
import { verifyToken, checkRole } from '../../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

const allowAll = checkRole(['admin', 'user']);

/**
 * @swagger
 * /administration:
 *   post:
 *     summary: Registrar una nueva atención médica (Cabecera + Insumos)
 *     description: Registra una atención médica completa, incluyendo el historial y el descuento automático de stock.
 *     tags: [Administration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Administration'
 *     responses:
 *       201:
 *         description: Atención registrada y stock actualizado con éxito.
 *       400:
 *         description: Error en la solicitud o stock insuficiente.
 *       500:
 *         description: Error interno del servidor o falla en la transacción.
 */
router.post('/', allowAll, adminCtrl.createNewAdministration);

export default router;

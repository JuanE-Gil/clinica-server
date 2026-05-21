/**
 * Rutas para la gestión de tratamientos y procedimientos.
 */
import { Router } from 'express';
import * as treatCtrl from '../../controllers/treatment.controller.js';
import { verifyToken, checkRole } from '../../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

const allowAll = checkRole(['admin', 'nurse', 'user']);

/**
 * @swagger
 * tags:
 *   - name: Treatments
 *     description: Gestión de catálogos de tratamientos y procedimientos
 */

/**
 * @swagger
 * /treatments:
 *   get:
 *     summary: Listado de todos los tratamientos disponibles
 *     tags: [Treatments]
 *     responses:
 *       200:
 *         description: Lista obtenida exitosamente
 */
router.get('/', allowAll, treatCtrl.getAllTreatments);

export default router;

/**
 * Rutas para la gestión de tratamientos y procedimientos.
 */
import { Router } from 'express';
import * as treatCtrl from '../../controllers/treatment.controller.js';

const router = Router();

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
router.get('/', treatCtrl.getAllTreatments);

export default router;

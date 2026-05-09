import { Router } from 'express';
import * as treatCtrl from '../../controllers/treatment.controller.js';

const router = Router();

/**
 * @swagger
 * /treatments:
 *   get:
 *     summary: Listado de tratamientos disponibles
 *     tags: [Treatments]
 *     responses:
 *       200:
 *         description: Lista obtenida
 */
router.get('/', treatCtrl.getAllTreatments);

export default router;

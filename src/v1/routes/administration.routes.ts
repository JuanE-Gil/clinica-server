import { Router } from 'express';
import * as adminCtrl from '../../controllers/administration.controller.js';

const router = Router();

/**
 * @swagger
 * /administration:
 *   post:
 *     summary: Registrar una nueva atención médica (Header + Items)
 *     tags: [Administration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Administration'
 *     responses:
 *       201:
 *         description: Atención registrada y stock actualizado
 *       500:
 *         description: Error en transacción o stock insuficiente
 */
router.post('/', adminCtrl.createAdministration);

export default router;

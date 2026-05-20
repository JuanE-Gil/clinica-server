/**
 * Rutas para la gestión de autenticación.
 */
import { Router } from 'express';
import { login } from '../../controllers/auth.controller.js';

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión en el sistema
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: admin@saidsalud.com }
 *               password: { type: string, example: 123456 }
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', login);

export default router;

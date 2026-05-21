import { Router } from 'express';
import * as nurseCtrl from '../../controllers/nurse.controller.js';
import { verifyToken, checkRole } from '../../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

const allowAll = checkRole(['admin', 'nurse', 'user']);
const allowAdmin = checkRole(['admin']);

// Middleware para validar si el usuario es el dueño del perfil o admin
const allowSelfOrAdmin = (req: any, res: any, next: any) => {
    const user = req.user;
    const { id } = req.params;

    if (user.role === 'admin' || user.nurse_id === id) {
        return next();
    }

    return res.status(403).json({
        status: 'error',
        message: 'Acceso denegado: solo puedes consultar tu propio perfil',
        code: 'FORBIDDEN'
    });
};

/**
 * @swagger
 * tags:
 *   - name: Nurses
 *     description: Gestión del personal de enfermería
 */

/**
 * @swagger
 * /nurses/:
 *   get:
 *     summary: Listado de todo el personal de enfermería
 *     tags:
 *       - Nurses
 *     responses:
 *       200:
 *         description: Lista obtenida
 */
router.get('/', allowAdmin, nurseCtrl.getAllNurses);

/**
 * @swagger
 * /nurses/:
 *   post:
 *     summary: Registrar una nueva enfermera
 *     tags:
 *       - Nurses
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Nurse'
 *     responses:
 *       201:
 *         description: Registro exitoso
 */
router.post('/', allowAdmin, nurseCtrl.createNewNurse);

/**
 * @swagger
 * /nurses/{id}:
 *   get:
 *     summary: Buscar enfermera por ID
 *     tags:
 *       - Nurses
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *   put:
 *     summary: Actualizar datos de enfermera
 *     tags:
 *       - Nurses
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Nurse'
 *   delete:
 *     summary: Eliminar registro de enfermera
 *     tags:
 *       - Nurses
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.get('/:id', allowSelfOrAdmin, nurseCtrl.getNurseById);
router.put('/:id', allowSelfOrAdmin, nurseCtrl.updateNurseById);
router.delete('/:id', allowAdmin, nurseCtrl.deleteNurseById);

export default router;

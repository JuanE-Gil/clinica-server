import { Router } from 'express';
import * as nurseCtrl from '../../controllers/nurse.controller.js';

const router = Router();

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
router.get('/', nurseCtrl.getAllNurses);

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
router.post('/', nurseCtrl.createNewNurse);

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
router.get('/:id', nurseCtrl.getNurseById);
router.put('/:id', nurseCtrl.updateNurseById);
router.delete('/:id', nurseCtrl.deleteNurseById);

export default router;

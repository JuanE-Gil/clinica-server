import { Router } from 'express';
import * as patientCtrl from '../../controllers/patient.controller.js';
import { verifyToken, checkRole } from '../../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

const allowAll = checkRole(['admin', 'nurse', 'user']);
const allowAdmin = checkRole(['admin']);

/**
 * @swagger
 * tags:
 *   - name: Patients
 *     description: Gestión de pacientes y sus historiales clínicos
 */

/**
 * @swagger
 * /patients/:
 *   get:
 *     summary: Lista completa de pacientes
 *     tags:
 *       - Patients
 *     responses:
 *       200:
 *         description: Lista obtenida exitosamente
 */
router.get('/', allowAll, patientCtrl.getAllPatients);

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Obtener un paciente por ID
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paciente encontrado
 */
router.get('/:id', allowAll, patientCtrl.getPatientById);

/**
 * @swagger
 * /patients/{id}/report:
 *   get:
 *     summary: Generar historial clínico en PDF para un paciente
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 */
router.get('/:id/report', allowAll, patientCtrl.getPatientClinicalReport);

/**
 * @swagger
 * /patients/{id}/history:
 *   get:
 *     summary: Obtener historial de atenciones de un paciente
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial clínico detallado
 */
router.get('/:id/history', allowAll, patientCtrl.getPatientHistory);

/**
 * @swagger
 * /patients/:
 *   post:
 *     summary: Registrar nuevo paciente
 *     tags:
 *       - Patients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       201:
 *         description: Paciente registrado
 */
router.post('/', allowAll, patientCtrl.createNewPatient);

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     summary: Actualizar datos del paciente
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       200:
 *         description: Actualizado correctamente
 */
router.put('/:id', allowAll, patientCtrl.updatePatientById);

/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Eliminar paciente
 *     tags:
 *       - Patients
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paciente eliminado
 */
router.delete('/:id', allowAdmin, patientCtrl.deletePatientById);

export default router;

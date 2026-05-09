import { Router } from 'express';
import * as dashCtrl from '../../controllers/dashboard.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Estadísticas generales y métricas de rendimiento
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Obtener todas las métricas para los gráficos del dashboard
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Datos procesados para Charts y KPIs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStats'
 */
router.get('/stats', dashCtrl.getDashboardStats);

/**
 * @swagger
 * /dashboard/recent-activity:
 *   get:
 *     summary: Obtener los últimos 4 registros de actividad clínica
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Lista de actividad reciente para widgets laterales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nurse:
 *                     type: string
 *                   treatment:
 *                     type: string
 *                   cost:
 *                     type: number
 *                   date:
 *                     type: string
 *                     format: date-time
 */
router.get('/recent-activity', dashCtrl.getRecentActivityList);

/**
 * @swagger
 * /dashboard/report:
 *   get:
 *     summary: Generar reporte gerencial consolidado (KPIs y Gráficos)
 *     tags:
 *       - Dashboard
 */
router.get('/report', dashCtrl.getManagementReport);

export default router;

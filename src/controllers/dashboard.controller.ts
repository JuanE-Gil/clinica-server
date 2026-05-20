/**
 * Controlador para la visualización de estadísticas y actividad en el tablero (dashboard).
 */
/* eslint-disable no-unused-vars */
import type { Request, Response } from 'express';
import * as dashService from '../services/dashboard.service.js';
import { generateManagementReportPdf } from '../utils/pdf.generator.js';

/**
 * Obtiene las estadísticas generales para el dashboard.
 * @param _req Objeto de petición (no utilizado).
 * @param res Objeto de respuesta.
 */
export const getDashboardStats = async (_req: Request, res: Response) => {
    try {
        const stats = await dashService.getFullStats();
        res.json(stats);
    } catch (err: any) {
        res.status(500).json({ error: 'Error al cargar estadísticas' });
    }
};

/**
 * Obtiene la lista de actividades recientes.
 * @param _req Objeto de petición (no utilizado).
 * @param res Objeto de respuesta.
 */
export const getRecentActivityList = async (_req: Request, res: Response) => {
    try {
        const activity = await dashService.getRecentActivity();
        res.json(activity);
    } catch (err) {
        res.status(500).json({ error: 'Error al cargar actividad' });
    }
};

/**
 * Genera y descarga el reporte de gestión en formato PDF.
 * @param _req Objeto de petición (no utilizado).
 * @param res Objeto de respuesta.
 */
export const getManagementReport = async (_req: Request, res: Response) => {
    try {
        const data = await dashService.getFullStats();

        const statsData = {
            kpis: data.kpis,
            treatments: data.treatments,
            stockAlerts: data.stockAlerts,
        };

        const buffer = await generateManagementReportPdf(statsData);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Gestion_SaidSalud.pdf');
        res.send(buffer);
    } catch (err) {
        res.status(500).json({ error: 'Error al generar reporte de gestión' });
    }
};

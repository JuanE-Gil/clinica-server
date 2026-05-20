/**
 * Controlador para la visualización de estadísticas y actividad en el tablero (dashboard).
 */
/* eslint-disable no-unused-vars */
import type { Request, Response, NextFunction } from 'express';
import * as dashService from '../services/dashboard.service.js';
import { generateManagementReportPdf } from '../utils/pdf.generator.js';

/**
 * Obtiene las estadísticas generales para el dashboard.
 * @param _req Objeto de petición (no utilizado).
 * @param res Objeto de respuesta.
 */
export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await dashService.getFullStats();
        res.json({
            status: 'success',
            data: stats
        });
    } catch (err: any) {
        next(err);
    }
};

/**
 * Obtiene la lista de actividades recientes.
 * @param _req Objeto de petición (no utilizado).
 * @param res Objeto de respuesta.
 */
export const getRecentActivityList = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const activity = await dashService.getRecentActivity();
        res.json({
            status: 'success',
            data: activity
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Genera y descarga el reporte de gestión en formato PDF.
 * @param _req Objeto de petición (no utilizado).
 * @param res Objeto de respuesta.
 */
export const getManagementReport = async (_req: Request, res: Response, next: NextFunction) => {
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
        next(err);
    }
};

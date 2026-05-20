/**
 * Controlador para la visualización de estadísticas y actividad en el tablero (dashboard).
 */
/* eslint-disable no-unused-vars */
import type { Request, Response, NextFunction } from 'express';
import * as dashService from '../services/dashboard.service.js';
import { generateManagementReportPdf } from '../utils/pdf/index.js';

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

        // Mapear los datos de kpis directamente al objeto que espera el generador
        const statsData = {
            ...data.kpis,
            treatments: data.treatments,
            stockAlerts: data.stockAlerts,
            recentActivity: data.recentActivity,
            revenueData: data.revenueData,
            todayAttentions: data.todayAttentions
        };

        const buffer = await generateManagementReportPdf(statsData);

        if (!buffer || buffer.length === 0) {
            throw new Error('El buffer del PDF de gestión está vacío');
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Reporte_Gestion_SaidSalud.pdf"');
        res.setHeader('Content-Length', buffer.length.toString());
        
        return res.end(buffer);
    } catch (err) {
        next(err);
    }
};

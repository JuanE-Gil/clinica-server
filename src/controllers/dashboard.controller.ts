/* eslint-disable no-unused-vars */
import type { Request, Response } from 'express';
import * as dashService from '../services/dashboard.service.js';
import { generateManagementReportPdf } from '../utils/pdf.generator.js';

export const getDashboardStats = async (_req: Request, res: Response) => {
    try {
        const stats = await dashService.getFullStats();
        res.json(stats);
    } catch (err: any) {
        res.status(500).json({ error: 'Error al cargar estadísticas' });
    }
};

export const getRecentActivityList = async (_req: Request, res: Response) => {
    try {
        const activity = await dashService.getRecentActivity();
        res.json(activity);
    } catch (err) {
        res.status(500).json({ error: 'Error al cargar actividad' });
    }
};

export const getManagementReport = async (_req: Request, res: Response) => {
    try {
        // Reutilizamos la lógica del servicio para obtener los datos del reporte
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

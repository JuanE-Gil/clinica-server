/* eslint-disable no-unused-vars */
import type { Request, Response } from 'express';
import pool from '../config/db.js';
import { generateManagementReportPdf } from '../utils/pdf.generator.js';

export const getDashboardStats = async (_req: Request, res: Response) => {
    try {
        // 1. Flujo de Caja: Ingresos vs Costos (Últimos 6 meses)
        const revenueRes = await pool.query(`
            SELECT 
                TO_CHAR(h.administered_at, 'Mon') as month,
                SUM(h.base_cost_at_time + COALESCE((
                    SELECT SUM(i.quantity * i.price_at_time)
                    FROM administration_items i WHERE i.header_id = h.id
                ), 0))::float as income,
                SUM(COALESCE((
                    SELECT SUM(i.quantity * p.price_cost)
                    FROM administration_items i 
                    JOIN products p ON i.product_id = p.id
                    WHERE i.header_id = h.id
                ), 0))::float as cost
            FROM administration_header h
            GROUP BY TO_CHAR(h.administered_at, 'Mon'), DATE_TRUNC('month', h.administered_at)
            ORDER BY DATE_TRUNC('month', h.administered_at) DESC
            LIMIT 6
        `);

        // 2. Tratamientos Populares (Dona)
        const treatmentRes = await pool.query(`
            SELECT t.name, COUNT(h.id)::int as count
            FROM administration_header h
            JOIN treatments t ON h.treatment_id = t.id
            GROUP BY t.name ORDER BY count DESC LIMIT 5
        `);

        // 3. Alertas de Stock Bajo
        const stockRes = await pool.query(`
            SELECT name, amount, 'u.' as unit 
            FROM products WHERE amount < 10 
            ORDER BY amount ASC LIMIT 5
        `);

        // 4. KPIs Principales
        const kpiRes = await pool.query(`
            SELECT 
                (SELECT COUNT(*)::int FROM patients) as total_patients,
                (SELECT COUNT(*)::int FROM products WHERE amount < 10) as low_stock_count,
                COALESCE((
                    SELECT SUM(h.base_cost_at_time + COALESCE((
                        SELECT SUM(i.quantity * i.price_at_time)
                        FROM administration_items i WHERE i.header_id = h.id
                    ), 0))
                    FROM administration_header h
                    WHERE DATE_TRUNC('month', h.administered_at) = DATE_TRUNC('month', CURRENT_DATE)
                ), 0) as revenue_month
        `);

        // 5. Actividad Reciente
        const activityRes = await pool.query(`
            SELECT 
                h.id, n.name as nurse_name, t.name as treatment_name, h.administered_at as date,
                (h.base_cost_at_time + COALESCE((
                    SELECT SUM(i.quantity * i.price_at_time)
                    FROM administration_items i WHERE i.header_id = h.id
                ), 0))::float as total_session
            FROM administration_header h
            JOIN nurses n ON h.nurse_id = n.id
            JOIN treatments t ON h.treatment_id = t.id
            ORDER BY h.administered_at DESC LIMIT 5
        `);

        // 6. Atenciones de Hoy
        const todayCountRes = await pool.query(`
            SELECT COUNT(*)::int as count 
            FROM administration_header WHERE DATE(administered_at) = CURRENT_DATE
        `);

        res.json({
            revenue: revenueRes.rows.reverse(),
            treatments: treatmentRes.rows,
            stockAlerts: stockRes.rows,
            kpis: kpiRes.rows[0],
            recentActivity: activityRes.rows,
            todayAttentions: todayCountRes.rows[0].count,
        });
    } catch (err: any) {
        console.error('❌ Error Dashboard:', err.message);
        res.status(500).json({ error: 'Error al cargar estadísticas' });
    }
};

export const getRecentActivityList = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT
                n.name as nurse,
                t.name as treatment,
                h.base_cost_at_time as cost,
                h.administered_at as date
            FROM administration_header h
            JOIN nurses n ON h.nurse_id = n.id
            JOIN treatments t ON h.treatment_id = t.id
            ORDER BY h.administered_at DESC
            LIMIT 4
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Error al cargar actividad reciente:', err);
        res.status(500).json({ error: 'Error al cargar actividad' });
    }
};

export const getManagementReport = async (req: Request, res: Response) => {
    try {
        // 1. Ingresos por mes (Suma del costo base + costo de insumos)
        const revenueRes = await pool.query(`
        SELECT
            TO_CHAR(h.administered_at, 'Mon') as month,
            SUM(h.base_cost_at_time + COALESCE((
            SELECT SUM(i.quantity * i.price_at_time)
            FROM administration_items i
            WHERE i.header_id = h.id
            ), 0)) as total
        FROM administration_header h
        GROUP BY TO_CHAR(h.administered_at, 'Mon'), DATE_TRUNC('month', h.administered_at)
        ORDER BY DATE_TRUNC('month', h.administered_at) DESC
        LIMIT 6
    `);

        // 2. Tratamientos más populares
        const treatmentRes = await pool.query(`
        SELECT t.name, COUNT(h.id)::int as count
        FROM administration_header h
        JOIN treatments t ON h.treatment_id = t.id
        GROUP BY t.name
        ORDER BY count DESC
        LIMIT 5
    `);

        // 3. Alertas de Stock
        const stockRes = await pool.query(`
        SELECT name, amount, 'u.' as unit
        FROM products
        WHERE amount < 10
        ORDER BY amount ASC
        LIMIT 5
    `);

        // 4. KPIs (Aquí es donde suele dar el error 500)
        const kpiRes = await pool.query(`
        SELECT
            (SELECT COUNT(*)::int FROM patients) as total_patients,
            (SELECT COUNT(*)::int FROM products WHERE amount < 10) as low_stock_count,
            COALESCE((
            SELECT SUM(h.base_cost_at_time + COALESCE((
                SELECT SUM(i.quantity * i.price_at_time)
                FROM administration_items i
                WHERE i.header_id = h.id
            ), 0))
            FROM administration_header h
            WHERE DATE_TRUNC('month', h.administered_at) = DATE_TRUNC('month', CURRENT_DATE)
            ), 0) as revenue_month
    `);
        const statsData = {
            kpis: kpiRes.rows[0],
            treatments: treatmentRes.rows,
            stockAlerts: stockRes.rows,
        };

        const buffer = await generateManagementReportPdf(statsData);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Gestion_SaidSalud.pdf');
        res.end(buffer);
    } catch (err) {
        res.status(500).json({ error: 'Error al generar reporte de gestión' });
    }
};

/* eslint-disable max-len */
import pool from '../config/db.js';

export const getFullStats = async () => {
    // 1. Ingresos vs Costos
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
        ORDER BY DATE_TRUNC('month', h.administered_at) DESC LIMIT 6
    `);

    // 2. Tratamientos Populares
    const treatmentRes = await pool.query(`
        SELECT t.name, COUNT(h.id)::int as count
        FROM administration_header h
        JOIN treatments t ON h.treatment_id = t.id
        GROUP BY t.name ORDER BY count DESC LIMIT 5
    `);

    // 3. Alertas de Stock
    const stockRes = await pool.query(`
        SELECT name, amount, 'u.' as unit FROM products WHERE amount < 10
        ORDER BY amount ASC LIMIT 5
    `);

    // 4. KPIs
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

    // 6. Contador Hoy
    const todayCountRes = await pool.query(`
        SELECT COUNT(*)::int as count FROM administration_header
        WHERE DATE(administered_at) = CURRENT_DATE
    `);

    return {
        revenue: revenueRes.rows.reverse(),
        treatments: treatmentRes.rows,
        stockAlerts: stockRes.rows,
        kpis: kpiRes.rows[0],
        recentActivity: activityRes.rows,
        todayAttentions: todayCountRes.rows[0].count,
    };
};

export const getRecentActivity = async () => {
    const result = await pool.query(`
        SELECT n.name as nurse, t.name as treatment, h.base_cost_at_time as cost, h.administered_at as date
        FROM administration_header h
        JOIN nurses n ON h.nurse_id = n.id
        JOIN treatments t ON h.treatment_id = t.id
        ORDER BY h.administered_at DESC LIMIT 4
    `);
    return result.rows;
};

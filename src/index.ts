/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import express from 'express';
import cors from 'cors';
import pool from './db.js';

import {
    generateClinicalReportPdf,
    generateInventoryReportPdf,
    generateManagementReportPdf,
} from './utils/pdf.generator.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- RUTAS CRUD ---

// #region Productos
// 1. Get all products (READ)
app.get('/products', async (_req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY name ASC');

        console.log('\n📦 [GET] Solicitud de inventario recibida.');
        console.log(`   --> Enviando ${result.rows.length} productos.`);

        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Create a product (CREATE)
app.post('/products', async (req, res) => {
    const { name, amount, price_cost, price_sale } = req.body;

    try {
        const query = `
            INSERT INTO products (name, amount, price_cost, price_sale)
            VALUES ($1, $2, $3, $4)
            RETURNING *`;
        const values = [name, amount, price_cost, price_sale];

        const result = await pool.query(query, values);
        console.log(`\n➕ [POST] Nuevo insumo añadido: "${name}"`);

        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Update a product (UPDATE)
app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, amount, price_cost, price_sale } = req.body;

    try {
        const query = `
            UPDATE products
            SET name = $1, amount = $2, price_cost = $3, price_sale = $4
            WHERE id = $5
            RETURNING *`;

        const values = [name, amount, price_cost, price_sale, id];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        console.log(`\n🔄 [PUT] Producto actualizado (ID: ${id})`);

        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Delete a product (DELETE)
app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
        const values = [id];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        console.log(`\n🗑️ [DELETE] Producto eliminado (ID: ${id})`);

        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});
// #endregion Productos

// #region Pacientes
// 1. Get all patients (READ)
app.get('/patients', async (_req, res) => {
    try {
        const result = await pool.query('SELECT * FROM patients ORDER BY full_name ASC');

        console.log('\n📦 [GET] Solicitud de pacientes recibida.');
        console.log(`   --> Enviando ${result.rows.length} pacientes.`);

        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/patients/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/patients/:id/history', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
        SELECT
            h.id, h.administered_at as fecha, t.name as tratamiento, n.name as enfermera,
            h.base_cost_at_time as costo_proc,
            JSON_AGG(JSON_BUILD_OBJECT('nombre', p.name, 'cant', i.quantity, 'subtotal', (i.quantity * i.price_at_time))) as materiales,
            (h.base_cost_at_time + SUM(i.quantity * i.price_at_time)) as costo_total
        FROM administration_header h
        JOIN treatments t ON h.treatment_id = t.id
        JOIN nurses n ON h.nurse_id = n.id
        LEFT JOIN administration_items i ON i.header_id = h.id
        LEFT JOIN products p ON i.product_id = p.id
        WHERE h.patient_id = $1
        GROUP BY h.id, t.name, n.name
        ORDER BY h.administered_at DESC`;

        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/patients', async (req, res) => {
    const { full_name, dni, address, phone } = req.body;

    try {
        const query = `
            INSERT INTO patients (full_name, dni, address, phone)
            VALUES ($1, $2, $3, $4)
            RETURNING *`;
        const values = [full_name, dni, address, phone];

        const result = await pool.query(query, values);
        console.log(`\n👤 [POST] Nuevo paciente registrado: ${full_name}`);
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        // Error 23505 es "Unique Violation" en Postgres (DNI duplicado)
        if (err.code === '23505') {
            return res.status(400).json({ error: 'El DNI ya se encuentra registrado.' });
        }
        res.status(500).json({ error: err.message });
    }
});
// #endregion Pacientes

// #region Enfermeras
// 1. Get all nurses (READ)
app.get('/nurses', async (_req, res) => {
    try {
        const result = await pool.query('SELECT * FROM nurses ORDER BY name');

        console.log('\n📦 [GET] Solicitud de enfermeras recibida.');
        console.log(`   --> Enviando ${result.rows.length} enfermeras.`);

        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});
// #endregion Enfermeras

// #region Tratamientos
// 1. Get all treatments (READ)
app.get('/treatments', async (_req, res) => {
    try {
        const result = await pool.query('SELECT * FROM treatments ORDER BY name');

        console.log('\n📦 [GET] Solicitud de tratamientos recibida.');
        console.log(`   --> Enviando ${result.rows.length} tratamientos.`);

        res.json(result.rows);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/administration', async (req, res) => {
    const { patientId, nurseId, treatmentId, items } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const tRes = await client.query('SELECT base_cost FROM treatments WHERE id = $1', [treatmentId]);
        const baseCost = tRes.rows[0].base_cost;

        const hRes = await client.query(
            'INSERT INTO administration_header (patient_id, nurse_id, treatment_id, base_cost_at_time) VALUES ($1, $2, $3, $4) RETURNING id',
            [patientId, nurseId, treatmentId, baseCost]
        );
        const headerId = hRes.rows[0].id;

        for (const item of items) {
            const pRes = await client.query('SELECT price_sale, amount, name FROM products WHERE id = $1', [item.productId]);
            const prod = pRes.rows[0];

            if (prod.amount < item.quantity) throw new Error(`Stock insuficiente: ${prod.name}`);

            await client.query(
                'INSERT INTO administration_items (header_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4)',
                [headerId, item.productId, item.quantity, prod.price_sale]
            );

            await client.query('UPDATE products SET amount = amount - $1 WHERE id = $2', [item.quantity, item.productId]);
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Éxito' });
    } catch (err: any) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});
// #endregion Tratamientos

// 5. Home
app.get('/', (_req, res) => {
    res.send('Welcome to the SAID.SALUD API');
});

app.get('/health', async (req, res) => {
    try {
        // Verificamos la base de datos con una consulta rápida
        await pool.query('SELECT 1');

        res.json({
            server: true,
            database: true,
        });
    } catch (err) {
        // Si la DB falla pero el servidor responde
        res.status(500).json({
            server: true,
            database: false,
        });
    }
});

// Endpoint para estadísticas globales
app.get('/dashboard/stats', async (req, res) => {
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

        res.json({
            revenue: revenueRes.rows.reverse(),
            treatments: treatmentRes.rows,
            stockAlerts: stockRes.rows,
            kpis: kpiRes.rows[0],
        });
    } catch (err: any) {
        console.error('❌ Error detallado en SQL:', err.message);
        res.status(500).json({ error: 'Error interno en la base de datos', details: err.message });
    }
});

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(40));
    console.log('🏥 SERVIDOR DE SAID.SALUD CORRIENDO');
    console.log(`🚀 URL: http://localhost:${PORT}`);
    console.log('='.repeat(40) + '\n');
});

// --- ENDPOINTS DE REPORTES ---
//#region  Reportes
app.get('/patients/:id/report', async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Obtener datos (Este código ya lo tienes)
        const pRes = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
        if (pRes.rows.length === 0) return res.status(404).json({ error: 'Paciente no encontrado' });
        const patient = pRes.rows[0];

        const hRes = await pool.query(
            `
            SELECT h.administered_at, t.name as tratamiento, n.name as enfermera,
            COALESCE(JSON_AGG(p.name || ' (x' || i.quantity || ')') FILTER (WHERE p.name IS NOT NULL), '[]') as materiales,
            (h.base_cost_at_time + COALESCE(SUM(i.quantity * i.price_at_time), 0)) as total
            FROM administration_header h
            JOIN treatments t ON h.treatment_id = t.id
            JOIN nurses n ON h.nurse_id = n.id
            LEFT JOIN administration_items i ON i.header_id = h.id
            LEFT JOIN products p ON i.product_id = p.id
            WHERE h.patient_id = $1
            GROUP BY h.id, t.name, n.name
            ORDER BY h.administered_at DESC`,
            [id]
        );
        const history = hRes.rows;

        // 2. Delegamos la generación del PDF al nuevo archivo!
        const buffer = await generateClinicalReportPdf(patient, history);

        // 3. Enviamos la respuesta limpia al cliente
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Reporte_${patient.dni}.pdf`);
        res.setHeader('Content-Length', buffer.length);
        res.end(buffer);
    } catch (err: any) {
        console.error('❌ Error generando reporte:', err);
        res.status(500).json({ error: 'No se pudo generar el reporte PDF.' });
    }
});

app.get('/products/report', async (req, res) => {
    try {
        // Consulta todos los productos, ordenados alfabéticamente
        const result = await pool.query('SELECT * FROM products ORDER BY name ASC');
        const products = result.rows;

        if (products.length === 0) {
            return res.status(404).json({ error: 'No hay productos en el inventario' });
        }

        // Generamos el Buffer delegando a nuestro servicio
        const buffer = await generateInventoryReportPdf(products);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Inventario_SAID_SALUD.pdf');
        res.setHeader('Content-Length', buffer.length);
        res.end(buffer);
    } catch (err: any) {
        console.error('❌ Error generando reporte de inventario:', err);
        res.status(500).json({ error: 'No se pudo generar el reporte PDF.' });
    }
});

app.get('/dashboard/report', async (req, res) => {
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
});
//#endregion Reportes

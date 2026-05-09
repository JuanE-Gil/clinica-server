/* eslint-disable no-unused-vars */
import express from 'express';
import cors from 'cors';
import pool from './config/db.js';

import { setupSwagger } from './config/swagger.js';

import productRoutes from './v1/routes/product.routes.js';
import patientRoutes from './v1/routes/patient.routes.js';
import nurseRoutes from './v1/routes/nurse.routes.js';
import treatmentRoutes from './v1/routes/treatment.routes.js';
import administrationRoutes from './v1/routes/administration.routes.js';
import dashboardRoutes from './v1/routes/dashboard.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

setupSwagger(app);

app.use('/api/v1/products', productRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/nurses', nurseRoutes);
app.use('/api/v1/treatments', treatmentRoutes);
app.use('/api/v1/administration', administrationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.get('/api/v1/', (_req, res) => {
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

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(40));
    console.log('🏥 SERVIDOR DE SAID.SALUD CORRIENDO');
    console.log(`🚀 URL: http://localhost:${PORT}`);
    console.log(`📄 Documentación Swagger en http://localhost:${PORT}/api-docs`);
    console.log('='.repeat(40) + '\n');
});

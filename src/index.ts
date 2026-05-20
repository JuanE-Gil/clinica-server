/**
 * Punto de entrada principal del servidor Express para SAID.SALUD API.
 * Configura middlewares, rutas, documentación y el inicio del servidor.
 */
/* eslint-disable no-unused-vars */
import express from 'express';
import cors from 'cors';
import pool from './config/db.js';

import { setupSwagger } from './config/swagger.js';

// Importación de rutas por módulos
import productRoutes from './v1/routes/product.routes.js';
import patientRoutes from './v1/routes/patient.routes.js';
import nurseRoutes from './v1/routes/nurse.routes.js';
import treatmentRoutes from './v1/routes/treatment.routes.js';
import administrationRoutes from './v1/routes/administration.routes.js';
import dashboardRoutes from './v1/routes/dashboard.routes.js';
import authRoutes from './v1/routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Middlewares globales
app.use(cors()); // Habilita el Intercambio de Recursos de Origen Cruzado
app.use(express.json()); // Permite el procesamiento de cuerpos JSON en las peticiones

// Configuración de la documentación Swagger
setupSwagger(app);

// Definición de Rutas Base
app.use('/api/auth', authRoutes); // Rutas de autenticación (Login, Refresh)

// Rutas de la API v1 (Protegidas)
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/nurses', nurseRoutes);
app.use('/api/v1/treatments', treatmentRoutes);
app.use('/api/v1/administration', administrationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

/**
 * Endpoint de bienvenida para verificar que la API está accesible.
 */
app.get('/api/v1/', (_req, res) => {
    res.send('Welcome to the SAID.SALUD API');
});

/**
 * Endpoint de salud (Health Check) para verificar el estado del servidor y la base de datos.
 */
app.get('/health', async (req, res) => {
    try {
        // Verifica la conectividad con la base de datos PostgreSQL
        await pool.query('SELECT 1');

        res.json({
            server: true,
            database: true,
        });
    } catch (err) {
        // El servidor responde pero la base de datos no está disponible
        res.status(500).json({
            server: true,
            database: false,
        });
    }
});

/**
 * Inicio del servidor en el puerto configurado.
 */
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(40));
    console.log('🏥 SERVIDOR DE SAID.SALUD CORRIENDO');
    console.log(`🚀 URL: http://localhost:${PORT}/api/v1/`);
    console.log(`📄 Documentación Swagger en http://localhost:${PORT}/api-docs`);
    console.log('='.repeat(40) + '\n');
});

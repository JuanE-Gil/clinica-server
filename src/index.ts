/**
 * Punto de entrada principal del servidor Express para SAID.SALUD API.
 * Configura middlewares, rutas, documentación y el inicio del servidor.
 */
import app, { registerRoutes } from './app.js';
import productRoutes from './v1/routes/product.routes.js';
import patientRoutes from './v1/routes/patient.routes.js';
import nurseRoutes from './v1/routes/nurse.routes.js';
import treatmentRoutes from './v1/routes/treatment.routes.js';
import administrationRoutes from './v1/routes/administration.routes.js';
import dashboardRoutes from './v1/routes/dashboard.routes.js';
import authRoutes from './v1/routes/auth.routes.js';
import userRoutes from './v1/routes/user.routes.js';

registerRoutes([
    { path: '/auth', router: authRoutes },
    { path: '/products', router: productRoutes },
    { path: '/patients', router: patientRoutes },
    { path: '/nurses', router: nurseRoutes },
    { path: '/treatments', router: treatmentRoutes },
    { path: '/administration', router: administrationRoutes },
    { path: '/dashboard', router: dashboardRoutes },
    { path: '/users', router: userRoutes },
]);

const PORT = process.env.PORT || 3000;

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

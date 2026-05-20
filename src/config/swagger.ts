/**
 * Configuración de Swagger para la documentación automática de la API.
 * Define la estructura básica de la documentación, esquemas de datos y endpoints.
 */
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

const swaggerOptions: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SAID.SALUD API',
            version: '1.0.0',
            description: 'Documentación técnica de la API REST para el sistema de gestión clínica SAID.SALUD.',
            contact: {
                name: 'Soporte SAID.SALUD',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/api/v1',
                description: 'Servidor de Desarrollo Local',
            },
        ],
        components: {
            schemas: {
                // Esquema para Productos (Insumos médicos)
                Product: {
                    type: 'object',
                    required: ['name', 'amount', 'price_cost', 'price_sale'],
                    properties: {
                        id: { type: 'string', format: 'uuid', description: 'ID autogenerado' },
                        name: { type: 'string', example: 'Suero Fisiológico 100ml' },
                        amount: { type: 'integer', example: 50 },
                        price_cost: { type: 'number', example: 12.5 },
                        price_sale: { type: 'number', example: 25.0 },
                    },
                },
                // Esquema para Pacientes
                Patient: {
                    type: 'object',
                    required: ['full_name', 'dni'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        full_name: { type: 'string', example: 'Juan Pérez' },
                        dni: { type: 'string', example: '12345678' },
                        address: { type: 'string', example: 'Av. Larco 123' },
                        phone: { type: 'string', example: '999888777' },
                        birth_date: { type: 'string', format: 'date', example: '1990-05-20' },
                    },
                },
                // Esquema para Personal de Enfermería
                Nurse: {
                    type: 'object',
                    required: ['name', 'license_number'],
                    properties: {
                        id: { type: 'string', format: 'uuid', description: 'ID autogenerado' },
                        name: { type: 'string', example: 'Lic. Ana Rosa Espinoza' },
                        license_number: { type: 'string', example: 'CEP-45678', description: 'Número de colegiatura único' },
                    },
                },
                // Esquema para Tratamientos/Procedimientos
                Treatment: {
                    type: 'object',
                    required: ['name', 'base_cost'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string', example: 'Curación de Herida Compleja' },
                        base_cost: { type: 'number', example: 85.0 },
                    },
                },
                // Esquema para Administración de Tratamientos
                Administration: {
                    type: 'object',
                    required: ['patientId', 'nurseId', 'treatmentId', 'items'],
                    properties: {
                        patientId: { type: 'string', format: 'uuid' },
                        nurseId: { type: 'string', format: 'uuid' },
                        treatmentId: { type: 'string', format: 'uuid' },
                        items: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    productId: { type: 'string', format: 'uuid' },
                                    quantity: { type: 'integer', example: 2 },
                                },
                            },
                        },
                    },
                },
                // Esquema para Estadísticas del Dashboard
                DashboardStats: {
                    type: 'object',
                    properties: {
                        revenue: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    month: { type: 'string', example: 'May' },
                                    income: { type: 'number', example: 1500.5 },
                                    cost: { type: 'number', example: 450.2 },
                                },
                            },
                        },
                        treatments: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', example: 'Inyectable' },
                                    count: { type: 'integer', example: 12 },
                                },
                            },
                        },
                        kpis: {
                            type: 'object',
                            properties: {
                                total_patients: { type: 'integer', example: 150 },
                                low_stock_count: { type: 'integer', example: 5 },
                                revenue_month: { type: 'number', example: 5400.0 },
                            },
                        },
                        todayAttentions: { type: 'integer', example: 8 },
                    },
                },
            },
        },
    },
    // Archivos donde se encuentran las anotaciones de Swagger
    apis: ['./src/v1/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

/**
 * Configura el middleware de Swagger UI en la aplicación Express.
 * @param app Instancia de la aplicación Express.
 */
export const setupSwagger = (app: Express) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log('📄 Swagger Docs disponible en http://localhost:3000/api-docs');
};

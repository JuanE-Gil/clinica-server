# 🏥 SAID.SALUD API - Sistema de Gestión Clínica Integral

API de backend robusta desarrollada bajo una **arquitectura de capas (Onion Architecture Lite)** para garantizar la escalabilidad y el desacoplamiento de responsabilidades en la gestión del **Servicio de Atención Integral Domiciliaria (SAID)**. Este sistema sustituye procesos manuales por una plataforma automatizada, auditable y centralizada.

## 🚀 Características Principales

- **Gestión de Pacientes**: Control de expedientes con **cálculo automático de edad** a partir de la fecha de nacimiento y geolocalización de domicilios mediante integración con **Leaflet/OpenStreetMap**.
- **Control de Inventario**: Monitoreo de insumos con **alertas visuales de stock crítico** (umbral < 10 unidades).
- **Gestión de Precios Manual**: La integridad financiera depende del usuario, por lo que el precio de compra y venta se ingresa **100% de forma manual**.
- **Administración Transaccional**: Registro de atenciones médicas mediante el patrón **Unit of Work** y transacciones **ACID**, asegurando que el descuento de stock y el cobro ocurran de forma atómica.
- **Dashboard de Inteligencia de Negocio**: Panel con diseño **Bento Grid** que muestra KPIs en tiempo real, flujo de caja e indicadores de salud del servidor/DB.
- **Seguridad Robusta**: Autenticación mediante esquema dual de **tokens JWT (Access/Refresh Tokens)**, hashing de contraseñas con **bcrypt** y Control de Acceso Basado en Roles (**RBAC**: Admin, Nurse, Viewer).
- **Motor de Reportería**: Generación dinámica de reportes clínicos y de inventario en formato PDF utilizando **pdfmake v0.3.x**.

## 🛠️ Stack Tecnológico

- **Runtime**: [Node.js](https://nodejs.org/) (**v20.19.0 LTS**).
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) (**v5.x**).
- **Framework**: [Express.js](https://expressjs.com/) (**v4.21.x**).
- **Base de Datos**: [PostgreSQL](https://www.postgresql.org/) (**v15+**) con soporte para JSONB.
- **ORM/Query Builder**: [node-postgres (pg)](https://node-postgres.com/) con **Pool de conexiones** optimizado.
- **Documentación**: [Swagger/OpenAPI 3.0](https://swagger.io/).
- **Logs**: **Morgan** para desarrollo y **Winston** para producción.

## ⚙️ Configuración del Entorno

1. **Clonación e Instalación**:
   ```bash
   git clone https://github.com/JuanE-Gil/clinica-server.git
   cd clinica-server
   npm install
   ```

2. **Variables de Entorno**:
   Crea un archivo `.env` en la raíz del backend con los siguientes parámetros:
   ```env
   PORT=3000
   DB_USER=tu_usuario
   DB_HOST=localhost
   DB_NAME=said_salud_db
   DB_PASSWORD=tu_password
   DB_PORT=5432
   JWT_SECRET=tu_secreto_de_alta_entropia
   ```

3. **Ejecución**:
   - **Desarrollo**: `npm run dev` (utiliza **tsx** para ejecución rápida).
   - **Producción**: `npm run build` seguido de `npm start`.

## 📂 Estructura del Proyecto

El sistema sigue una organización modular **kebab-case** con sufijos descriptivos:

- `src/config/`: Configuraciones de base de datos y Swagger.
- `src/controllers/`: Manejadores de protocolo HTTP; extraen parámetros y delegan la lógica a los servicios.
- `src/services/`: **Corazón del sistema**; orquestación de procesos de negocio y gestión de transacciones.
- `src/models/`: Capa de persistencia; contiene sentencias SQL y transforma resultados en interfaces TypeScript.
- `src/v1/routes/`: Definición de endpoints versionados y aplicación de seguridad.
- `src/middlewares/`: Protección de rutas (`verifyToken`), validación de roles y manejador global de errores.
- `src/utils/`: Funciones puras y el generador de PDF desacoplado.

## 📖 Documentación de la API

La documentación interactiva, que permite probar los endpoints y visualizar los esquemas de datos (**Product, Patient, Administration**, etc.), está disponible en:
`http://localhost:3000/api-docs`

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

---
**SAID.SALUD** - *Tecnología de precisión para la seguridad del paciente y la eficiencia clínica.*
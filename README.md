# 🏥 SAID.SALUD API - Sistema de Gestión Clínica

API de backend robusta diseñada para la gestión integral de clínicas médicas, control de inventario, seguimiento de pacientes y administración de tratamientos.

## 🚀 Características Principales

- **Gestión de Pacientes**: Control completo de expedientes, historial clínico y generación de reportes.
- **Control de Inventario**: Gestión de insumos médicos con alertas de stock bajo y trazabilidad de costos.
- **Administración de Tratamientos**: Registro transaccional de atenciones médicas garantizando la integridad de datos (ACID).
- **Dashboard de Analítica**: Métricas en tiempo real de ingresos, costos y volumen de pacientes.
- **Seguridad**: Autenticación basada en JWT (Access/Refresh Tokens) y hashing de contraseñas con bcrypt.
- **Reportería**: Generación dinámica de reportes clínicos en formato PDF.
- **Documentación**: API documentada con Swagger/OpenAPI.

## 🛠️ Stack Tecnológico

- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Base de Datos**: [PostgreSQL](https://www.postgresql.org/)
- **ORM/Query Builder**: [node-postgres (pg)](https://node-postgres.com/)
- **Documentación**: [Swagger](https://swagger.io/)
- **Reportes**: [pdfmake](https://pdfmake.github.io/pdfmake/)

## ⚙️ Configuración del Entorno

1. Clona el repositorio:
   ```bash
   git clone https://github.com/JuanE-Gil/clinica-server.git
   cd clinica-server
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   Crea un archivo `.env` en la raíz con el siguiente contenido:
   ```env
   PORT=3000
   DB_USER=tu_usuario
   DB_HOST=localhost
   DB_NAME=said_salud_db
   DB_PASSWORD=tu_password
   DB_PORT=5432
   JWT_SECRET=tu_secreto_super_seguro
   ```

4. Ejecuta el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

## 📖 Documentación de la API

Una vez que el servidor esté en funcionamiento, puedes acceder a la documentación interactiva en:
`http://localhost:3000/api-docs`

## 📂 Estructura del Proyecto

- `src/config`: Configuraciones de base de datos y herramientas.
- `src/controllers`: Lógica de manejo de peticiones HTTP.
- `src/services`: Lógica de negocio centralizada.
- `src/models`: Definiciones de esquemas y consultas a la base de datos.
- `src/v1/routes`: Definición de endpoints de la API.
- `src/utils`: Utilidades y generadores (PDF, etc.).

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

---
Desarrollado para la gestión eficiente de servicios de salud.

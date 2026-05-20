# 📘 Guía Técnica - SAID.SALUD API

Esta guía proporciona una descripción detallada y profesional de la arquitectura, componentes, lógica de negocio y procedimientos operativos del backend de la plataforma de gestión clínica SAID.SALUD.

---

## 🏗️ 1. Arquitectura del Sistema

El proyecto implementa una arquitectura de capas (Onion Architecture Lite) diseñada para garantizar la escalabilidad, mantenibilidad y desacoplamiento de responsabilidades.

### 1.1. Estructura de Directorios 📂
```text
clinica-server/
├── src/
│   ├── config/          # Configuraciones globales (Base de Datos, Swagger, etc.)
│   ├── controllers/     # Orquestadores de peticiones HTTP y respuestas.
│   ├── middlewares/     # Lógica intermedia para seguridad y validación.
│   ├── models/          # Capa de datos: Esquemas SQL y consultas directas.
│   ├── services/        # Lógica de negocio pura: Orquestación de procesos.
│   ├── utils/           # Utilidades compartidas (PDF, Helpers, etc.)
│   ├── v1/
│   │   └── routes/      # Endpoints versionados agrupados por entidad.
│   └── index.ts         # Punto de entrada y configuración de Express.
├── GUIA_TECNICA.md      # Esta guía de referencia técnica.
├── package.json         # Gestión de dependencias y scripts de ejecución.
└── tsconfig.json        # Configuración del compilador TypeScript.
```

### 1.2. Responsabilidades por Capa 🛠️

1.  **Capa de Rutas (v1/routes)**: Define la interfaz pública de la API. Se encarga de mapear los verbos HTTP (GET, POST, etc.) a los controladores correspondientes y aplicar middlewares de seguridad.
2.  **Capa de Controladores (controllers)**: Su única misión es manejar el protocolo HTTP. Extrae parámetros de `req`, invoca a los servicios y devuelve la respuesta adecuada (JSON o Binarios) mediante `res`.
3.  **Capa de Servicios (services)**: Es el corazón del sistema. Aquí reside la **lógica de negocio**. Los servicios orquestan múltiples llamadas a modelos, gestionan transacciones y aplican reglas de validación complejas.
4.  **Capa de Modelos (models)**: Interactúa directamente con PostgreSQL. Contiene las sentencias SQL y se encarga de transformar los resultados de la base de datos en interfaces de TypeScript.

### 1.3. Diagrama de Flujo de Datos 🔄
```text
[Cliente/Frontend] 
       │
       ▼
[Middleware de Seguridad (Auth/Helmet)]
       │
       ▼
[Controller (HTTP Parsing)]
       │
       ▼
[Service (Lógica de Negocio/Transacciones)] ◄───► [Utilidades (PDF/BCrypt)]
       │
       ▼
[Model (PostgreSQL Queries)]
       │
       ▼
[Base de Datos (PostgreSQL)]
```

---

## 🗄️ 2. Modelo de Datos y Entidades Principales

El sistema utiliza **PostgreSQL** como motor relacional, aprovechando su robustez para garantizar la integridad de los datos mediante transacciones ACID y restricciones (Constraints).

### 2.1. Dinámica de Entidades 🏛️

A continuación se detallan las entidades principales y sus atributos técnicos.

#### 👤 2.1.1. Pacientes (`patients`)
Gestiona la identidad clínica del usuario. Implementa **Soft Delete** mediante la columna `is_active`.

| Atributo | Tipo | Descripción | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Identificador Único Universal. | Primary Key, Default: `gen_random_uuid()` |
| `full_name` | VARCHAR(255) | Nombre completo del paciente. | NOT NULL |
| `dni` | VARCHAR(20) | Documento de Identidad Nacional. | UNIQUE, INDEX, NOT NULL |
| `address` | TEXT | Dirección de residencia física. | NOT NULL |
| `phone` | VARCHAR(20) | Número telefónico de contacto. | NOT NULL |
| `birth_date` | DATE | Fecha de nacimiento para cálculos de edad. | NOT NULL |
| `is_active` | BOOLEAN | Estado de eliminación lógica. | Default: `true` |

**Ejemplo de Objeto JSON**:
```json
{
  "full_name": "Alexander Pierce",
  "dni": "88776655-K",
  "address": "Av. Principal 123, Torre B",
  "phone": "+56 9 1234 5678",
  "birth_date": "1990-05-15"
}
```

#### 💊 2.1.2. Productos e Insumos (`products`)
Control estricto de almacén y rentabilidad financiera.

| Atributo | Tipo | Descripción | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | UUID | ID del producto. | Primary Key |
| `name` | VARCHAR(255) | Nombre comercial del insumo. | NOT NULL |
| `amount` | INT | Stock actual en inventario. | CHECK (`amount` >= 0) |
| `price_cost` | DECIMAL(10,2) | Costo de adquisición. | NOT NULL |
| `price_sale` | DECIMAL(10,2) | Precio cobrado al paciente. | NOT NULL |

#### 💉 2.1.3. Tratamientos y Procedimientos (`treatments`)
Catálogo de servicios médicos prestados por la clínica.

| Atributo | Tipo | Descripción | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | UUID | ID del tratamiento. | Primary Key |
| `name` | VARCHAR(255) | Nombre del procedimiento. | NOT NULL |
| `base_cost` | DECIMAL(10,2) | Honorarios por el servicio. | NOT NULL |

#### 👩‍⚕️ 2.1.4. Personal de Enfermería (`nurses`)
Registro del personal capacitado para realizar administraciones.

| Atributo | Tipo | Descripción | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | UUID | ID del enfermero/a. | Primary Key |
| `name` | VARCHAR(255) | Nombre completo. | NOT NULL |
| `license_number`| VARCHAR(50) | Matrícula profesional. | UNIQUE, NOT NULL |
| `is_active` | BOOLEAN | Estado laboral. | Default: `true` |

#### 📋 2.1.5. Atenciones (Header & Items)
La entidad `administration_header` actúa como el registro maestro de la visita, mientras que `administration_items` detalla el consumo granular de insumos. Esta separación permite una auditoría precisa y reportes detallados.

---

### 2.2. Diagrama Entidad-Relación (Lógico) 🧬

```text
    [Patients] 1 ─────── N [Administration Header] N ─────── 1 [Nurses]
                                  │
                                  │ 1
                                  │
                                  ▼
                        [Administration Items] N ─────── 1 [Products]
                                  ▲
                                  │ 1
                                  │
                        [Treatments]
```

---

## 🔒 3. Seguridad y Control de Acceso

La seguridad se basa en estándares modernos de la industria para aplicaciones web (OWASP Top 10).

### 3.1. Autenticación JWT y Refresh Tokens 🔑
Se utiliza un esquema de tokens duales para maximizar la seguridad:
*   **Access Token**: Corta duración (15-30 min). Almacenado en memoria.
*   **Refresh Token**: Larga duración (7 días). Almacenado en la base de datos para control de revocación.

### 3.2. Hashing de Contraseñas con Bcrypt 🔐
Las contraseñas nunca se almacenan en texto plano. Se utiliza `bcrypt` con 10 salt rounds.

```typescript
// src/services/auth.service.ts
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
```

### 3.3. Control de Acceso Basado en Roles (RBAC) 🛡️

El sistema implementa un modelo de **RBAC** para restringir el acceso a los recursos según las responsabilidades del usuario. Los roles disponibles son:

*   **`admin` (Administrador)**: Acceso total al sistema, gestión de usuarios, visualización de métricas financieras en el Dashboard y capacidad de eliminar registros.
*   **`user` (Personal Clínico)**: Acceso operativo para gestionar pacientes, registrar atenciones y controlar el inventario. No tiene permisos de eliminación ni acceso a datos de gestión gerencial.

#### Matriz de Permisos Detallada 📊

| Módulo | Endpoint / Acción | Usuario (`user`) | Administrador (`admin`) |
| :--- | :--- | :---: | :---: |
| **Autenticación** | `/auth/login` | ✅ | ✅ |
| **Dashboard** | `/dashboard/*` (KPIs, Reporte Gestión) | ❌ | ✅ |
| **Pacientes** | Listar, Ver, Crear, Editar, Reporte | ✅ | ✅ |
| | Eliminar Paciente | ❌ | ✅ |
| **Productos** | Listar, Ver, Crear, Editar, Reporte | ✅ | ✅ |
| | Eliminar Producto | ❌ | ✅ |
| **Enfermeras** | Listar, Ver, Crear, Editar | ✅ | ✅ |
| | Eliminar Enfermera | ❌ | ✅ |
| **Tratamientos** | Listar catálogo | ✅ | ✅ |
| **Administración** | Registrar atención médica | ✅ | ✅ |
| **Usuarios** | Gestión completa (CRUD) | ❌ | ✅ |

### 3.4. Protección de Rutas (Middleware) 🚧

Se utilizan dos middlewares principales para asegurar los endpoints:

1.  **`verifyToken`**: Valida la firma y vigencia del JWT en el header `Authorization`.
2.  **`checkRole(['role1', 'role2'])`**: Verifica que el rol extraído del token coincida con los permisos requeridos para la ruta específica.

```typescript
// Ejemplo de aplicación en rutas
const allowAll = checkRole(['admin', 'user']);
const allowAdmin = checkRole(['admin']);

router.get('/', allowAll, ctrl.getAll);      // Ambos pueden leer
router.delete('/:id', allowAdmin, ctrl.delete); // Solo admin puede borrar
```

---

## ⚙️ 4. Lógica de Negocio Detallada (Servicios)

Esta sección profundiza en los métodos y funciones que orquestan las operaciones complejas del sistema.

### 4.1. Módulo de Pacientes 👤
Gestiona el ciclo de vida clínico del paciente y la integridad de su historial.

#### `getPatientHistory` (Service)
Recupera atenciones incluyendo el detalle de insumos mediante agregación JSON avanzada. Este método es fundamental para la continuidad del cuidado médico.

```typescript
// src/models/patient.model.ts
async findHistory(patientId: string) {
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

    const { rows } = await pool.query(query, [patientId]);
    return rows;
}
```

#### `deletePatient` (Soft Delete)
A diferencia de un borrado físico, este método preserva la integridad referencial marcando al paciente como inactivo.

```typescript
// src/services/patient.service.ts
export const deletePatient = async (id: string) => {
    const deleted = await PatientModel.delete(id);
    if (!deleted) throw new Error('Paciente no encontrado');
    return deleted;
};
```

### 4.2. Módulo de Inventario y Productos 💊
Controla el flujo de insumos y garantiza la disponibilidad para las atenciones.

#### `updateProductStock` (Atomic Update)
Permite ajustar el inventario validando reglas de negocio antes de persistir.

```typescript
// src/services/product.service.ts
export const updateProductStock = async (id: string, newAmount: number) => {
    if (newAmount < 0) throw new Error('El stock no puede ser negativo');
    
    const updated = await ProductModel.updateAmount(id, newAmount);
    if (!updated) throw new Error('Producto no encontrado');
    
    return updated;
};
```

### 4.3. Módulo de Atenciones (Core Transaccional) 💉
Este es el proceso más crítico del sistema. Implementa el patrón **Unit of Work** manual sobre PostgreSQL para garantizar la consistencia absoluta.

#### `processMedicalAdministration`
Garantiza que el stock se reduzca y el registro se cree solo si todas las operaciones son exitosas. Si falla la actualización del stock del tercer producto en una lista de cinco, el sistema revierte automáticamente la creación de la cabecera y los dos productos anteriores.

```typescript
// src/services/administration.service.ts
export const createAdministration = async (data: any) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Inicio de Transacción Atómica

        // 1. Snapshot del costo del tratamiento actual
        // Esto previene que cambios futuros en precios afecten cierres pasados.
        const treatment = await TreatmentModel.findById(data.treatmentId);
        
        // 2. Inserción de Cabecera
        const header = await AdministrationModel.createHeader(client, {
            ...data,
            baseCost: treatment.base_cost
        });

        // 3. Procesamiento de Items y Validación de Stock
        for (const item of data.items) {
            const product = await ProductModel.findById(item.productId);
            
            // Validación crítica en caliente
            if (product.amount < item.quantity) {
                throw new Error(`Stock insuficiente para: ${product.name}. Disponible: ${product.amount}`);
            }

            // Registrar item con precio histórico (Snapshot de Venta)
            await AdministrationModel.createItem(client, header.id, {
                productId: item.productId,
                quantity: item.quantity,
                priceAtTime: product.price_sale
            });

            // Actualizar inventario dentro de la misma transacción
            await ProductModel.decrementStock(client, item.productId, item.quantity);
        }

        await client.query('COMMIT'); // Persistir todos los cambios de forma permanente
        return header;
    } catch (error) {
        await client.query('ROLLBACK'); // Deshacer absolutamente todo ante cualquier error
        throw error;
    } finally {
        client.release(); // Liberar conexión al pool
    }
};
```

### 4.4. Módulo de Dashboard y Analítica 📊
Calcula KPIs financieros y operativos mediante subconsultas correlacionadas optimizadas.

#### `getFullStats` (Aggregation)
Obtiene el balance general (Ingresos vs Costos de Adquisición) en una sola llamada a la base de datos.

```typescript
// src/services/dashboard.service.ts
export const getFinancialStats = async () => {
    const query = `
        SELECT 
            -- Cálculo de Ingresos Totales (Base + Insumos)
            (SELECT COALESCE(SUM(base_cost_at_time), 0) FROM administration_header) +
            (SELECT COALESCE(SUM(quantity * price_at_time), 0) FROM administration_items) as ingresos,
            
            -- Cálculo de Costos de Adquisición (Insumos consumidos a precio de costo)
            (SELECT COALESCE(SUM(i.quantity * p.price_cost), 0) 
             FROM administration_items i 
             JOIN products p ON i.product_id = p.id) as costos
    `;
    const { rows } = await pool.query(query);
    return {
        ...rows[0],
        utilidad: rows[0].ingresos - rows[0].costos
    };
};
```

---

## 📄 5. Sistema de Reportes PDF y Documentación Clínica

El sistema cuenta con un motor desacoplado para la generación de documentos legales y clínicos basado en `pdfmake`. Esta arquitectura permite que la lógica visual esté separada de la obtención de datos.

### 5.1. Arquitectura del Generador 🏗️
El archivo `src/utils/pdf.generator.ts` centraliza la definición de estilos y estructuras:
*   **Encabezado Dinámico**: Incluye logo de la clínica, información de contacto y metadatos del reporte.
*   **Tablas de Historial**: Formateo automático de columnas para tratamiento, fecha, personal y costos.
*   **Pie de Página**: Numeración de páginas y sello de validez digital.

### 5.2. Flujo de Generación 🔄
1.  **Recolección**: `patient.service.ts` obtiene los datos agregados de la base de datos (JOINs complejos).
2.  **Maquetación**: El servicio pasa los datos al generador, el cual define el `docDefinition` requerido por `pdfmake`.
3.  **Fuentes**: Se cargan fuentes personalizadas (ubicadas en `/fonts`) para garantizar la legibilidad legal del documento.
4.  **Streaming**: El controlador envía el buffer binario directamente al navegador con cabeceras `Content-Type: application/pdf`.

### 5.3. Ejemplo de Código del Controlador 📄
```typescript
// src/controllers/patient.controller.ts
export const getPatientClinicalReport = async (req: Request, res: Response) => {
    const { id } = req.params;
    
    // 1. Obtención de datos reales del servicio
    const data = await patientService.getPatientDataForReport(id);
    
    // 2. Generación del buffer PDF mediante la utilidad
    const buffer = await generateClinicalReportPdf(data.patient, data.history);

    // 3. Configuración de cabeceras para visualización/descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Reporte_Clinico_${data.patient.dni}.pdf`);
    res.send(buffer);
};
```

---

## 🚀 6. Guía de Ejecución, Despliegue e Infraestructura

### 6.1. Requisitos del Sistema 📋
*   **Entorno de Ejecución**: Node.js v18.16.0+ (LTS recomendado).
*   **Base de Datos**: PostgreSQL 14.8+ con soporte para JSONB.
*   **Memoria RAM**: 512MB mínimo para el proceso de Node, 1GB recomendado para el motor de BD.
*   **Almacenamiento**: Espacio para el crecimiento de la BD y almacenamiento de logs.

### 6.2. Configuración de Entorno Detallada (`.env`) 🛠️
El sistema requiere las siguientes variables para operar correctamente en diferentes entornos:

| Variable     | Descripción                        | Ejemplo                      |
|:-------------|:-----------------------------------|:-----------------------------|
| `PORT`       | Puerto de escucha de la API.       | `3000`                       |
| `DB_HOST`    | Dirección del servidor PostgreSQL. | `127.0.0.1`                  |
| `DB_NAME`    | Nombre de la base de datos.        | `clinica_said`               |
| `JWT_SECRET` | Llave para firmar Access Tokens.   | `random_string_32_chars`     |
| `NODE_ENV`   | Entorno de ejecución.              | `development` / `production` |

### 6.3. Despliegue en Producción con PM2 🚀
PM2 es el gestor de procesos estándar utilizado. Garantiza alta disponibilidad y reinicio automático.

```bash
# 1. Compilar el proyecto
npm run build

# 2. Iniciar con PM2 (Configurado en ecosystem.config.js)
pm2 start dist/index.js --name "said-salud-api" -i max

# 3. Guardar lista de procesos para reinicios del SO
pm2 save
pm2 startup
```

---

## 🗄️ 7. Esquema de Base de Datos y Migraciones

### 7.1. Inicialización de la Base de Datos
El proyecto incluye scripts SQL para la creación inicial de tablas en `src/models/schema.sql` (o similar). Es vital ejecutar estos scripts en orden para mantener las llaves foráneas.

### 7.2. Estrategia de Índices
Para garantizar respuestas en <100ms, se han aplicado los siguientes índices:
*   **B-Tree** en `patients(dni)` para búsquedas de identidad.
*   **B-Tree** en `administration_header(patient_id)` para carga rápida de historiales.
*   **B-Tree** en `products(name)` para autocompletado en la interfaz.

---

## 🚦 8. Gestión de Errores y Estandarización de Respuestas

El sistema utiliza un formato de respuesta unificado para facilitar la integración con cualquier cliente.

### 8.1. Estructura de Error Estándar ⚠️
```json
{
  "status": "error",
  "message": "Stock insuficiente para el producto seleccionado.",
  "code": "INSUFFICIENT_STOCK",
  "payload": {
    "productId": "uuid",
    "requested": 10,
    "available": 5
  }
}
```

### 8.2. Códigos de Estado HTTP Utilizados 🚦
| Código               | Significado   | Escenario Común                                  |
|:---------------------|:--------------|:-------------------------------------------------|
| **200 OK**           | Éxito         | Consultas y actualizaciones exitosas.            |
| **201 Created**      | Creado        | Registro exitoso de pacientes o atenciones.      |
| **400 Bad Request**  | Error Cliente | Datos de entrada inválidos o stock insuficiente. |
| **401 Unauthorized** | Sin Acceso    | Token expirado o credenciales incorrectas.       |
| **403 Forbidden**    | Prohibido     | Usuario sin permisos para la acción.             |
| **404 Not Found**    | No Encontrado | Recurso solicitado no existe.                    |
| **500 Server Error** | Error Interno | Fallo crítico no controlado.                     |

---

---

## 📈 10. Análisis de Endpoints por Módulo

A continuación se detalla el contrato de los endpoints más significativos de la API v1.

### 10.1. Módulo de Autenticación (`/auth`) 🔒

#### `POST /login`
*   **Objetivo**: Validar credenciales y entregar tokens.
*   **Payload Entrante**:
    ```json
    { "email": "user@example.com", "password": "securePass123" }
    ```
*   **Respuesta Exitosa**: Retorna `accessToken`, `refreshToken` y objeto `user`.

---

### 10.2. Módulo de Pacientes (`/patient`) 👤

#### `GET /`
*   **Objetivo**: Listar pacientes activos con soporte para búsqueda.
*   **Query Params**: `?search=12345678` (Filtra por DNI o Nombre).

#### `POST /`
*   **Objetivo**: Crear nuevo paciente.
*   **Validación**: DNI debe ser único.

---

### 10.3. Módulo de Administración (`/administration`) 💉

#### `POST /`
*   **Objetivo**: Registrar atención médica completa.
*   **Descripción**: Este es el endpoint más complejo. Recibe un objeto con los IDs de las entidades relacionadas y una lista de insumos. Internamente dispara la transacción ACID detallada en la sección 4.3.
*   **Cuerpo de la Petición**:
    ```json
    {
      "patientId": "550e8400-e29b-41d4-a716-446655440000",
      "nurseId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "treatmentId": "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
      "items": [
        { "productId": "6ba7b812-9dad-11d1-80b4-00c04fd430c8", "quantity": 2 },
        { "productId": "6ba7b814-9dad-11d1-80b4-00c04fd430c8", "quantity": 1 }
      ]
    }
    ```
*   **Posibles Respuestas**:
    *   `201 Created`: Registro exitoso.
    *   `400 Bad Request`: "Stock insuficiente para Alcohol Isopropílico".
    *   `404 Not Found`: "Paciente no encontrado".

---

### 10.5. Módulo de Dashboard y Reportes (`/dashboard`) 📊

#### `GET /stats`
*   **Objetivo**: Proporcionar datos agregados para la visualización del panel administrativo.
*   **Respuesta**:
    ```json
    {
      "ingresos": 15250.50,
      "costos": 4200.75,
      "utilidad": 11049.75,
      "atenciones_mes": 142
    }
    ```

---

## 🏗️ 10. Documentación Detallada de Métodos y Funciones 🛠️

Para desarrolladores que deseen profundizar en el código, aquí se explican las funciones internas más importantes.

### 10.1. Generación Dinámica de Consultas
En varios modelos se utiliza la concatenación segura de strings para permitir búsquedas dinámicas.
*   **Función**: `PatientModel.findAll(search: string)`
*   **Lógica**: Si existe un término de búsqueda, se añade una cláusula `WHERE (full_name ILIKE $1 OR dni ILIKE $1)`.

### 10.2. Middleware de Validación de Roles
Implementado para restringir el acceso a funcionalidades sensibles como la actualización de stock o el borrado de pacientes.
```typescript
export const roleMiddleware = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'No tienes permisos para esta acción' });
        }
        next();
    };
};
```

---

## 🛠️ 11. Guía de Desarrollo y Convenciones Avanzadas

Para mantener la calidad y homogeneidad del código, es obligatorio seguir estas normas.

### 11.1. Convenciones de Naming y Estilo 🏷️

#### Archivos y Directorios
*   **Regla**: Usar `kebab-case` para nombres de archivos y carpetas.
*   **Sufijos**: Indicar siempre el tipo de componente.
    *   `auth.service.ts` (Servicio)
    *   `patient.controller.ts` (Controlador)
    *   `nurse.model.ts` (Modelo)
    *   `validate-stock.middleware.ts` (Middleware)

#### Variables y Tipado
*   **Booleanos**: Deben empezar con `is`, `has`, `can` o `should`.
    *   `isActive`, `canDelete`, `hasStock`.
*   **Interfaces**: Deben representar la forma exacta de los datos en la base de datos o en el cuerpo de la petición.
    ```typescript
    interface ICreateProductDTO {
        name: string;
        price_sale: number;
        initial_stock: number;
    }
    ```

#### Comentarios y Documentación
*   **JSDoc**: Todos los métodos públicos en `Services` y `Models` DEBEN tener JSDoc explicando parámetros y retornos.
    ```typescript
    /**
     * Calcula la utilidad neta de un periodo.
     * @param startDate Fecha inicio ISO.
     * @param endDate Fecha fin ISO.
     * @returns Objeto con métricas financieras.
     */
    ```

### 11.2. Flujo de Git y Estándares de Mensajería 🌲
Adoptamos el estándar **Angular Commit Message Format**:

1.  **feat**: Una nueva funcionalidad.
    *   `feat: implement patient clinical history pdf export`
2.  **fix**: Corrección de un error.
    *   `fix: prevent negative stock on manual updates`
3.  **docs**: Cambios solo en la documentación.
    *   `docs: update technical guide with deployment steps`
4.  **refactor**: Un cambio de código que no corrige un error ni añade una funcionalidad.
    *   `refactor: simplify dashboard aggregation query`
5.  **test**: Añadir o corregir pruebas.
    *   `test: add unit tests for stock decrement logic`

### 11.3. Anti-patrones a Evitar (Best Practices) ❌

*   **Logic Leakage**: No escribir validaciones de stock en el `Controller`. Si se cambia la base de datos o se añade un proceso por lotes, esa lógica se perdería.
*   **Fat Controllers**: Los controladores no deben superar las 50 líneas. Si es más largo, extrae lógica a un `Service`.
*   **Hardcoded Values**: No usar IDs o secretos directamente en el código. Usar variables de entorno (`process.env`).
*   **Silent Failures**: Nunca usar `try { ... } catch (e) { }` vacío. Siempre loguear el error o relanzarlo.

---

## 🏗️ 12. Gestión de Errores Estandarizada ⚠️

El sistema implementa una arquitectura de manejo de errores centralizada para garantizar respuestas coherentes, seguras y profesionales en toda la API.

### 12.1. Estructura Única de Respuesta de Error
Todas las respuestas de error siguen estrictamente el siguiente esquema JSON, facilitando la integración con el frontend y la depuración técnica:

```json
{
  "status": "error",
  "message": "Descripción legible para el usuario final",
  "code": "ERROR_CODE_TECH",
  "details": [] 
}
```

*   **`status`**: Siempre "error".
*   **`message`**: Un mensaje amigable que explica qué salió mal.
*   **`code`**: Un código alfanumérico (ej: `PRODUCT_NOT_FOUND`) para que el frontend pueda reaccionar programáticamente (i18n, iconos específicos).
*   **`details`**: Un array opcional con información técnica adicional (ej: errores de validación de campos específicos).

### 12.2. Jerarquía de Errores Personalizados
Se han definido clases de error específicas en `src/utils/errors/AppError.ts` para categorizar las fallas:

1.  **`ValidationError` (400)**: Errores en los datos de entrada o lógica de negocio (ej: Stock insuficiente).
2.  **`UnauthorizedError` (401)**: Fallas en la autenticación o tokens expirados.
3.  **`ForbiddenError` (403)**: El usuario está autenticado pero no tiene permisos para el recurso.
4.  **`NotFoundError` (404)**: El recurso solicitado no existe en la base de datos.
5.  **`AppError` (500)**: Errores internos no controlados.

### 12.3. Middleware Global de Errores
El archivo `src/middlewares/errorHandler.ts` intercepta cualquier excepción lanzada en los controladores:

```typescript
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            code: err.errorCode,
            details: err.details
        });
    }
    // Manejo de errores inesperados...
};
```

---

## 📸 13. Guía Visual de Módulos (Capturas de Interfaz)

> [!IMPORTANT]
> Esta sección está reservada para las capturas de pantalla de la interfaz de usuario final.

### 13.1. Dashboard Analítico
*(Aquí se debe insertar la imagen del Tablero de Control con las gráficas de ingresos y alertas de stock)*
**[BLOQUE_IMAGEN: DASHBOARD_GENERAL]**

### 13.2. Gestión de Inventario
*(Captura del listado de productos mostrando los indicadores de stock bajo en rojo)*
**[BLOQUE_IMAGEN: INVENTARIO_LISTADO]**

### 13.3. Historial de Pacientes
*(Imagen de la vista detallada de un paciente con su línea de tiempo de atenciones)*
**[BLOQUE_IMAGEN: PACIENTE_HISTORIAL]**

---

## 🛠️ 14. Convenciones de Desarrollo y Estilo de Código 💻

Para mantener la mantenibilidad a largo plazo, el equipo debe seguir estas reglas estrictas:

### 14.1. Naming Conventions (Nomenclatura)
*   **Variables y Funciones**: `camelCase` (ej: `getPatientById`).
*   **Clases e Interfaces**: `PascalCase` (ej: `PatientService`, `IProduct`).
*   **Archivos**: `kebab-case` con sufijo descriptivo (ej: `auth.middleware.ts`, `patient.controller.ts`).
*   **Base de Datos**: `snake_case` para tablas y columnas (ej: `full_name`, `is_active`).

### 14.2. Estructura de un Controlador Profesional
Un controlador ideal debe limitarse a:
1.  Extraer parámetros (`req.params`, `req.body`).
2.  Llamar al servicio correspondiente.
3.  Enviar la respuesta exitosa o pasar el error a `next()`.

**Ejemplo de implementación recomendada:**
```typescript
export const getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const data = await service.fetch(id);
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};
```

### 14.3. Reglas de Servicios y Transacciones
*   Toda lógica que afecte a más de una tabla DEBE ir dentro de una transacción en el `Service`.
*   Nunca usar el objeto `Response` de Express dentro de un `Service`.
*   Los servicios deben ser "puros", recibiendo datos y devolviendo objetos de negocio.

---

## 📊 15. Monitoreo, Logs y Auditoría

### 13.1. Registro de Actividad (Logging)
*   **Desarrollo**: Se usa `morgan('dev')` para ver las rutas y tiempos de respuesta en consola.
*   **Producción**: Los logs se escriben en archivos rotativos usando `winston` o se capturan mediante el flujo de `pm2 logs`.

### 13.2. Auditoría de Operaciones Críticas
Para las operaciones transaccionales, el sistema registra el `user_id` del administrador que realizó el cambio, permitiendo una trazabilidad forense en caso de inconsistencias en el inventario.

---

## 📝 14. Glosario Técnico Extendido

*   **ACID**: Propiedades que garantizan transacciones seguras en BD (Atomicidad, Consistencia, Aislamiento, Durabilidad).
*   **JWT**: Estándar para transmisión segura de información entre partes como un objeto JSON.
*   **Stateless**: La API no guarda sesiones en memoria, toda la info necesaria viaja en el Token.
*   **CORS**: Mecanismo que permite o restringe recursos en una página web solicitados desde otro dominio.
*   **Payload**: El cuerpo útil de datos en una transmisión HTTP.
*   **Snapshot**: Captura de un estado en un momento dado (ej. precio de un producto al momento de la venta).
*   **Unit of Work**: Patrón que agrupa múltiples operaciones en una sola unidad lógica de éxito o fracaso.

---

## 🏗️ 15. Flujos de Trabajo (Workflows) 🔄

Para asegurar la operatividad diaria, se han definido los siguientes flujos de trabajo técnicos.

### 15.1. Registro de Nueva Atención Médica
1.  **Frontend**: Envía solicitud a `POST /administration` con los IDs de paciente, enfermero, tratamiento e insumos.
2.  **API (Controller)**: Valida la presencia de todos los campos obligatorios.
3.  **API (Service)**:
    *   Inicia transacción SQL.
    *   Bloquea las filas de productos involucrados para evitar condiciones de carrera (Race Conditions).
    *   Calcula el costo total (Tratamiento + Insumos).
    *   Si el stock es suficiente, resta las cantidades y guarda el histórico.
    *   Confirma la transacción.

### 15.2. Generación de Cierre de Caja / Dashboard
1.  **Frontend**: Solicita `GET /dashboard/stats`.
2.  **API (Service)**:
    *   Ejecuta múltiples consultas en paralelo mediante `Promise.all()`.
    *   Filtra las atenciones del mes actual.
    *   Suma ingresos brutos y resta costos de adquisición de productos.
    *   Devuelve un objeto consolidado listo para gráficos (Charts).

---

---

## 🔒 16. Estrategia de Ciberseguridad Detallada

La seguridad es el pilar fundamental de SAID.SALUD. Se aplican múltiples capas de protección para asegurar la confidencialidad de los datos médicos.

### 16.1. Ciclo de Vida del Token (JWT)
El sistema utiliza tokens firmados mediante `HS256` con una clave secreta de alta entropía.

1.  **Login**: El usuario envía credenciales cifradas por TLS.
2.  **Validación**: Se compara el hash `bcrypt`.
3.  **Generación**: Se crea un `AccessToken` (15 min) y un `RefreshToken` (7 días).
4.  **Renovación**: El frontend usa el `RefreshToken` para obtener un nuevo par sin pedir credenciales al usuario.
5.  **Revocación**: Al hacer logout, el `RefreshToken` se elimina de la base de datos, invalidando cualquier intento de sesión posterior.

### 16.2. Seguridad a Nivel de Base de Datos
*   **Parameterized Queries**: Todas las consultas usan marcadores de posición (`$1`, `$2`) para prevenir **SQL Injection**.
*   **Principio de Menor Privilegio**: El usuario de la base de datos solo tiene permisos de `SELECT`, `INSERT`, `UPDATE` y `DELETE` en las tablas necesarias, sin permisos de superusuario.

---

## 🚀 17. Guía de Despliegue en Entornos de Producción

### 17.1. Preparación del Servidor (Ubuntu/Debian)
Se recomienda el uso de un VPS con al menos 1GB de RAM.

```bash
# Instalación de Node.js v18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalación de PM2 para gestión de procesos
sudo npm install pm2 -g
```

### 17.2. Configuración de PM2
Crea un archivo `ecosystem.config.cjs` para gestionar el reinicio automático:

```javascript
module.exports = {
  apps : [{
    name: "said-salud-api",
    script: "./dist/index.js",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
    }
  }]
}
```

### 17.3. Backup Automatizado de PostgreSQL
Script recomendado para `cron` diario:
```bash
pg_dump -U postgres said_salud > /backups/said_salud_$(date +%F).sql
```

---

---

## 📡 19. Especificación Detallada de Contratos de la API (Payloads)

Para asegurar la interoperabilidad con cualquier cliente (Frontend, Mobile, BI), se documentan los contratos de datos de los endpoints más utilizados.

### 19.1. Módulo de Autenticación
**`POST /api/auth/login`**
*   **Request Body**:

| Campo      | Tipo   | Requerido | Descripción                |
|:-----------|:-------|:----------|:---------------------------|
| `email`    | String | Sí        | Correo corporativo.        |
| `password` | String | Sí        | Contraseña en texto plano. |

*   **Response (200 OK)**:
    ```json
    {
      "status": "success",
      "data": {
        "accessToken": "ey...",
        "refreshToken": "ey...",
        "user": { "id": "uuid", "role": "admin" }
      }
    }
    ```

### 19.2. Módulo de Pacientes
**`POST /api/v1/patients`**
*   **Request Body**:

| Campo        | Tipo   | Requerido | Validación               |
|:-------------|:-------|:----------|:-------------------------|
| `full_name`  | String | Sí        | Min 3, Max 255 chars.    |
| `dni`        | String | Sí        | Único, formato nacional. |
| `phone`      | String | Sí        | Formato internacional.   |
| `birth_date` | Date   | Sí        | Formato YYYY-MM-DD.      |

**`GET /api/v1/patients/:id/history`**
*   **Response (200 OK)**:
    ```json
    {
      "status": "success",
      "data": [
        {
          "id": "uuid",
          "fecha": "2024-05-20T10:00:00Z",
          "tratamiento": "Sueroterapia",
          "costo_total": 450.00,
          "materiales": [...]
        }
      ]
    }
    ```

### 19.3. Módulo de Inventario
**`PUT /api/v1/products/:id`**
*   **Request Body**:

| Campo        | Tipo    | Descripción                |
|:-------------|:--------|:---------------------------|
| `name`       | String  | Nombre opcional.           |
| `amount`     | Number  | Stock físico a establecer. |
| `price_sale` | Number  | Nuevo precio al público.   |

---

## 📋 20. Checklist de Control de Calidad (QA)

Antes de realizar un despliegue a producción, el desarrollador debe verificar:

1.  **Seguridad**:
    *   [ ] ¿El `JWT_SECRET` es diferente al de desarrollo?
    *   [ ] ¿Están habilitadas las cabeceras `Helmet`?
    *   [ ] ¿Se deshabilitó el listado de directorios en el servidor?
2.  **Performance**:
    *   [ ] ¿Se revisaron los índices de las columnas con mayor carga (`dni`, `administered_at`)?
    *   [ ] ¿El pool de conexiones de Postgres está configurado según la carga?
3.  **Resiliencia**:
    *   [ ] ¿El manejador de errores global captura todos los casos?
    *   [ ] ¿Se probó el sistema con un stock de producto en cero?
    *   [ ] ¿Los PDFs se generan correctamente bajo alta demanda?

---

## 🧹 21. Roadmap de Evolución y Mantenimiento

### 16.1. Mantenimiento Preventivo
*   **Optimización de Índices**: Revisar trimestralmente la performance de las búsquedas por DNI y Nombre.
*   **Depuración de Refresh Tokens**: Script mensual para eliminar tokens expirados de la base de datos.

### 16.2. Próximas Mejoras (Roadmap)
1.  **Caché con Redis**: Para acelerar las consultas del Dashboard que no cambian frecuentemente.
2.  **Notificaciones en Tiempo Real**: Uso de WebSockets (Socket.io) para alertar sobre stock bajo.
3.  **Integración con Facturación**: Módulo para generar facturas legales automáticas post-atención.
4.  **App Móvil para Enfermería**: API específica para lectura de QR de insumos.

---

## 🛠️ 17. Troubleshooting y Soporte 🛠️

*   **Error: `ECONNREFUSED`**: Verificar que el servicio de PostgreSQL esté corriendo y acepte conexiones en el puerto 5432.
*   **Error: `JWT Expired`**: El cliente debe interceptar el error 401 y realizar un llamado al endpoint de `/refresh`.
*   **Error: `Out of Stock`**: El personal debe ingresar una nota de crédito o actualización de inventario antes de proceder.
*   **Error: `Permission Denied`**: Verificar que el usuario tenga el rol `admin` para acceder a módulos de inventario.

---
## 🧪 22. Estrategia de Pruebas y Aseguramiento (QA)
Para garantizar la estabilidad ante cambios (regresiones), se define el siguiente esquema de pruebas.
### 22.1. Pruebas Unitarias (Services)
Se enfocan en la lógica de negocio pura, simulando la base de datos mediante mocks.
*   **Herramientas**: `Jest` o `Vitest`.
*   **Caso Crítico**: Validar que `decrementStock` lance una excepción si el stock solicitado es mayor al disponible.
### 22.2. Pruebas de Integración (API Endpoints)
Prueban el flujo completo desde la petición HTTP hasta la persistencia en una base de datos de pruebas.
*   **Escenario de Prueba**:
    1.  Crear un paciente de prueba.
    2.  Realizar una administración médica.
    3.  Verificar que el saldo del paciente se actualizó y el stock del producto disminuyó.
### 22.3. Pruebas de Carga (Stress Test)
Evaluación de la generación de PDFs bajo concurrencia.
*   **Métrica**: El tiempo de respuesta para generar un reporte de 10 páginas no debe superar los 2 segundos con 10 usuarios simultáneos.
---
## 📈 23. Monitoreo de Salud y Disponibilidad
### 23.1. Endpoint de Health Check
La API expone `/health` para sistemas de monitoreo externos (ej: UptimeRobot, AWS Route53).
*   **Lógica**: Verifica la conexión activa con PostgreSQL mediante una consulta `SELECT 1`.
### 23.2. Métricas de Negocio (KPIs)
El sistema está preparado para exportar métricas en formato Prometheus:
*   `clinic_administrations_total`: Total de atenciones realizadas.
*   `clinic_product_stock_level`: Nivel de stock por producto (alerta si < 5).
---
## 🧹 24. Conclusión y Cierre
Esta guía técnica constituye el manual de referencia para el mantenimiento y escalabilidad de SAID.SALUD API. El cumplimiento de estos estándares asegura una arquitectura limpia, segura y profesional, capaz de soportar la operación crítica de una institución de salud moderna.
---
*Documentación Técnica Profesional para SAID.SALUD v2.5 - © 2026 Equipo de Desarrollo.*

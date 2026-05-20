/**
 * Clase base para errores personalizados de la aplicación.
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;
    public readonly details: any[];

    constructor(message: string, statusCode: number, errorCode: string, details: any[] = []) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/**
 * Error para recursos no encontrados.
 */
export class NotFoundError extends AppError {
    constructor(message: string = 'Recurso no encontrado', errorCode: string = 'NOT_FOUND') {
        super(message, 404, errorCode);
    }
}

/**
 * Error para validaciones de datos fallidas.
 */
export class ValidationError extends AppError {
    constructor(message: string = 'Error de validación', details: any[] = [], errorCode: string = 'VALIDATION_ERROR') {
        super(message, 400, errorCode, details);
    }
}

/**
 * Error para problemas de autenticación.
 */
export class UnauthorizedError extends AppError {
    constructor(message: string = 'No autorizado', errorCode: string = 'UNAUTHORIZED') {
        super(message, 401, errorCode);
    }
}

/**
 * Error para problemas de permisos.
 */
export class ForbiddenError extends AppError {
    constructor(message: string = 'Acceso prohibido', errorCode: string = 'FORBIDDEN') {
        super(message, 403, errorCode);
    }
}

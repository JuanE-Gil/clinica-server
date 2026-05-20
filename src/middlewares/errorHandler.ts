import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors/AppError.js';

/**
 * Middleware para manejar errores de forma centralizada.
 * Transforma los errores en la estructura estandarizada requerida.
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`[ERROR] ${err.message}`);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            code: err.errorCode,
            details: err.details
        });
    }

    // Errores inesperados o no controlados
    return res.status(500).json({
        status: 'error',
        message: 'Ocurrió un error interno en el servidor',
        code: 'INTERNAL_SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? [err.stack] : []
    });
};

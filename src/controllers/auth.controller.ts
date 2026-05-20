/**
 * Controlador para la gestión de autenticación de usuarios.
 */
import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { UnauthorizedError } from '../utils/errors/AppError.js';

/**
 * Maneja el inicio de sesión de los usuarios.
 * @param req Objeto de petición de Express.
 * @param res Objeto de respuesta de Express.
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    try {
        const result = await AuthService.authenticate(email, password);

        if (!result) {
            throw new UnauthorizedError('Credenciales inválidas', 'INVALID_CREDENTIALS');
        }

        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

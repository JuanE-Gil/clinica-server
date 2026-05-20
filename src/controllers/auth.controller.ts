/**
 * Controlador para la gestión de autenticación de usuarios.
 */
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';

/**
 * Maneja el inicio de sesión de los usuarios.
 * @param req Objeto de petición de Express.
 * @param res Objeto de respuesta de Express.
 */
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const result = await AuthService.authenticate(email, password);

        if (!result) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

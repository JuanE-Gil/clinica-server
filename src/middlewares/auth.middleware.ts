/**
 * Middleware para la verificación de tokens JWT y protección de rutas.
 */
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Verifica la validez del token JWT presente en el encabezado Authorization.
 * @param req Petición de Express.
 * @param res Respuesta de Express.
 * @param next Función para continuar con el siguiente middleware o controlador.
 */
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    // Se espera el formato: "Bearer <token>"
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token no proporcionado' });
    }

    // Verifica el token utilizando el secreto configurado
    jwt.verify(token, process.env.JWT_SECRET || 'super_secret_clinic_key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'No autorizado / Token expirado' });
        }
        
        // Almacena la información decodificada del usuario en el objeto de la petición
        (req as any).user = decoded;
        next();
    });
};

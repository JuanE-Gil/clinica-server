/**
 * Servicio encargado de la lógica de autenticación y gestión de tokens.
 */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserModel, RefreshTokenModel } from '../models/user.model.js';

// Secreto para firmar los tokens JWT, obtenido de variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_clinic_key';

/**
 * Objeto que contiene métodos para la autenticación de usuarios.
 */
export const AuthService = {
    /**
     * Autentica a un usuario mediante email y contraseña.
     * @param email Correo electrónico del usuario.
     * @param password_plain Contraseña en texto plano.
     * @returns Objeto con tokens y datos del usuario, o null si las credenciales son inválidas.
     */
    async authenticate(email: string, password_plain: string) {
        // 1. Buscar usuario en la base de datos
        const user = await UserModel.findByEmail(email);
        if (!user) {
            return null;
        }

        // 2. Verificar si la contraseña coincide con el hash almacenado
        const isValid = await bcrypt.compare(password_plain, user.password_hash);
        if (!isValid) {
            return null;
        }

        // 3. Generar Access Token (vida corta) y Refresh Token (vida larga)
        const accessToken = this.generateAccessToken(user);
        const { refreshTokenPlain, refreshTokenHash, expiresAt } = await this.generateRefreshToken();

        // 4. Guardar el hash del refresh token para validaciones futuras
        await RefreshTokenModel.create({
            user_id: user.id,
            token_hash: refreshTokenHash,
            expires_at: expiresAt,
        });

        // 5. Actualizar la fecha de último acceso del usuario
        await UserModel.updateLastLogin(user.id);

        return {
            accessToken,
            refreshToken: refreshTokenPlain,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                nurse_id: user.nurse_id,
            },
        };
    },

    /**
     * Genera un token JWT de acceso.
     * @param user Datos del usuario a incluir en el payload.
     * @returns Token JWT firmado.
     */
    generateAccessToken(user: any) {
        return jwt.sign({ id: user.id, role: user.role, nurseId: user.nurse_id }, JWT_SECRET, {
            expiresIn: '15m', // El token expira en 15 minutos
        });
    },

    /**
     * Genera un nuevo token de refresco aleatorio.
     * @returns Objeto con el token plano, su hash y la fecha de expiración.
     */
    async generateRefreshToken() {
        const refreshTokenPlain = crypto.randomBytes(40).toString('hex');
        const refreshTokenHash = await bcrypt.hash(refreshTokenPlain, 10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días

        return {
            refreshTokenPlain,
            refreshTokenHash,
            expiresAt,
        };
    },
};

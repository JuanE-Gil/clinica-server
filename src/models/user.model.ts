/**
 * Modelos y tipos de datos para la gestión de usuarios y autenticación.
 */
import pool from '../config/db.js';

/**
 * Interfaz que define la estructura de un Usuario en el sistema.
 */
export interface IUser {
    id: string;
    email: string;
    password_hash: string;
    role: string;
    nurse_id?: string;
    is_active: boolean;
    last_login_at?: Date;
    created_at?: Date;
}

/**
 * Interfaz que define la estructura de un Token de Refresco (JWT).
 */
export interface IRefreshToken {
    id?: string;
    user_id: string;
    token_hash: string;
    expires_at: Date;
    created_at?: Date;
}

/**
 * Objeto que contiene las operaciones de base de datos para los Usuarios.
 */
export const UserModel = {
    /**
     * Busca un usuario activo por su correo electrónico.
     * @param email Correo electrónico del usuario.
     * @returns El usuario encontrado o null si no existe.
     */
    async findByEmail(email: string): Promise<IUser | null> {
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
        return rows[0] || null;
    },

    /**
     * Actualiza la fecha y hora del último inicio de sesión de un usuario.
     * @param id ID del usuario.
     */
    async updateLastLogin(id: string): Promise<void> {
        await pool.query('UPDATE users SET last_login_at = now() WHERE id = $1', [id]);
    },
};

/**
 * Objeto que contiene las operaciones de base de datos para los Tokens de Refresco.
 */
export const RefreshTokenModel = {
    /**
     * Crea un nuevo registro de token de refresco en la base de datos.
     * @param data Datos del token de refresco.
     */
    async create(data: IRefreshToken): Promise<void> {
        const query = `
            INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
            VALUES ($1, $2, $3)
        `;
        await pool.query(query, [data.user_id, data.token_hash, data.expires_at]);
    },
};

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
     * Busca un usuario por su ID.
     * @param id ID del usuario.
     */
    async findById(id: string): Promise<IUser | null> {
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return rows[0] || null;
    },

    /**
     * Obtiene todos los usuarios.
     */
    async findAll(): Promise<IUser[]> {
        const { rows } = await pool.query(
            'SELECT id, email, role, nurse_id, is_active, last_login_at, created_at FROM users ORDER BY created_at DESC'
        );
        return rows;
    },

    /**
     * Crea un nuevo usuario.
     */
    async create(user: Partial<IUser>): Promise<IUser> {
        const query = `
            INSERT INTO users (email, password_hash, role, nurse_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, role, nurse_id, is_active, created_at
        `;
        const values = [user.email, user.password_hash, user.role, user.nurse_id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    /**
     * Actualiza un usuario existente.
     */
    async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
        const fields = [];
        const values = [];
        let index = 1;

        if (user.email) {
            fields.push(`email = $${index++}`);
            values.push(user.email);
        }
        if (user.password_hash) {
            fields.push(`password_hash = $${index++}`);
            values.push(user.password_hash);
        }
        if (user.role) {
            fields.push(`role = $${index++}`);
            values.push(user.role);
        }
        if (user.is_active !== undefined) {
            fields.push(`is_active = $${index++}`);
            values.push(user.is_active);
        }

        if (fields.length === 0) return null;

        values.push(id);
        // eslint-disable-next-line max-len
        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${index} RETURNING id, email, role, nurse_id, is_active, created_at`;
        const { rows } = await pool.query(query, values);
        return rows[0] || null;
    },

    /**
     * Elimina un usuario (soft delete).
     */
    async delete(id: string): Promise<boolean> {
        const { rowCount } = await pool.query('UPDATE users SET is_active = false WHERE id = $1', [id]);
        return (rowCount ?? 0) > 0;
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

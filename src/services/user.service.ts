import type { IUser } from '../models/user.model.js';
import { UserModel } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import { AppError, NotFoundError, ValidationError } from '../utils/errors/AppError.js';

export const UserService = {
    async getAllUsers() {
        return await UserModel.findAll();
    },

    async getUserById(id: string) {
        const user = await UserModel.findById(id);
        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }
        return user;
    },

    async createUser(userData: Partial<IUser>) {
        const existingUser = await UserModel.findByEmail(userData.email!);
        if (existingUser) {
            throw new ValidationError('El correo electrónico ya está registrado');
        }

        if (userData.password_hash) {
            userData.password_hash = await bcrypt.hash(userData.password_hash, 10);
        }

        return await UserModel.create(userData);
    },

    async updateUser(id: string, userData: Partial<IUser>) {
        const user = await UserModel.findById(id);
        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        if (userData.password_hash) {
            userData.password_hash = await bcrypt.hash(userData.password_hash, 10);
        }

        const updatedUser = await UserModel.update(id, userData);
        if (!updatedUser) {
            throw new AppError('No se pudo actualizar el usuario', 400, 'UPDATE_FAILED');
        }
        return updatedUser;
    },

    async deleteUser(id: string) {
        const success = await UserModel.delete(id);
        if (!success) {
            throw new NotFoundError('Usuario no encontrado o ya está inactivo');
        }
        return true;
    }
};

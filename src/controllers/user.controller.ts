import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';

export const UserController = {
    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await UserService.getAllUsers();
            res.json({
                status: 'success',
                data: users,
            });
        } catch (error) {
            next(error);
        }
    },

    async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const user = await UserService.getUserById(id as string);
            res.json({
                status: 'success',
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await UserService.createUser(req.body);
            res.status(201).json({
                status: 'success',
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const user = await UserService.updateUser(id as string, req.body);
            res.json({
                status: 'success',
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await UserService.deleteUser(id as string);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    },
};

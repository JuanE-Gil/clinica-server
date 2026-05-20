/**
 * Controlador para la gestión del personal de enfermería.
 */
/* eslint-disable no-unused-vars */
import type { Request, Response, NextFunction } from 'express';
import * as nurseService from '../services/nurse.service.js';
import { ValidationError, NotFoundError } from '../utils/errors/AppError.js';

/**
 * Obtiene la lista completa de enfermeras.
 * @param _req Objeto de petición (no utilizado).
 * @param res Objeto de respuesta.
 */
export const getAllNurses = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const nurses = await nurseService.getAllNurses();
        res.json({
            status: 'success',
            data: nurses
        });
    } catch (err: any) {
        next(err);
    }
};

/**
 * Busca una enfermera por su ID único.
 * @param req Objeto de petición que contiene el ID en los parámetros.
 * @param res Objeto de respuesta.
 */
export const getNurseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError('El ID es obligatorio', [], 'MISSING_ID');
        }

        const nurse = await nurseService.getNurseById(id as string);
        if (!nurse) {
            throw new NotFoundError('Personal de enfermería no encontrado', 'NURSE_NOT_FOUND');
        }

        res.json({
            status: 'success',
            data: nurse
        });
    } catch (err: any) {
        next(err);
    }
};

/**
 * Registra una nueva enfermera en el sistema.
 * @param req Objeto de petición que contiene los datos en el cuerpo.
 * @param res Objeto de respuesta.
 */
export const createNewNurse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const createdNurse = await nurseService.createNurse(req.body);
        res.status(201).json({
            status: 'success',
            data: createdNurse
        });
    } catch (err: any) {
        next(err);
    }
};

/**
 * Actualiza la información de una enfermera existente.
 * @param req Objeto de petición que contiene el ID y los datos.
 * @param res Objeto de respuesta.
 */
export const updateNurseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError('El ID es obligatorio', [], 'MISSING_ID');
        }

        const updatedNurse = await nurseService.updateNurse(id as string, req.body);
        res.json({
            status: 'success',
            data: updatedNurse
        });
    } catch (err: any) {
        next(err);
    }
};

/**
 * Realiza una eliminación lógica de una enfermera.
 * @param req Objeto de petición que contiene el ID.
 * @param res Objeto de respuesta.
 */
export const deleteNurseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError('El ID es obligatorio', [], 'MISSING_ID');
        }

        const result = await nurseService.deleteNurse(id as string);
        res.json({
            status: 'success',
            message: 'Enfermera eliminada correctamente',
            data: result
        });
    } catch (err: any) {
        next(err);
    }
};

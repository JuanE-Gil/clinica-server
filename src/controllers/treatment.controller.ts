/* eslint-disable no-unused-vars */
import type { Request, Response, NextFunction } from 'express';
import * as treatmentService from '../services/treatment.service.js';
import { ValidationError, NotFoundError } from '../utils/errors/AppError.js';

export const getAllTreatments = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const treatments = await treatmentService.getAllTreatments();
        res.json({
            status: 'success',
            data: treatments
        });
    } catch (err: any) {
        next(err);
    }
};

export const getTreatmentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError('El ID es obligatorio', [], 'MISSING_ID');
        }

        const treatment = await treatmentService.getTreatmentById(id as string);
        if (!treatment) {
            throw new NotFoundError('Tratamiento no encontrado', 'TREATMENT_NOT_FOUND');
        }
        
        res.json({
            status: 'success',
            data: treatment
        });
    } catch (err: any) {
        next(err);
    }
};

export const createNewTreatment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const created = await treatmentService.createTreatment(req.body);
        res.status(201).json({
            status: 'success',
            data: created
        });
    } catch (err: any) {
        next(err);
    }
};

export const updateTreatmentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError('El ID es obligatorio', [], 'MISSING_ID');
        }

        const updated = await treatmentService.updateTreatment(id as string, req.body);
        res.json({
            status: 'success',
            data: updated
        });
    } catch (err: any) {
        next(err);
    }
};

export const deleteTreatmentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError('El ID es obligatorio', [], 'MISSING_ID');
        }

        const deleted = await treatmentService.deleteTreatment(id as string);
        res.json({
            status: 'success',
            message: 'Tratamiento eliminado correctamente',
            data: deleted
        });
    } catch (err: any) {
        next(err);
    }
};

/* eslint-disable no-unused-vars */
import type { Request, Response } from 'express';
import * as treatmentService from '../services/treatment.service.js';

export const getAllTreatments = async (_req: Request, res: Response) => {
    try {
        const treatments = await treatmentService.getAllTreatments();
        res.json(treatments);
    } catch (err: any) {
        res.status(500).json({ error: 'Error al obtener los tratamientos' });
    }
};

export const getTreatmentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'El ID es obligatorio' });
        }

        const treatment = await treatmentService.getTreatmentById(id as string);
        res.json(treatment);
    } catch (err: any) {
        res.status(404).json({ error: err.message });
    }
};

export const createNewTreatment = async (req: Request, res: Response) => {
    try {
        const created = await treatmentService.createTreatment(req.body);
        res.status(201).json(created);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const updateTreatmentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'El ID es obligatorio' });
        }

        const updated = await treatmentService.updateTreatment(id as string, req.body);
        res.json(updated);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteTreatmentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'El ID es obligatorio' });
        }

        const deleted = await treatmentService.deleteTreatment(id as string);
        res.json({ message: 'Tratamiento eliminado correctamente', treatment: deleted });
    } catch (err: any) {
        res.status(404).json({ error: err.message });
    }
};

/* eslint-disable no-unused-vars */
import type { Request, Response } from 'express';
import * as nurseService from '../services/nurse.service.js';

export const getAllNurses = async (_req: Request, res: Response) => {
    try {
        const nurses = await nurseService.getAllNurses();
        res.json(nurses);
    } catch (err: any) {
        res.status(500).json({ error: 'Error al obtener el personal de enfermería' });
    }
};

export const getNurseById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'El ID es obligatorio' });
        }

        const nurse = await nurseService.getNurseById(id as string);
        res.json(nurse);
    } catch (err: any) {
        res.status(404).json({ error: err.message });
    }
};

export const createNewNurse = async (req: Request, res: Response) => {
    try {
        const createdNurse = await nurseService.createNurse(req.body);
        res.status(201).json(createdNurse);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const updateNurseById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'El ID es obligatorio' });
        }

        const updatedNurse = await nurseService.updateNurse(id as string, req.body);
        res.json(updatedNurse);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteNurseById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'El ID es obligatorio' });
        }

        const result = await nurseService.deleteNurse(id as string);
        res.json({ message: 'Enfermera eliminada correctamente', nurse: result });
    } catch (err: any) {
        res.status(404).json({ error: err.message });
    }
};

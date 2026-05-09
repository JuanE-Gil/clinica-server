import type { Request, Response } from 'express';
import * as nurseService from '../services/nurse.service.js';

export const getAllNurses = async (_req: Request, res: Response) => {
    const allNurses = await nurseService.getAllNurses(_req, res);
    res.json(allNurses);
};

export const getNurseById = async (req: Request, res: Response) => {
    const nurseById = await nurseService.getNurseById(req, res);
    res.json(nurseById);
};

export const createNurse = async (req: Request, res: Response) => {
    const createdNurse = await nurseService.createNurse(req, res);
    res.json(createdNurse);
};

export const updateNurse = async (req: Request, res: Response) => {
    const updatedNurse = await nurseService.updateNurse(req, res);
    res.json(updatedNurse);
};

export const deleteNurse = async (req: Request, res: Response) => {
    const deletedNurse = await nurseService.deleteNurse(req, res);
    res.json(deletedNurse);
};

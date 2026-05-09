import type { Request, Response } from 'express';
import * as administrationService from '../services/administration.service.js';

export const createAdministration = async (req: Request, res: Response) => {
    const administration = await administrationService.createAdministration(req, res);
    res.status(201).json(administration);
};

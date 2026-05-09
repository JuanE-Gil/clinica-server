import type { Request, Response } from 'express';
import * as treatmentService from '../services/treatment.service.js';

export const getAllTreatments = async (_req: Request, res: Response) => {
    const treatments = await treatmentService.getAllTreatments(_req, res);
    res.json(treatments);
};

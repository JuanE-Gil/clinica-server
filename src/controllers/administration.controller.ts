import type { Request, Response } from 'express';
import * as adminService from '../services/administration.service.js';

export const createNewAdministration = async (req: Request, res: Response) => {
    try {
        const result = await adminService.processMedicalAdministration(req.body);

        console.log(`\n✅ [ADMIN] Atención registrada con éxito (ID: ${result.headerId})`);
        res.status(201).json({
            message: 'Atención médica y stock registrados correctamente.',
            id: result.headerId,
        });
    } catch (err: any) {
        console.error(`\n❌ [ADMIN] Error en el proceso: ${err.message}`);
        // Devolvemos 400 si es un error de negocio (como stock insuficiente)
        res.status(400).json({ error: err.message });
    }
};

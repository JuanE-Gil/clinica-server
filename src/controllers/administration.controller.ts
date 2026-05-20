/**
 * Controlador para la gestión de administraciones médicas.
 * Se encarga de recibir las peticiones HTTP y delegar la lógica al servicio correspondiente.
 */
import type { Request, Response } from 'express';
import * as adminService from '../services/administration.service.js';

/**
 * Crea un nuevo registro de administración médica.
 * @param req Petición de Express que contiene los datos de la administración en el cuerpo.
 * @param res Respuesta de Express.
 */
export const createNewAdministration = async (req: Request, res: Response) => {
    try {
        // Delega el procesamiento de la atención médica al servicio
        const result = await adminService.processMedicalAdministration(req.body);

        console.log(`\n✅ [ADMIN] Atención registrada con éxito (ID: ${result.headerId})`);
        res.status(201).json({
            message: 'Atención médica y stock registrados correctamente.',
            id: result.headerId,
        });
    } catch (err: any) {
        console.error(`\n❌ [ADMIN] Error en el proceso: ${err.message}`);
        // Devolvemos 400 si es un error de negocio (como stock insuficiente) o validación
        res.status(400).json({ error: err.message });
    }
};

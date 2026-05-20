/**
 * Controlador para la gestión del personal de enfermería.
 */
/* eslint-disable no-unused-vars */
import type { Request, Response } from 'express';
import * as nurseService from '../services/nurse.service.js';

/**
 * Obtiene la lista completa de enfermeras.
 * @param _req Objeto de petición (no utilizado).
 * @param res Objeto de respuesta.
 */
export const getAllNurses = async (_req: Request, res: Response) => {
    try {
        const nurses = await nurseService.getAllNurses();
        res.json(nurses);
    } catch (err: any) {
        res.status(500).json({ error: 'Error al obtener el personal de enfermería' });
    }
};

/**
 * Busca una enfermera por su ID único.
 * @param req Objeto de petición que contiene el ID en los parámetros.
 * @param res Objeto de respuesta.
 */
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

/**
 * Registra una nueva enfermera en el sistema.
 * @param req Objeto de petición que contiene los datos en el cuerpo.
 * @param res Objeto de respuesta.
 */
export const createNewNurse = async (req: Request, res: Response) => {
    try {
        const createdNurse = await nurseService.createNurse(req.body);
        res.status(201).json(createdNurse);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Actualiza la información de una enfermera existente.
 * @param req Objeto de petición que contiene el ID y los datos.
 * @param res Objeto de respuesta.
 */
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

/**
 * Realiza una eliminación lógica de una enfermera.
 * @param req Objeto de petición que contiene el ID.
 * @param res Objeto de respuesta.
 */
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

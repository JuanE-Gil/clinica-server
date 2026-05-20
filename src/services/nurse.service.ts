/**
 * Servicio para la gestión del personal de enfermería.
 */
/* eslint-disable preserve-caught-error */
import { NurseModel, type INurse } from '../models/nurse.model.js';

/**
 * Obtiene la lista completa de enfermeras.
 */
export const getAllNurses = async () => {
    return await NurseModel.findAll();
};

/**
 * Busca una enfermera por su ID.
 * @param id ID único de la enfermera.
 */
export const getNurseById = async (id: string) => {
    const nurse = await NurseModel.findById(id);
    if (!nurse) throw new Error('Enfermera no encontrada');
    return nurse;
};

/**
 * Registra una nueva enfermera en el sistema.
 * @param data Datos de la enfermera.
 */
export const createNurse = async (data: INurse) => {
    try {
        return await NurseModel.create(data);
    } catch (err: any) {
        // Manejo del error de número de licencia duplicado (CEP)
        if (err.code === '23505') {
            throw new Error('El número de licencia (CEP) ya se encuentra registrado.');
        }
        throw err;
    }
};

/**
 * Actualiza la información de una enfermera.
 * @param id ID de la enfermera.
 * @param data Datos parciales a actualizar.
 */
export const updateNurse = async (id: string, data: Partial<INurse>) => {
    const updated = await NurseModel.update(id, data);
    if (!updated) throw new Error('No se pudo actualizar: Enfermera no encontrada');
    return updated;
};

/**
 * Elimina (lógicamente) una enfermera del sistema.
 * @param id ID de la enfermera.
 */
export const deleteNurse = async (id: string) => {
    const deleted = await NurseModel.delete(id);
    if (!deleted) throw new Error('No se pudo eliminar: Enfermera no encontrada');
    return deleted;
};

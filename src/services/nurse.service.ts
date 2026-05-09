/* eslint-disable preserve-caught-error */
import { NurseModel, type INurse } from '../models/nurse.model.js';

// 1. Obtener todas las enfermeras
export const getAllNurses = async () => {
    return await NurseModel.findAll();
};

// 2. Obtener enfermera por ID
export const getNurseById = async (id: string) => {
    const nurse = await NurseModel.findById(id);
    if (!nurse) throw new Error('Enfermera no encontrada');
    return nurse;
};

// 3. Registrar nueva enfermera
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

// 4. Actualizar enfermera
export const updateNurse = async (id: string, data: Partial<INurse>) => {
    const updated = await NurseModel.update(id, data);
    if (!updated) throw new Error('No se pudo actualizar: Enfermera no encontrada');
    return updated;
};

// 5. Eliminar enfermera
export const deleteNurse = async (id: string) => {
    const deleted = await NurseModel.delete(id);
    if (!deleted) throw new Error('No se pudo eliminar: Enfermera no encontrada');
    return deleted;
};

import { TreatmentModel, type ITreatment } from '../models/treatment.model.js';

// Obtener todos los tratamientos
export const getAllTreatments = async () => {
    return await TreatmentModel.findAll();
};

// Obtener un tratamiento por ID
export const getTreatmentById = async (id: string) => {
    const treatment = await TreatmentModel.findById(id);
    if (!treatment) throw new Error('Tratamiento no encontrado');
    return treatment;
};

// Registrar nuevo tratamiento
export const createTreatment = async (data: ITreatment) => {
    if (data.base_cost < 0) throw new Error('El costo base no puede ser negativo');
    return await TreatmentModel.create(data);
};

// Actualizar tratamiento
export const updateTreatment = async (id: string, data: Partial<ITreatment>) => {
    const updated = await TreatmentModel.update(id, data);
    if (!updated) throw new Error('No se pudo actualizar: Tratamiento no encontrado');
    return updated;
};

// Eliminar tratamiento
export const deleteTreatment = async (id: string) => {
    const deleted = await TreatmentModel.delete(id);
    if (!deleted) throw new Error('No se pudo eliminar: Tratamiento no encontrado');
    return deleted;
};

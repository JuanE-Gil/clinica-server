/**
 * Servicio para la gestión de tratamientos y procedimientos médicos.
 */
import { TreatmentModel, type ITreatment } from '../models/treatment.model.js';

/**
 * Obtiene la lista de todos los tratamientos activos.
 * @returns Promesa con el array de tratamientos.
 */
export const getAllTreatments = async () => {
    return await TreatmentModel.findAll();
};

/**
 * Obtiene un tratamiento específico por su ID.
 * @param id ID del tratamiento.
 * @returns El tratamiento encontrado.
 * @throws Error si el tratamiento no existe.
 */
export const getTreatmentById = async (id: string) => {
    const treatment = await TreatmentModel.findById(id);
    if (!treatment) throw new Error('Tratamiento no encontrado');
    return treatment;
};

/**
 * Registra un nuevo tratamiento en el sistema.
 * @param data Datos del tratamiento.
 * @returns El tratamiento creado.
 * @throws Error si el costo base es negativo.
 */
export const createTreatment = async (data: ITreatment) => {
    if (data.base_cost < 0) throw new Error('El costo base no puede ser negativo');
    return await TreatmentModel.create(data);
};

/**
 * Actualiza la información de un tratamiento existente.
 * @param id ID del tratamiento.
 * @param data Datos a actualizar.
 * @returns El tratamiento actualizado.
 * @throws Error si el tratamiento no existe.
 */
export const updateTreatment = async (id: string, data: Partial<ITreatment>) => {
    const updated = await TreatmentModel.update(id, data);
    if (!updated) throw new Error('No se pudo actualizar: Tratamiento no encontrado');
    return updated;
};

/**
 * Realiza una eliminación lógica de un tratamiento.
 * @param id ID del tratamiento.
 * @returns El tratamiento eliminado.
 * @throws Error si el tratamiento no existe.
 */
export const deleteTreatment = async (id: string) => {
    const deleted = await TreatmentModel.delete(id);
    if (!deleted) throw new Error('No se pudo eliminar: Tratamiento no encontrado');
    return deleted;
};

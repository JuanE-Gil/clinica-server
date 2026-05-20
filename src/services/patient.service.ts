/**
 * Servicio para la gestión de pacientes y su historial clínico.
 */
/* eslint-disable preserve-caught-error */
import { PatientModel, type IPatient } from '../models/patient.model.js';

/**
 * Obtiene la lista completa de pacientes activos.
 */
export const getAllPatients = async () => {
    return await PatientModel.findAll();
};

/**
 * Busca un paciente por su ID.
 * @param id ID del paciente.
 */
export const getPatientById = async (id: string) => {
    const patient = await PatientModel.findById(id);
    if (!patient) throw new Error('Paciente no encontrado');
    return patient;
};

/**
 * Obtiene el historial de atenciones de un paciente.
 * @param id ID del paciente.
 */
export const getPatientHistory = async (id: string) => {
    const patient = await PatientModel.findById(id);
    if (!patient) throw new Error('No se puede obtener el historial: Paciente no encontrado');

    return await PatientModel.findHistory(id);
};

/**
 * Registra un nuevo paciente en el sistema.
 * @param data Datos del paciente.
 */
export const createPatient = async (data: IPatient) => {
    try {
        return await PatientModel.create(data);
    } catch (err: any) {
        if (err.code === '23505') {
            throw new Error('El DNI ya se encuentra registrado en el sistema.');
        }
        throw err;
    }
};

/**
 * Actualiza la información de un paciente.
 * @param id ID del paciente.
 * @param data Datos parciales a actualizar.
 */
export const updatePatient = async (id: string, data: Partial<IPatient>) => {
    const updated = await PatientModel.update(id, data);
    if (!updated) throw new Error('No se pudo actualizar: Paciente no encontrado');
    return updated;
};

/**
 * Realiza una eliminación lógica de un paciente.
 * @param id ID del paciente.
 */
export const deletePatient = async (id: string) => {
    const deleted = await PatientModel.delete(id);
    if (!deleted) throw new Error('No se pudo eliminar: Paciente no encontrado');
    return deleted;
};

/**
 * Obtiene datos consolidados del paciente y su historial para reportes.
 * @param id ID del paciente.
 */
export const getPatientDataForReport = async (id: string) => {
    const patient = await PatientModel.findById(id);
    if (!patient) return null;

    const history = await PatientModel.findReportData(id);

    return {
        patient,
        history,
    };
};

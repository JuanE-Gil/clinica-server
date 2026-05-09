/* eslint-disable preserve-caught-error */
import { PatientModel, type IPatient } from '../models/patient.model.js';

// 1. Obtener todos los pacientes
export const getAllPatients = async () => {
    return await PatientModel.findAll();
};

// 2. Obtener paciente por ID
export const getPatientById = async (id: string) => {
    const patient = await PatientModel.findById(id);
    if (!patient) throw new Error('Paciente no encontrado');
    return patient;
};

// 3. Obtener el historial clínico (JSON para la web)
export const getPatientHistory = async (id: string) => {
    // Verificamos primero si el paciente existe
    const patient = await PatientModel.findById(id);
    if (!patient) throw new Error('No se puede obtener el historial: Paciente no encontrado');

    return await PatientModel.findHistory(id);
};

// 4. Crear nuevo paciente
export const createPatient = async (data: IPatient) => {
    try {
        return await PatientModel.create(data);
    } catch (err: any) {
        // Manejo del error de DNI duplicado de Postgres (23505)
        if (err.code === '23505') {
            throw new Error('El DNI ya se encuentra registrado en el sistema.');
        }
        throw err;
    }
};

// 5. Actualizar paciente
export const updatePatient = async (id: string, data: Partial<IPatient>) => {
    const updated = await PatientModel.update(id, data);
    if (!updated) throw new Error('No se pudo actualizar: Paciente no encontrado');
    return updated;
};

// 6. Eliminar paciente
export const deletePatient = async (id: string) => {
    const deleted = await PatientModel.delete(id);
    if (!deleted) throw new Error('No se pudo eliminar: Paciente no encontrado');
    return deleted;
};

// 7. Preparar datos para el reporte PDF
export const getPatientDataForReport = async (id: string) => {
    const patient = await PatientModel.findById(id);
    if (!patient) return null;

    const history = await PatientModel.findReportData(id);

    return {
        patient,
        history,
    };
};

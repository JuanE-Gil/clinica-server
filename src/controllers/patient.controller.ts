/**
 * Controlador para la gestión de pacientes y sus reportes clínicos.
 */
/* eslint-disable no-unused-vars */

import type { Request, Response, NextFunction } from 'express';
import * as patientService from '../services/patient.service.js';
import { generateClinicalReportPdf } from '../utils/pdf/index.js';
import { NotFoundError, ValidationError } from '../utils/errors/AppError.js';

/**
 * Obtiene la lista completa de pacientes activos.
 * @param _req Objeto de petición (no utilizado).
 * @param res Objeto de respuesta.
 */
export const getAllPatients = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const patients = await patientService.getAllPatients();
        res.json({
            status: 'success',
            data: patients
        });
    } catch (err: any) {
        next(err);
    }
};

/**
 * Busca un paciente por su ID único.
 * @param req Objeto de petición que contiene el ID.
 * @param res Objeto de respuesta.
 */
export const getPatientById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError('El ID es obligatorio', [], 'MISSING_ID');
        }

        const patient = await patientService.getPatientById(id as string);
        if (!patient) {
            throw new NotFoundError('Paciente no encontrado', 'PATIENT_NOT_FOUND');
        }

        res.json({
            status: 'success',
            data: patient
        });
    } catch (err: any) {
        next(err);
    }
};

/**
 * Obtiene el historial clínico de un paciente en formato JSON.
 * @param req Objeto de petición que contiene el ID del paciente.
 * @param res Objeto de respuesta.
 */
export const getPatientHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError('El ID es obligatorio', [], 'MISSING_ID');
        }

        const history = await patientService.getPatientHistory(id as string);
        res.json({
            status: 'success',
            data: history
        });
    } catch (err: any) {
        next(err);
    }
};

/**
 * Registra un nuevo paciente en el sistema.
 * @param req Objeto de petición que contiene los datos del paciente.
 * @param res Objeto de respuesta.
 */
export const createNewPatient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const createdPatient = await patientService.createPatient(req.body);
        res.status(201).json({
            status: 'success',
            data: createdPatient
        });
    } catch (err: any) {
        next(err);
    }
};

/**
 * Actualiza la información de un paciente existente.
 * @param req Objeto de petición que contiene el ID y los datos a actualizar.
 * @param res Objeto de respuesta.
 */
export const updatePatientById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError('El ID es obligatorio', [], 'MISSING_ID');
        }

        const updatedPatient = await patientService.updatePatient(id as string, req.body);
        res.json({
            status: 'success',
            data: updatedPatient
        });
    } catch (err: any) {
        next(err);
    }
};

/**
 * Realiza una eliminación lógica del paciente.
 * @param req Objeto de petición que contiene el ID del paciente.
 * @param res Objeto de respuesta.
 */
export const deletePatientById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError('El ID es obligatorio', [], 'MISSING_ID');
        }

        const deletedPatient = await patientService.deletePatient(id as string);
        res.json({
            status: 'success',
            message: 'Paciente eliminado correctamente',
            data: deletedPatient
        });
    } catch (err: any) {
        next(err);
    }
};

/**
 * Genera y descarga el reporte clínico detallado de un paciente en formato PDF.
 * @param req Objeto de petición que contiene el ID del paciente.
 * @param res Objeto de respuesta.
 */
export const getPatientClinicalReport = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
        return next(new ValidationError('El ID es obligatorio', [], 'MISSING_ID'));
    }

    try {
        const data = await patientService.getPatientDataForReport(id as string);

        if (!data) {
            throw new NotFoundError('Paciente no encontrado', 'PATIENT_NOT_FOUND');
        }

        const buffer = await generateClinicalReportPdf(data.patient, data.history);

        if (!buffer || buffer.length === 0) {
            throw new Error('El buffer del PDF está vacío');
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Reporte_${data.patient.dni}.pdf"`);
        res.setHeader('Content-Length', buffer.length.toString());
        
        return res.end(buffer);
    } catch (err: any) {
        console.error('❌ Error en controlador de reporte clínico:', err.message);
        next(err);
    }
};

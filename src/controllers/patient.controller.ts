/**
 * Controlador para la gestión de pacientes y sus reportes clínicos.
 */
/* eslint-disable no-unused-vars */

import type { Request, Response } from 'express';
import * as patientService from '../services/patient.service.js';
import { generateClinicalReportPdf } from '../utils/pdf.generator.js';

/**
 * Obtiene la lista completa de pacientes activos.
 * @param _req Objeto de petición (no utilizado).
 * @param res Objeto de respuesta.
 */
export const getAllPatients = async (_req: Request, res: Response) => {
    try {
        const patients = await patientService.getAllPatients();
        res.json(patients);
    } catch (err: any) {
        res.status(500).json({ error: 'Error al obtener los pacientes' });
    }
};

/**
 * Busca un paciente por su ID único.
 * @param req Objeto de petición que contiene el ID.
 * @param res Objeto de respuesta.
 */
export const getPatientById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'El ID es obligatorio' });
        }

        const patient = await patientService.getPatientById(id as string);
        res.json(patient);
    } catch (err: any) {
        res.status(404).json({ error: err.message });
    }
};

/**
 * Obtiene el historial clínico de un paciente en formato JSON.
 * @param req Objeto de petición que contiene el ID del paciente.
 * @param res Objeto de respuesta.
 */
export const getPatientHistory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'El ID es obligatorio' });
        }

        const history = await patientService.getPatientHistory(id as string);
        res.json(history);
    } catch (err: any) {
        res.status(404).json({ error: err.message });
    }
};

/**
 * Registra un nuevo paciente en el sistema.
 * @param req Objeto de petición que contiene los datos del paciente.
 * @param res Objeto de respuesta.
 */
export const createNewPatient = async (req: Request, res: Response) => {
    try {
        const createdPatient = await patientService.createPatient(req.body);
        res.status(201).json(createdPatient);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Actualiza la información de un paciente existente.
 * @param req Objeto de petición que contiene el ID y los datos a actualizar.
 * @param res Objeto de respuesta.
 */
export const updatePatientById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'El ID es obligatorio' });
        }

        const updatedPatient = await patientService.updatePatient(id as string, req.body);
        res.json(updatedPatient);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

/**
 * Realiza una eliminación lógica del paciente.
 * @param req Objeto de petición que contiene el ID del paciente.
 * @param res Objeto de respuesta.
 */
export const deletePatientById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'El ID es obligatorio' });
        }

        const deletedPatient = await patientService.deletePatient(id as string);
        res.json({ message: 'Paciente eliminado correctamente', patient: deletedPatient });
    } catch (err: any) {
        res.status(404).json({ error: err.message });
    }
};

/**
 * Genera y descarga el reporte clínico detallado de un paciente en formato PDF.
 * @param req Objeto de petición que contiene el ID del paciente.
 * @param res Objeto de respuesta.
 */
export const getPatientClinicalReport = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'El ID es obligatorio' });
    }

    try {
        const data = await patientService.getPatientDataForReport(id as string);

        if (!data) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        const buffer = await generateClinicalReportPdf(data.patient, data.history);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Reporte_${data.patient.dni}.pdf`);
        res.send(buffer);
    } catch (err: any) {
        console.error('❌ Error en controlador de reporte clínico:', err.message);
        res.status(500).json({ error: 'No se pudo generar el reporte clínico del paciente.' });
    }
};

/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import type { Request, Response } from 'express';
import * as patientService from '../services/patient.service.js';
import { generateClinicalReportPdf } from '../utils/pdf.generator.js';

// 1. Obtener todos los pacientes
export const getAllPatients = async (_req: Request, res: Response) => {
    try {
        const patients = await patientService.getAllPatients();
        res.json(patients);
    } catch (err: any) {
        res.status(500).json({ error: 'Error al obtener los pacientes' });
    }
};

// 2. Obtener un paciente por ID
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

// 3. Obtener el historial clínico (JSON)
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

// 4. Crear nuevo paciente
export const createNewPatient = async (req: Request, res: Response) => {
    try {
        const createdPatient = await patientService.createPatient(req.body);
        res.status(201).json(createdPatient);
    } catch (err: any) {
        // Aquí capturamos el error de "DNI ya registrado" que viene del Service
        res.status(400).json({ error: err.message });
    }
};

// 5. Actualizar paciente
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

// 6. Eliminar paciente
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

// 7. Generar Reporte Clínico en PDF
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

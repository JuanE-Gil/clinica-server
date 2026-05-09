/* eslint-disable max-len */
import type { Request, Response } from 'express';
import { generateClinicalReportPdf } from '../utils/pdf.generator.js';

import * as patientService from '../services/patient.service.js';

export const getAllPatients = async (_req: Request, res: Response) => {
    const allPatients = await patientService.getAllPatients(_req, res);
    res.json(allPatients);
};

export const getPatientById = async (req: Request, res: Response) => {
    const patientById = await patientService.getPatientById(req, res);
    res.json(patientById);
};

export const getPatientHistory = async (req: Request, res: Response) => {
    const patientHistory = await patientService.getPatientHistory(req, res);
    res.json(patientHistory);
};

export const createNewPatient = async (req: Request, res: Response) => {
    const createdPatient = await patientService.createPatient(req, res);
    res.json(createdPatient);
};

export const updatePatientById = async (req: Request, res: Response) => {
    const updatedPatient = await patientService.updatePatient(req, res);
    res.json(updatedPatient);
};

export const deletePatientById = async (req: Request, res: Response) => {
    const deletedPatient = await patientService.deletePatient(req, res);
    res.json(deletedPatient);
};

export const getPatientClinicalReport = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (typeof id !== 'string') {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        const data = await patientService.getPatientDataForReport(id);

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

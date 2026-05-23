import { printer, colors } from '../config.js';
import { headerTemplate, footerTemplate, commonStyles } from '../templates/modular.template.js';

export const generateClinicalReportPdf = async (patient: any, history: any[]): Promise<Buffer> => {
    const dateStr = new Date().toLocaleDateString();
    const timeStr = new Date().toLocaleTimeString();

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 80, 40, 60],
        header: (currentPage: number, pageCount: number) => headerTemplate(currentPage, pageCount, 'Reporte Clínico'),
        footer: () => footerTemplate(dateStr, timeStr),
        content: [
            { text: 'HISTORIAL CLÍNICO DEL PACIENTE', style: 'mainTitle' },
            {
                style: 'infoSection',
                table: {
                    widths: ['*'],
                    body: [
                        [
                            {
                                stack: [
                                    { text: 'INFORMACIÓN DEL PACIENTE', style: 'sectionTitle' },
                                    {
                                        columns: [
                                            {
                                                stack: [
                                                    {
                                                        text: [{ text: 'Nombre: ', bold: true }, patient.full_name || 'N/A'],
                                                        style: 'tableCell',
                                                    },
                                                    {
                                                        text: [{ text: 'DNI: ', bold: true }, patient.dni || 'N/A'],
                                                        style: 'tableCell',
                                                    },
                                                ],
                                            },
                                            {
                                                stack: [
                                                    {
                                                        text: [{ text: 'Teléfono: ', bold: true }, patient.phone || 'N/A'],
                                                        style: 'tableCell',
                                                    },
                                                    {
                                                        text: [
                                                            { text: 'Dirección: ', bold: true },
                                                            patient.address || 'N/A',
                                                        ],
                                                        style: 'tableCell',
                                                    },
                                                    {
                                                        text: [
                                                            { text: 'Fecha Nac.: ', bold: true },
                                                            patient.birth_date
                                                                ? new Date(patient.birth_date).toLocaleDateString()
                                                                : 'N/A',
                                                        ],
                                                        style: 'tableCell',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                                border: [true, true, true, true],
                                fillColor: colors.background,
                                padding: [12, 12, 12, 12],
                            },
                        ],
                    ],
                },
            },
            { text: 'HISTORIAL DE ATENCIONES', style: 'sectionTitle', margin: [0, 25, 0, 10] },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', '*', 'auto', 'auto'],
                    body: [
                        [
                            { text: 'Fecha', style: 'tableHeader' },
                            { text: 'Tratamiento / Descripción', style: 'tableHeader' },
                            { text: 'Personal', style: 'tableHeader' },
                            { text: 'Total', style: 'tableHeader' },
                        ],
                        ...(history || []).map((item) => [
                            {
                                text: item.administered_at ? new Date(item.administered_at).toLocaleDateString() : 'N/A',
                                style: 'tableCell',
                            },
                            { text: item.tratamiento || item.description || 'Sin descripción', style: 'tableCell' },
                            { text: item.enfermera || 'N/A', style: 'tableCell' },
                            {
                                text: `S/. ${Number(item.total ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
                                style: 'tableCell',
                                alignment: 'right',
                            },
                        ]),
                    ],
                },
                layout: 'lightHorizontalLines',
            },
        ],
        styles: {
            ...commonStyles,
            infoSection: {
                margin: [0, 10, 0, 20],
            },
        },
        defaultStyle: {
            font: 'Roboto',
        },
    };

    try {
        console.log('📄 Generando PDF Clínico con pdfmake printer...');
        const buffer = await printer.createPdf(docDefinition).getBuffer();
        console.log(`✅ PDF Clínico generado: ${buffer.length} bytes`);
        return buffer;
    } catch (err) {
        console.error('❌ Error fatal generando PDF Clínico:', err);
        throw err;
    }
};

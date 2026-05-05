/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
// src/utils/pdf.generator.ts
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfmake = require('pdfmake');

// eslint-disable-next-line no-unused-vars
pdfmake.setUrlAccessPolicy((url: string) => false);

const fontsDir = path.join(process.cwd(), 'fonts');
pdfmake.addFonts({
    Roboto: {
        normal: path.join(fontsDir, 'Roboto-Regular.ttf'),
        bold: path.join(fontsDir, 'Roboto-Medium.ttf'),
        italics: path.join(fontsDir, 'Roboto-Italic.ttf'),
        bolditalics: path.join(fontsDir, 'Roboto-MediumItalic.ttf'),
    },
});


export const generateClinicalReportPdf = async (patient: any, history: any[]): Promise<Buffer> => {
    const totalAcumulado = history.reduce((acc, curr) => acc + Number(curr.total), 0);
    const fechaGeneracion = new Date().toLocaleDateString();
    const horaGeneracion = new Date().toLocaleTimeString();
    const totalAtenciones = history.length;

    const docDefinition = {
        pageSize: 'A4',
        // Izquierda, Arriba (más espacio para el header), Derecha, Abajo
        pageMargins: [50, 80, 50, 70],

        // --- ENCABEZADO REPETITIVO EN TODAS LAS PÁGINAS ---
        header: function (currentPage: number, pageCount: number) {
            return {
                margin: [50, 30, 50, 0],
                columns: [
                    { text: 'SAID.SALUD', style: 'headerLogo' },
                    {
                        text: `Reporte Clínico - Pág. ${currentPage} de ${pageCount}`,
                        alignment: 'right',
                        style: 'headerMeta',
                    },
                ],
            };
        },

        // --- PIE DE PÁGINA REPETITIVO ---
        footer: function () {
            return {
                margin: [50, 20, 50, 0],
                columns: [
                    {
                        text: 'Documento generado automáticamente por el sistema SAID.SALUD.\nEste reporte es solamente para uso interno.',
                        style: 'footerText',
                    },
                    {
                        text: `Impreso el: ${fechaGeneracion} a las ${horaGeneracion}`,
                        alignment: 'right',
                        style: 'footerText',
                    },
                ],
            };
        },

        content: [
            // Línea divisoria superior
            {
                canvas: [{ type: 'line', x1: 0, y1: 0, x2: 495, y2: 0, lineWidth: 2, lineColor: '#2563eb' }],
                margin: [0, 0, 0, 20],
            },

            {
                text: 'REPORTE CLÍNICO Y DE FACTURACIÓN',
                style: 'mainTitle',
                alignment: 'center',
                margin: [0, 0, 0, 20],
            },

            // --- CAJA DE INFORMACIÓN DEL PACIENTE ---
            {
                style: 'patientCard',
                table: {
                    widths: ['50%', '50%'],
                    body: [
                        [
                            {
                                text: [{ text: 'Paciente: ', bold: true, color: '#1f2937' }, patient.full_name],
                                border: [false, false, false, false],
                            },
                            {
                                text: [{ text: 'DNI: ', bold: true, color: '#1f2937' }, patient.dni],
                                alignment: 'right',
                                border: [false, false, false, false],
                            },
                        ],
                        [
                            // Añadimos Dirección y Número de atenciones
                            {
                                text: [
                                    { text: 'Dirección: ', bold: true, color: '#1f2937' },
                                    patient.address || 'No registrada',
                                ],
                                border: [false, false, false, false],
                                margin: [0, 8, 0, 0],
                            },
                            {
                                text: [{ text: 'Total Sesiones: ', bold: true, color: '#1f2937' }, `${totalAtenciones}`],
                                alignment: 'right',
                                border: [false, false, false, false],
                                margin: [0, 8, 0, 0],
                            },
                        ],
                    ],
                },
                layout: 'noBorders',
            },

            // --- TABLA DE HISTORIAL ---
            {
                margin: [0, 20, 0, 0],
                table: {
                    headerRows: 1,
                    // Ajustamos las columnas para incluir a la Enfermera
                    widths: ['auto', 'auto', 'auto', '*', 'auto'],
                    body: [
                        // Fila de encabezados
                        [
                            { text: 'FECHA', style: 'tableHeader', alignment: 'center' },
                            { text: 'ENFERMERA', style: 'tableHeader' },
                            { text: 'TRATAMIENTO', style: 'tableHeader' },
                            { text: 'INSUMOS UTILIZADOS', style: 'tableHeader' },
                            { text: 'COSTO S/.', style: 'tableHeader', alignment: 'right' },
                        ],
                        // Filas dinámicas de datos
                        ...history.map((h) => [
                            {
                                text: new Date(h.administered_at).toLocaleDateString(),
                                style: 'tableCell',
                                alignment: 'center',
                            },
                            { text: h.enfermera || 'Asignada', style: 'tableCell', color: '#475569' }, // Nueva columna
                            { text: h.tratamiento, style: 'tableCell', bold: true },
                            {
                                // Usamos un salto de línea con viñetas en lugar de comas para los insumos
                                text:
                                    Array.isArray(h.materiales) && h.materiales.length > 0
                                        ? '• ' + h.materiales.join('\n• ')
                                        : 'Ninguno',
                                style: 'tableCell',
                                color: '#6b7280',
                            },
                            {
                                text: Number(h.total).toFixed(2),
                                style: 'tableCell',
                                alignment: 'right',
                                bold: true,
                                color: '#0f172a',
                            },
                        ]),
                    ],
                },
                layout: {
                    fillColor: function (rowIndex: number) {
                        if (rowIndex === 0) return '#2563eb';
                        return rowIndex % 2 === 0 ? '#f8fafc' : null;
                    },
                    hLineWidth: function (i: number, node: any) {
                        return i === 0 || i === node.table.body.length ? 0 : 1;
                    },
                    vLineWidth: function () {
                        return 0;
                    },
                    hLineColor: function () {
                        return '#e2e8f0';
                    },
                    paddingTop: function () {
                        return 10;
                    },
                    paddingBottom: function () {
                        return 10;
                    },
                    paddingLeft: function (i: number) {
                        return i === 0 ? 0 : 8;
                    },
                    paddingRight: function (i: number, node: any) {
                        return i === node.table.widths.length - 1 ? 0 : 8;
                    },
                },
            },

            // --- GRAN TOTAL EN CAJA RESALTADA ---
            {
                margin: [0, 30, 0, 0],
                layout: 'noBorders',
                table: {
                    widths: ['*', 'auto'],
                    body: [
                        [
                            '', // Empujamos la caja hacia la derecha
                            {
                                fillColor: '#eff6ff', // Fondo azul clarito
                                padding: 15,
                                text: [
                                    { text: 'TOTAL A FACTURAR:\n', color: '#3b82f6', bold: true, fontSize: 10 },
                                    {
                                        text: `S/. ${totalAcumulado.toFixed(2)}`,
                                        fontSize: 22,
                                        bold: true,
                                        color: '#1e3a8a',
                                    },
                                ],
                                alignment: 'right',
                            },
                        ],
                    ],
                },
            },
        ],

        // --- CATÁLOGO DE ESTILOS ---
        styles: {
            headerLogo: { fontSize: 18, bold: true, color: '#2563eb' },
            headerMeta: { fontSize: 9, color: '#94a3b8', margin: [0, 6, 0, 0] },
            footerText: { fontSize: 8, color: '#94a3b8' },
            mainTitle: { fontSize: 16, bold: true, color: '#0f172a' },
            patientCard: { fillColor: '#f1f5f9', padding: 15 },
            tableHeader: { bold: true, fontSize: 10, color: '#ffffff' },
            tableCell: { fontSize: 9, margin: [0, 3, 0, 3] },
        },
        defaultStyle: { font: 'Roboto', color: '#333333' },
    };

    // 3. Generamos y retornamos el Buffer
    const pdfDocGenerator = pdfmake.createPdf(docDefinition);
    return await pdfDocGenerator.getBuffer();
};

export const generateInventoryReportPdf = async (products: any[]): Promise<Buffer> => {
    const fechaGeneracion = new Date().toLocaleDateString();
    const horaGeneracion = new Date().toLocaleTimeString();
    
    // 1. Cálculos de Valorización (Costo vs Venta)
    const valorTotalCosto = products.reduce((acc, p) => acc + (Number(p.price_cost || 0) * Number(p.amount || 0)), 0);
    const valorTotalVenta = products.reduce((acc, p) => acc + (Number(p.price_sale || 0) * Number(p.amount || 0)), 0);
    const margenEstimado = valorTotalVenta - valorTotalCosto;

    const docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'landscape', // Cambiamos a horizontal para que quepan todas las columnas cómodamente
        pageMargins: [40, 70, 40, 60],

        header: (currentPage: number, pageCount: number) => ({
            margin: [40, 25, 40, 0],
            columns: [
                { text: 'SAID.SALUD - SISTEMA DE INVENTARIO', style: 'headerLogo' },
                { text: `Pág. ${currentPage} de ${pageCount}`, alignment: 'right', style: 'headerMeta' }
            ]
        }),

        content: [
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 760, y2: 0, lineWidth: 2, lineColor: '#10b981' }], margin: [0, 0, 0, 15] },
            
            { text: 'VALORIZACIÓN INTEGRAL DE EXISTENCIAS', style: 'mainTitle', alignment: 'center' },
            { text: `Reporte generado el ${fechaGeneracion} a las ${horaGeneracion}`, alignment: 'center', style: 'dateText', margin: [0, 0, 0, 20] },

            // --- TABLA DE INVENTARIO ---
            {
                table: {
                    headerRows: 1,
                    // N°, Producto, Cant, Costo Unit, P. Venta, Total Costo
                    widths: [25, '*', 60, 80, 80, 90], 
                    body: [
                        [
                            { text: 'N°', style: 'tableHeader', alignment: 'center' },
                            { text: 'PRODUCTO / INSUMO', style: 'tableHeader' },
                            { text: 'CANT.', style: 'tableHeader', alignment: 'center' },
                            { text: 'COSTO U.', style: 'tableHeader', alignment: 'right' },
                            { text: 'P. VENTA', style: 'tableHeader', alignment: 'right' },
                            { text: 'SUBTOTAL (C)', style: 'tableHeader', alignment: 'right' },
                        ],
                        ...products.map((p, index) => [
                            { text: index + 1, style: 'tableCell', alignment: 'center' },
                            { text: p.name, style: 'tableCell', bold: true },
                            { 
                                text: p.amount, 
                                style: 'tableCell', 
                                alignment: 'center',
                                color: p.amount < 10 ? '#ef4444' : '#333333',
                                bold: p.amount < 10 
                            },
                            { text: `S/. ${Number(p.price_cost || 0).toFixed(2)}`, style: 'tableCell', alignment: 'right' },
                            { text: `S/. ${Number(p.price_sale || 0).toFixed(2)}`, style: 'tableCell', alignment: 'right', color: '#2563eb' },
                            { text: `S/. ${(Number(p.price_sale || 0) * Number(p.amount || 0)).toFixed(2)}`, style: 'tableCell', alignment: 'right', bold: true }
                        ]),
                    ],
                },
                layout: {
                    fillColor: (rowIndex: number) => rowIndex === 0 ? '#10b981' : (rowIndex % 2 === 0 ? '#f0fdf4' : null),
                    hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 0 : 0.5,
                    vLineWidth: () => 0,
                    hLineColor: () => '#cbd5e1',
                    paddingTop: () => 8,
                    paddingBottom: () => 8
                }
            },

            // --- RESUMEN FINANCIERO AL FINAL ---
            {
                margin: [0, 30, 0, 0],
                columns: [
                    { text: '', width: '*' }, // Espaciador
                    {
                        width: 250,
                        table: {
                            widths: ['*', 'auto'],
                            body: [
                                [
                                    { text: 'VALOR TOTAL (COSTO):', style: 'summaryLabel' },
                                    { text: `S/. ${valorTotalCosto.toFixed(2)}`, style: 'summaryValue' }
                                ],
                                [
                                    { text: 'VALOR TOTAL (VENTA):', style: 'summaryLabel' },
                                    { text: `S/. ${valorTotalVenta.toFixed(2)}`, style: 'summaryValue', color: '#2563eb' }
                                ],
                                [
                                    { text: 'MARGEN ESTIMADO:', style: 'summaryLabel', border: [false, true, false, false] },
                                    { text: `S/. ${margenEstimado.toFixed(2)}`, style: 'summaryValue', color: '#059669', border: [false, true, false, false] }
                                ]
                            ]
                        },
                        layout: 'noBorders'
                    }
                ]
            }
        ],
        styles: {
            headerLogo: { fontSize: 14, bold: true, color: '#10b981' },
            headerMeta: { fontSize: 9, color: '#94a3b8' },
            mainTitle: { fontSize: 18, bold: true, color: '#0f172a' },
            dateText: { fontSize: 10, color: '#64748b' },
            tableHeader: { bold: true, fontSize: 9, color: '#ffffff', margin: [0, 2, 0, 2] },
            tableCell: { fontSize: 9 },
            summaryLabel: { fontSize: 10, bold: true, color: '#64748b', margin: [0, 5, 0, 5] },
            summaryValue: { fontSize: 12, bold: true, alignment: 'right', margin: [0, 5, 0, 5] }
        },
        defaultStyle: { font: 'Roboto' }
    };

    const { createRequire } = await import('module');
    const localRequire = createRequire(import.meta.url);
    const pdfmake = localRequire('pdfmake');
    return await pdfmake.createPdf(docDefinition).getBuffer();
};

export const generateManagementReportPdf = async (stats: any): Promise<Buffer> => {
    const fecha = new Date().toLocaleDateString();

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        content: [
            { text: 'SAID.SALUD', style: 'brand' },
            { text: 'REPORTE DE GESTIÓN MENSUAL', style: 'mainTitle', alignment: 'center' },
            { text: `Fecha de emisión: ${fecha}`, alignment: 'right', style: 'dateText' },

            {
                canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#e2e8f0' }],
                margin: [0, 10, 0, 20],
            },

            // --- SECCIÓN 1: RESUMEN EJECUTIVO (KPIs) ---
            { text: '1. RESUMEN EJECUTIVO', style: 'sectionTitle' },
            {
                columns: [
                    {
                        stack: [
                            { text: 'Ingresos del Mes', style: 'kpiLabel' },
                            { text: `S/. ${Number(stats.kpis.revenue_month).toFixed(2)}`, style: 'kpiValue' },
                        ],
                    },
                    {
                        stack: [
                            { text: 'Pacientes Atendidos', style: 'kpiLabel' },
                            { text: `${stats.kpis.total_patients}`, style: 'kpiValue' },
                        ],
                    },
                    {
                        stack: [
                            { text: 'Alertas de Inventario', style: 'kpiLabel' },
                            {
                                text: `${stats.kpis.low_stock_count}`,
                                style: 'kpiValue',
                                color: stats.kpis.low_stock_count > 0 ? '#ef4444' : '#10b981',
                            },
                        ],
                    },
                ],
                margin: [0, 10, 0, 20],
            },

            // --- SECCIÓN 2: TRATAMIENTOS TOP ---
            { text: '2. SERVICIOS MÁS SOLICITADOS', style: 'sectionTitle' },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto'],
                    body: [
                        [
                            { text: 'Tratamiento', style: 'tableHeader' },
                            { text: 'Cantidad', style: 'tableHeader', alignment: 'center' },
                        ],
                        ...stats.treatments.map((t: any) => [t.name, { text: t.count, alignment: 'center' }]),
                    ],
                },
                layout: 'lightHorizontalLines',
                margin: [0, 10, 0, 20],
            },

            // --- SECCIÓN 3: ALERTAS CRÍTICAS ---
            { text: '3. ALERTAS DE INVENTARIO (CRÍTICO)', style: 'sectionTitle', color: '#ef4444' },
            stats.stockAlerts.length > 0
                ? {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto'],
                        body: [
                            [
                                { text: 'Producto', style: 'tableHeader' },
                                { text: 'Stock Actual', style: 'tableHeader', alignment: 'center' },
                            ],
                            ...stats.stockAlerts.map((s: any) => [
                                s.name,
                                { text: s.amount, color: '#ef4444', bold: true, alignment: 'center' },
                            ]),
                        ],
                    },
                    layout: 'lightHorizontalLines',
                }
                : { text: 'No se registran productos con stock crítico.', italics: true, color: '#6b7280' },
        ],
        styles: {
            brand: { fontSize: 14, bold: true, color: '#2563eb' },
            mainTitle: { fontSize: 20, bold: true, margin: [0, 10, 0, 5] },
            dateText: { fontSize: 9, color: '#64748b' },
            sectionTitle: { fontSize: 12, bold: true, color: '#1e293b', margin: [0, 15, 0, 5] },
            kpiLabel: { fontSize: 10, color: '#64748b', bold: true },
            kpiValue: { fontSize: 18, bold: true, color: '#0f172a' },
            tableHeader: { bold: true, fontSize: 11, color: '#2563eb' },
        },
        defaultStyle: { font: 'Roboto' },
    };

    const { createRequire } = await import('module');
    const localRequire = createRequire(import.meta.url);
    const pdfmake = localRequire('pdfmake');
    return await pdfmake.createPdf(docDefinition).getBuffer();
};

import { printer } from '../config.js';
import { headerTemplate, footerTemplate, commonStyles } from '../templates/modular.template.js';

export const generateInventoryReportPdf = async (products: any[]): Promise<Buffer> => {
    const dateStr = new Date().toLocaleDateString();
    const timeStr = new Date().toLocaleTimeString();

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 80, 40, 60],
        header: (currentPage: number, pageCount: number) => headerTemplate(currentPage, pageCount, 'Reporte de Inventario'),
        footer: () => footerTemplate(dateStr, timeStr),
        content: [
            { text: 'ESTADO ACTUAL DEL INVENTARIO', style: 'mainTitle' },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            { text: 'Producto', style: 'tableHeader' },
                            { text: 'Stock', style: 'tableHeader' },
                            { text: 'P. Costo', style: 'tableHeader' },
                            { text: 'P. Venta', style: 'tableHeader' },
                        ],
                        ...products.map((p) => [
                            { text: p.name || 'Sin nombre', style: 'tableCell' },
                            {
                                text: (p.amount ?? p.stock ?? 0).toString(),
                                style: 'tableCell',
                                alignment: 'center',
                                color: (p.amount ?? p.stock ?? 0) <= (p.min_stock ?? 0) ? '#EF4444' : '#1F2937',
                                bold: (p.amount ?? p.stock ?? 0) <= (p.min_stock ?? 0),
                            },
                            {
                                // eslint-disable-next-line max-len
                                text: `S/. ${Number(p.price_cost ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
                                style: 'tableCell',
                                alignment: 'right',
                            },
                            {
                                // eslint-disable-next-line max-len
                                text: `S/. ${Number(p.price_sale ?? p.price ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
                                style: 'tableCell',
                                alignment: 'right',
                            },
                        ]),
                    ],
                },
                layout: 'lightHorizontalLines',
            },
        ],
        styles: commonStyles,
        defaultStyle: {
            font: 'Roboto',
        },
    };

    try {
        console.log('📄 Generando PDF de Inventario con pdfmake printer...');
        const buffer = await printer.createPdf(docDefinition).getBuffer();
        console.log(`✅ PDF de Inventario generado: ${buffer.length} bytes`);
        return buffer;
    } catch (err) {
        console.error('❌ Error fatal generando PDF de Inventario:', err);
        throw err;
    }
};

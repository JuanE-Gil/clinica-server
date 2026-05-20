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
                            { text: 'P. Venta', style: 'tableHeader' }
                        ],
                        ...products.map(p => [
                            { text: p.name || 'Sin nombre', style: 'tableCell' },
                            { 
                                text: (p.amount ?? p.stock ?? 0).toString(), 
                                style: 'tableCell', 
                                alignment: 'center',
                                color: (p.amount ?? p.stock ?? 0) <= (p.min_stock ?? 0) ? '#EF4444' : '#1F2937',
                                bold: (p.amount ?? p.stock ?? 0) <= (p.min_stock ?? 0)
                            },
                            { text: `S/. ${Number(p.price_cost ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, style: 'tableCell', alignment: 'right' },
                            { text: `S/. ${Number(p.price_sale ?? p.price ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, style: 'tableCell', alignment: 'right' }
                        ])
                    ]
                },
                layout: 'lightHorizontalLines'
            }
        ],
        styles: commonStyles,
        defaultStyle: {
            font: 'Roboto'
        }
    };

    return new Promise((resolve, reject) => {
        try {
            console.log('📄 Generando PDF de Inventario con pdfmake printer...');
            
            // createPdfKitDocument puede ser asíncrono si hay URLs o imágenes
            const pdfDocPromise = printer.createPdfKitDocument(docDefinition);
            
            Promise.resolve(pdfDocPromise).then((pdfDoc) => {
                const chunks: any[] = [];
                
                // @ts-ignore
                pdfDoc.on('data', (chunk: any) => chunks.push(chunk));
                // @ts-ignore
                pdfDoc.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    console.log(`✅ PDF de Inventario generado: ${buffer.length} bytes`);
                    resolve(buffer);
                });
                // @ts-ignore
                pdfDoc.on('error', (err: any) => {
                    console.error('❌ Error en stream de PDF de Inventario:', err);
                    reject(err);
                });
                pdfDoc.end();
            }).catch(reject);
        } catch (err) {
            console.error('❌ Error fatal generando PDF de Inventario:', err);
            reject(err);
        }
    });
};

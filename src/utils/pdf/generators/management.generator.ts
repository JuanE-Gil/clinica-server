import { printer, colors } from '../config.js';
import { headerTemplate, footerTemplate, commonStyles } from '../templates/modular.template.js';

export const generateManagementReportPdf = async (stats: any): Promise<Buffer> => {
    const dateStr = new Date().toLocaleDateString('es-ES');
    const timeStr = new Date().toLocaleTimeString('es-ES');

    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [40, 80, 40, 60],
        header: (currentPage: number, pageCount: number) => headerTemplate(currentPage, pageCount, 'Reporte de Gestión'),
        footer: () => footerTemplate(dateStr, timeStr),
        content: [
            { text: 'RESUMEN EJECUTIVO DE GESTIÓN', style: 'mainTitle' },

            { text: 'Métricas Principales', style: 'sectionTitle' },
            {
                columns: [
                    {
                        stack: [
                            { text: 'TOTAL INGRESOS (MES)', style: 'statLabel' },
                            {
                                text: `S/. ${Number(stats.revenue_month || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
                                style: 'statValue',
                            },
                        ],
                        alignment: 'center',
                    },
                    {
                        stack: [
                            { text: 'PACIENTES TOTALES', style: 'statLabel' },
                            { text: String(stats.total_patients || 0), style: 'statValue' },
                        ],
                        alignment: 'center',
                    },
                    {
                        stack: [
                            { text: 'ATENCIONES HOY', style: 'statLabel' },
                            { text: String(stats.todayAttentions || 0), style: 'statValue' },
                        ],
                        alignment: 'center',
                    },
                ],
                margin: [0, 10, 0, 20],
            },

            {
                columns: [
                    {
                        width: '50%',
                        stack: [
                            { text: 'Tratamientos Populares', style: 'sectionTitle' },
                            stats.treatments && Array.isArray(stats.treatments) && stats.treatments.length > 0
                                ? {
                                      table: {
                                          headerRows: 1,
                                          widths: ['*', 'auto'],
                                          body: [
                                              [
                                                  { text: 'Tratamiento', style: 'tableHeader' },
                                                  { text: 'Cant.', style: 'tableHeader' },
                                              ],
                                              ...stats.treatments.map((t: any) => [
                                                  { text: String(t?.name || 'N/A'), style: 'tableCell' },
                                                  { text: String(t?.count || 0), style: 'tableCell', alignment: 'center' },
                                              ]),
                                          ],
                                      },
                                      layout: 'lightHorizontalLines',
                                  }
                                : { text: 'No hay datos.', italics: true, fontSize: 10 },
                        ],
                    },
                    {
                        width: '50%',
                        margin: [10, 0, 0, 0],
                        stack: [
                            { text: 'Alertas de Stock', style: 'sectionTitle' },
                            stats.stockAlerts && Array.isArray(stats.stockAlerts) && stats.stockAlerts.length > 0
                                ? {
                                      table: {
                                          headerRows: 1,
                                          widths: ['*', 'auto'],
                                          body: [
                                              [
                                                  { text: 'Producto', style: 'tableHeader' },
                                                  { text: 'Stock', style: 'tableHeader' },
                                              ],
                                              ...stats.stockAlerts.map((s: any) => [
                                                  { text: String(s?.name || 'N/A'), style: 'tableCell' },
                                                  {
                                                      text: String(s?.amount || 0),
                                                      style: 'tableCell',
                                                      alignment: 'center',
                                                      color: '#EF4444',
                                                      bold: true,
                                                  },
                                              ]),
                                          ],
                                      },
                                      layout: 'lightHorizontalLines',
                                  }
                                : {
                                      text: 'Stock óptimo en todos los productos.',
                                      italics: true,
                                      fontSize: 10,
                                      color: '#059669',
                                  },
                        ],
                    },
                ],
                margin: [0, 0, 0, 20],
            },

            { text: 'Ingresos vs Costos (Últimos meses)', style: 'sectionTitle' },
            stats.revenueData && Array.isArray(stats.revenueData) && stats.revenueData.length > 0
                ? {
                      table: {
                          headerRows: 1,
                          widths: ['*', 'auto', 'auto', 'auto'],
                          body: [
                              [
                                  { text: 'Mes', style: 'tableHeader' },
                                  { text: 'Ingresos', style: 'tableHeader' },
                                  { text: 'Costos', style: 'tableHeader' },
                                  { text: 'Utilidad', style: 'tableHeader' },
                              ],
                              ...stats.revenueData.map((r: any) => {
                                  const income = Number(r.income || 0);
                                  const cost = Number(r.cost || 0);
                                  const profit = income - cost;
                                  return [
                                      { text: String(r.month || 'N/A'), style: 'tableCell' },
                                      {
                                          text: `S/. ${income.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
                                          style: 'tableCell',
                                          alignment: 'right',
                                      },
                                      {
                                          text: `S/. ${cost.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
                                          style: 'tableCell',
                                          alignment: 'right',
                                      },
                                      {
                                          text: `S/. ${profit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
                                          style: 'tableCell',
                                          alignment: 'right',
                                          color: profit >= 0 ? '#059669' : '#EF4444',
                                          bold: true,
                                      },
                                  ];
                              }),
                          ],
                      },
                      layout: 'lightHorizontalLines',
                      margin: [0, 0, 0, 20],
                  }
                : { text: 'No hay datos históricos disponibles.', italics: true, fontSize: 10, margin: [0, 0, 0, 20] },

            { text: 'Actividad Reciente', style: 'sectionTitle' },
            stats.recentActivity && Array.isArray(stats.recentActivity) && stats.recentActivity.length > 0
                ? {
                      table: {
                          headerRows: 1,
                          widths: ['auto', '*', '*', 'auto'],
                          body: [
                              [
                                  { text: 'Fecha', style: 'tableHeader' },
                                  { text: 'Tratamiento', style: 'tableHeader' },
                                  { text: 'Enfermera', style: 'tableHeader' },
                                  { text: 'Total', style: 'tableHeader' },
                              ],
                              ...stats.recentActivity.map((a: any) => [
                                  {
                                      text: a.date ? new Date(a.date).toLocaleDateString('es-ES') : 'N/A',
                                      style: 'tableCell',
                                  },
                                  { text: String(a.treatment_name || 'N/A'), style: 'tableCell' },
                                  { text: String(a.nurse_name || 'N/A'), style: 'tableCell' },
                                  {
                                      text: `S/. ${Number(a.total_session || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
                                      style: 'tableCell',
                                      alignment: 'right',
                                  },
                              ]),
                          ],
                      },
                      layout: 'lightHorizontalLines',
                  }
                : { text: 'No hay actividad reciente registrada.', italics: true, fontSize: 10 },
        ],
        styles: {
            ...commonStyles,
        },
        defaultStyle: {
            font: 'Roboto',
        },
    };

    try {
        console.log('📄 Generando PDF de Gestión con pdfmake printer...');
        const buffer = await printer.createPdf(docDefinition).getBuffer();
        console.log(`✅ PDF de Gestión generado: ${buffer.length} bytes`);
        return buffer;
    } catch (err) {
        console.error('❌ Error fatal generando PDF de Gestión:', err);
        throw err;
    }
};

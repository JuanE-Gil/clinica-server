import { colors, clinicName } from '../config.js';

export const headerTemplate = (currentPage: number, pageCount: number, title: string) => {
    return {
        margin: [40, 30, 40, 10],
        stack: [
            {
                columns: [
                    {
                        text: clinicName,
                        style: 'headerLogo',
                        width: '*'
                    },
                    {
                        stack: [
                            { text: title, style: 'headerTitle' },
                            { text: `Página ${currentPage} de ${pageCount}`, style: 'headerPage' }
                        ],
                        width: 'auto',
                        alignment: 'right'
                    }
                ]
            },
            {
                margin: [0, 5, 0, 0],
                canvas: [
                    {
                        type: 'line',
                        x1: 0, y1: 0,
                        x2: 515, y2: 0,
                        lineWidth: 2,
                        lineColor: colors.primary
                    }
                ]
            }
        ]
    };
};

export const footerTemplate = (dateStr: string, timeStr: string) => {
    return {
        margin: [40, 10, 40, 20],
        stack: [
            {
                canvas: [
                    {
                        type: 'line',
                        x1: 0, y1: 0,
                        x2: 515, y2: 0,
                        lineWidth: 1,
                        lineColor: colors.primary
                    }
                ]
            },
            {
                margin: [0, 10, 0, 0],
                columns: [
                    {
                        text: 'Este documento es propiedad de SAID.SALUD y su uso es estrictamente profesional y confidencial.',
                        style: 'footerText',
                        width: '*'
                    },
                    {
                        text: `Generado el ${dateStr} a las ${timeStr}`,
                        style: 'footerText',
                        width: 'auto',
                        alignment: 'right'
                    }
                ]
            }
        ]
    };
};

export const commonStyles = {
    headerLogo: {
        fontSize: 22,
        bold: true,
        color: colors.primary,
        letterSpacing: 2
    },
    headerTitle: {
        fontSize: 10,
        bold: true,
        color: colors.primary,
        textTransform: 'uppercase'
    },
    headerPage: {
        fontSize: 8,
        color: colors.lightText
    },
    footerText: {
        fontSize: 8,
        color: colors.lightText,
        italics: true
    },
    mainTitle: {
        fontSize: 18,
        bold: true,
        color: colors.primary,
        margin: [0, 10, 0, 15],
        alignment: 'center'
    },
    sectionTitle: {
        fontSize: 12,
        bold: true,
        color: colors.primary,
        margin: [0, 15, 0, 8],
        background: colors.background,
        padding: [5, 5]
    },
    tableHeader: {
        bold: true,
        fontSize: 10,
        color: colors.white,
        fillColor: colors.primary,
        alignment: 'center',
        margin: [0, 6, 0, 6]
    },
    statLabel: {
        fontSize: 9,
        bold: true,
        color: colors.secondary,
        textTransform: 'uppercase'
    },
    statValue: {
        fontSize: 18,
        bold: true,
        color: colors.primary
    },
    tableCell: {
        fontSize: 9,
        color: colors.text,
        margin: [0, 4, 0, 4]
    }
};

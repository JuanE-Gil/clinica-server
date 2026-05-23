import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfMake = require('pdfmake');

// Configuración de fuentes
const fontsDir = path.resolve(process.cwd(), 'fonts');

pdfMake.addFonts({
    Roboto: {
        normal: path.join(fontsDir, 'Roboto-Regular.ttf'),
        bold: path.join(fontsDir, 'Roboto-Medium.ttf'),
        italics: path.join(fontsDir, 'Roboto-Italic.ttf'),
        bolditalics: path.join(fontsDir, 'Roboto-MediumItalic.ttf'),
    },
});

// Bloquear acceso a URLs externas (recomendado en servidor)
pdfMake.setUrlAccessPolicy(() => false);

export { pdfMake as printer };

// Paleta de colores profesional
export const colors = {
    primary: '#1066B2', // Azul corporativo profundo
    secondary: '#26C1C1', // Turquesa (acento energético)
    accent: '#058BE9', // Azul brillante (para elementos de atención)
    background: '#F0F9FF', // Celeste muy suave (para fondos de sección)
    text: '#1F2937', // Gris carbón (mejor contraste que negro puro)
    lightText: '#6B7280', // Gris medio para metadatos
    white: '#FFFFFF',
    border: '#D1D5DB', // Gris suave para bordes
};

export const clinicName = 'SAID.SALUD';

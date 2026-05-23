// Importamos todo el módulo para luego acceder a su contenido
import * as PdfMake from 'pdfmake';

export default function createPrinter(fontDescriptors: any) {
    // pdfmake a menudo expone el constructor como propiedad '.default' o directamente en la exportación
    // dependiendo de cómo se resuelva el módulo en tiempo de ejecución.
    const PrinterConstructor = (PdfMake as any).default || PdfMake;

    const printer = new PrinterConstructor(fontDescriptors);

    // Polyfill de urlResolver para evitar errores en entornos sin navegador
    (printer as any).urlResolver = {
        resolve: () => {},
        resolved: () => Promise.resolve(),
    };

    return printer;
}

const PdfPrinter = require('pdfmake/src/printer');

module.exports = function createPrinter(fontDescriptors) {
    const PrinterConstructor = PdfPrinter.default || PdfPrinter;
    const printer = new PrinterConstructor(fontDescriptors);
    
    // Polyfill urlResolver de forma síncrona para que no devuelva promesas si no es necesario
    printer.urlResolver = {
        resolve: () => {},
        resolved: () => Promise.resolve()
    };
    
    return printer;
};

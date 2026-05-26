const { PDFDocument, rgb } = require('pdf-lib');

const highlightPDFDoc = async (pdfBuffer, highlights) => {
    try {
        // load the PDF
        const pdfDoc = await PDFDocument.load(pdfBuffer);

        // get all pages
        const pages = pdfDoc.getPages();

        // test
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        firstPage.drawRectangle({
            x: 50,
            y: height-100,
            width: 200,
            height: 15,
            color: rgb(1, 0.8, 0),
            opacity: 0.3
        })

        const highlightedPDFBytes = await pdfDoc.save();
        return Buffer.from(highlightedPDFBytes);

    } catch (err) {
        throw new Error('PDF highlighting failed: '+ err.message);
    }
}

module.exports = { highlightPDFDoc };
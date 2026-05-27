const { PDFDocument, rgb } = require('pdf-lib');

// disable worker on backend side
// pdfjs.GlobalWorkerOptions.workerSrc = ''; didnt work

// use fake worker for Node.js backend environment
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
pdfjsLib.GlobalWorkerOptions.workerSrc = false;

// helper function to find position of the texts 
const findTextPositions = async (pdfData, searchText) => {
    try {

        const page = await pdfData.getPage(1);
        const textContent = await page.getTextContent();

        const items = textContent.items;

        const positions = [];

        const targetWords = searchText
            .toLowerCase()
            .split(" ")
            .filter(word => word.length > 3);

        for (const item of items) {

            if (!item.str) continue;

            const chunk = item.str.toLowerCase().trim();

            if (chunk.length < 4) continue;

            // exact-ish meaningful word matching
            const matchedWords = targetWords.filter(word =>
                chunk.includes(word) || word.includes(chunk)
            );

            // require strong match
            if (matchedWords.length > 0) {

                positions.push({
                    x: item.transform[4],
                    y: item.transform[5],
                    width: item.width,
                    height: item.height || 10
                });
            }
        }

        return positions;

    } catch (err) {
        console.log(err);
        return [];
    }
};

const highlightPDFDoc = async (pdfBuffer, highlights) => {
    try {

        
        // load PDF with pdf-lib for drawing
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const pages = pdfDoc.getPages();

        const firstPage = pages[0];
const { width, height } = firstPage.getSize();
console.log('PAGE SIZE:', width, height);

        // load pdf with pdfjs for finding text positions
        const uint8Array = new Uint8Array(pdfBuffer);
        const pdfData = await pdfjsLib.getDocument({ data: uint8Array }).promise;

        // color map
        const colorMap = {
            yellow: rgb(1, 0.92, 0.23),
            blue: rgb(0.4, 0.7, 1),
            green: rgb(0.2, 0.9, 0.4)
        };

        // loop through highlights
        for (const highlight of highlights) {
            const positions = await findTextPositions(pdfData, highlight.text);

            console.log(`\nHighlight: "${highlight.text.substring(0, 30)}..."`);
            console.log(`Found ${positions.length} positions:`);
            positions.forEach(p => console.log(`  x:${p.x.toFixed(1)} y:${p.y.toFixed(1)} w:${p.width.toFixed(1)} h:${p.height.toFixed(1)}`));
            
            for (const position of positions) {
                const page = pages[0];
                const { height } = page.getSize();

                page.drawRectangle({
                    x: position.x - 1,
                    y: position.y,
                    width: position.width + 2|| 200,
                    height: position.height * 0.9,
                    color: colorMap[highlight.color] || colorMap.yellow,
                    opacity: 0.5,
                })
            }
        }

        const highlightedPdfBytes = await pdfDoc.save();
        return Buffer.from(highlightedPdfBytes);

        

    } catch (err) {
        throw new Error('PDF highlighting failed: '+ err.message);
    }
}

module.exports = { highlightPDFDoc };
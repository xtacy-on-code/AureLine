const { PDFDocument, rgb } = require('pdf-lib');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

pdfjsLib.GlobalWorkerOptions.workerSrc = false;

// COLORS
const colorMap = {
    yellow: rgb(1, 0.92, 0.23),
    blue: rgb(0.4, 0.7, 1),
    green: rgb(0.2, 0.9, 0.4)
};

// FIND TEXT POSITIONS
const findTextPositions = async (pdfData, searchText) => {

    try {

        const positions = [];

        const targetWords = searchText
            .toLowerCase()
            .split(" ")
            .filter(word => word.length > 3);

        // LOOP THROUGH ALL PAGES
        for (let pageNum = 1; pageNum <= pdfData.numPages; pageNum++) {

            const page = await pdfData.getPage(pageNum);

            const textContent = await page.getTextContent();

            const items = textContent.items;

            for (const item of items) {

                if (!item.str) continue;

                const chunk = item.str
                    .toLowerCase()
                    .trim();

                if (chunk.length < 4) continue;

                const matchedWords = targetWords.filter(word =>
                    chunk.includes(word) ||
                    word.includes(chunk)
                );

                if (matchedWords.length > 0) {

                    positions.push({
                        pageNum,
                        x: item.transform[4],
                        y: item.transform[5],
                        width: item.width,
                        height: item.height || 10
                    });
                }
            }
        }

        return positions;

    } catch (err) {

        console.log(err);

        return [];
    }
};

// MERGE NEARBY RECTANGLES
const mergePositions = (positions) => {

    positions.sort((a, b) => {

        if (a.pageNum !== b.pageNum) {
            return a.pageNum - b.pageNum;
        }

        return a.x - b.x;
    });

    const merged = [];

    for (const pos of positions) {

        const last = merged[merged.length - 1];

        if (
            last &&
            last.pageNum === pos.pageNum &&
            Math.abs(last.y - pos.y) < 5 &&
            pos.x <= last.x + last.width + 12
        ) {

            last.width =
                (pos.x + pos.width) - last.x;

        } else {

            merged.push({ ...pos });
        }
    }

    return merged;
};

// MAIN FUNCTION
const highlightPDFDoc = async (pdfBuffer, highlights) => {

    try {

        const pdfDoc = await PDFDocument.load(pdfBuffer);

        const pages = pdfDoc.getPages();

        const uint8Array = new Uint8Array(pdfBuffer);

        const pdfData =
            await pdfjsLib
                .getDocument({ data: uint8Array })
                .promise;

        const seen = new Set();

        for (const highlight of highlights) {

            const positions =
                await findTextPositions(
                    pdfData,
                    highlight.text
                );

            const mergedPositions =
                mergePositions(positions);

            for (const position of mergedPositions) {

                const key =
                    `${position.pageNum}-${position.x}-${position.y}`;

                if (seen.has(key)) continue;

                seen.add(key);

                const page =
                    pages[position.pageNum - 1];

                page.drawRectangle({

                    x: position.x - 1,

                    y: position.y - 2,

                    width:
                        Math.max(
                            position.width + 2,
                            12
                        ),

                    height:
                        position.height * 0.8,

                    color:
                        colorMap[highlight.color] ||
                        colorMap.yellow,

                    opacity: 0.32,

                    borderWidth: 0,
                });
            }
        }

        const highlightedPdfBytes =
            await pdfDoc.save();

        return Buffer.from(highlightedPdfBytes);

    } catch (err) {

        throw new Error(
            'PDF highlighting failed: ' +
            err.message
        );
    }
};

module.exports = { highlightPDFDoc };
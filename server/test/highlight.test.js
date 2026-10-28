const test = require('node:test');
const assert = require('node:assert');
const { PDFDocument, PDFPage, StandardFonts } = require('pdf-lib');
const { readPdf, extractText, highlightPDFDoc } = require('../src/controllers/pdfController');

// build a PDF where each inner array is a page and each string is one line
const makePdf = async (pagesOfLines) => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);

    for (const lines of pagesOfLines) {
        const page = doc.addPage();
        lines.forEach((line, i) => page.drawText(line, { x: 50, y: 780 - i * 20, size: 11, font }));
    }

    return Buffer.from(await doc.save());
};

// run highlighting and record every rectangle drawn
const highlight = async (pdf, highlights) => {
    const rects = [];
    const original = PDFPage.prototype.drawRectangle;
    PDFPage.prototype.drawRectangle = function (options) {
        rects.push(options);
        return original.call(this, options);
    };

    try {
        const pages = await readPdf(pdf);
        const result = await highlightPDFDoc(pdf, pages, highlights);
        return { ...result, rects };
    } finally {
        PDFPage.prototype.drawRectangle = original;
    }
};

const LINES = [
    'Photosynthesis',
    'Photosynthesis is the process by which plants convert light energy into chemical energy.',
    'Chlorophyll is the green pigment that absorbs light in the chloroplasts.',
    'The light reactions produce ATP and NADPH.',
    'The Calvin cycle uses ATP and NADPH to fix carbon dioxide into glucose.',
];

test('highlights only the requested line, not lines that share words', async () => {
    const pdf = await makePdf([LINES]);
    const { rects, highlights } = await highlight(pdf, [
        { text: 'The light reactions produce ATP and NADPH.', color: 'blue' },
    ]);

    assert.strictEqual(rects.length, 1);
    assert.strictEqual(highlights[0].page, 1);
});

test('rectangle covers only the matched part of a line', async () => {
    const pdf = await makePdf([LINES]);
    const full = await highlight(pdf, [{ text: LINES[2], color: 'yellow' }]);
    const part = await highlight(pdf, [{ text: 'green pigment', color: 'yellow' }]);

    assert.strictEqual(part.rects.length, 1);
    assert.ok(part.rects[0].width < full.rects[0].width / 3);
    assert.ok(part.rects[0].x > full.rects[0].x);
});

test('matches a phrase that wraps onto the next line', async () => {
    const pdf = await makePdf([['Mitochondria are often called the', 'powerhouse of the cell because they make ATP.']]);
    const { rects } = await highlight(pdf, [
        { text: 'called the powerhouse of the cell', color: 'green' },
    ]);

    assert.strictEqual(rects.length, 2);
});

test('joins words hyphenated across a line break', async () => {
    const pdf = await makePdf([['Enzymes speed up bio-', 'chemical reactions in living cells.']]);
    const { highlights } = await highlight(pdf, [
        { text: 'speed up biochemical reactions', color: 'blue' },
    ]);

    assert.strictEqual(highlights[0].page, 1);
});

test('ignores punctuation and case differences from the AI', async () => {
    const pdf = await makePdf([LINES]);
    const { rects } = await highlight(pdf, [
        { text: 'the calvin cycle uses ATP & NADPH, to fix carbon dioxide', color: 'green' },
    ]);

    assert.strictEqual(rects.length, 1);
});

test('falls back to the leading words when the AI paraphrases the ending', async () => {
    const pdf = await makePdf([LINES]);
    const { rects, highlights } = await highlight(pdf, [
        { text: 'Chlorophyll is the green pigment that captures sunlight', color: 'yellow' },
    ]);

    assert.strictEqual(rects.length, 1);
    assert.strictEqual(highlights[0].page, 1);
});

test('marks highlights that are not in the PDF instead of drawing anything', async () => {
    const pdf = await makePdf([LINES]);
    const { rects, highlights } = await highlight(pdf, [
        { text: 'Quantum chromodynamics describes the strong force', color: 'blue' },
    ]);

    assert.strictEqual(rects.length, 0);
    assert.strictEqual(highlights[0].page, null);
});

test('finds the right page in a long document and draws one mark per highlight', async () => {
    const pages = Array.from({ length: 40 }, (_, p) =>
        Array.from({ length: 30 }, (_, i) => `Page ${p} line ${i}: the system processes energy data using memory blocks.`)
    );
    const pdf = await makePdf(pages);
    const wanted = Array.from({ length: 10 }, (_, i) => ({
        text: `Page ${i * 4} line 3: the system processes energy data`,
        color: 'yellow',
    }));

    const { rects, highlights } = await highlight(pdf, wanted);

    assert.strictEqual(rects.length, 10);
    assert.deepStrictEqual(highlights.map(h => h.page), wanted.map((_, i) => i * 4 + 1));
});

test('extractText returns the text of every page', async () => {
    const pdf = await makePdf([['first page text'], ['second page text']]);
    const pageTexts = extractText(await readPdf(pdf));

    assert.strictEqual(pageTexts.length, 2);
    assert.match(pageTexts[0], /first page text/);
    assert.match(pageTexts[1], /second page text/);
});

test('findPhraseInText returns offsets into the original text', () => {
    const { findPhraseInText } = require('../src/controllers/pdfController');
    const text = 'Notes:  The  Calvin cycle uses ATP and NADPH to fix carbon dioxide.\nOther stuff.';
    const found = findPhraseInText(text, 'the calvin cycle uses ATP, and NADPH');

    assert.ok(found);
    assert.strictEqual(text.slice(found.start, found.end), 'The  Calvin cycle uses ATP and NADPH');
    assert.strictEqual(findPhraseInText(text, 'mitochondria make energy for the cell'), null);
});

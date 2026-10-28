const { PDFDocument, rgb } = require('pdf-lib');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

// load the worker up front so Vercel bundles it (pdfjs otherwise requires it dynamically)
globalThis.pdfjsWorker = require('pdfjs-dist/legacy/build/pdf.worker.js');
pdfjsLib.GlobalWorkerOptions.workerSrc = false;

// COLORS
const colorMap = {
    yellow: rgb(1, 0.92, 0.23),
    blue: rgb(0.4, 0.7, 1),
    green: rgb(0.2, 0.9, 0.4)
};

// shortest phrase we will still highlight when the exact text isn't found
const MIN_FALLBACK_WORDS = 4;

// READ PDF ONCE - every page's text items, shared by text extraction and highlighting
const readPdf = async (pdfBuffer) => {
    const pdfData = await pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) }).promise;

    const pages = [];
    for (let pageNum = 1; pageNum <= pdfData.numPages; pageNum++) {
        const page = await pdfData.getPage(pageNum);
        const textContent = await page.getTextContent();
        pages.push(textContent.items.filter(item => typeof item.str === 'string'));
    }

    await pdfData.destroy();
    return pages;
};

// JOIN ITEMS - pdfjs splits text into items that may be part of a word or several
// words, so work out from the layout what goes between each item and the next:
// '' (same word), ' ', '\n', or '-' (word hyphenated across a line break)
const fontSizeOf = (item) => Math.hypot(item.transform[2], item.transform[3]) || item.height || 10;

const joinItems = (items) => {
    const segments = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.str === '') continue;

        // look past empty items, which only mark line breaks
        let lineBreak = item.hasEOL;
        let j = i + 1;
        while (j < items.length && items[j].str === '') {
            if (items[j].hasEOL) lineBreak = true;
            j++;
        }
        const next = items[j];

        let separator;
        if (!next) {
            separator = '\n';
        } else if (lineBreak || Math.abs(next.transform[5] - item.transform[5]) > fontSizeOf(item) * 0.5) {
            separator = /[\p{L}]-$/u.test(item.str) ? '-' : '\n';
        } else if (/\s$/.test(item.str) || /^\s/.test(next.str)) {
            separator = '';
        } else {
            const gap = next.transform[4] - (item.transform[4] + item.width);
            separator = gap > fontSizeOf(item) * 0.15 ? ' ' : '';
        }

        segments.push({ itemIndex: i, str: item.str, separator });
    }

    return segments;
};

// EXTRACT TEXT - same joining rules as the page index, so the AI quotes text we can find
const extractText = (pages) => {
    let text = '';
    for (const items of pages) {
        for (const { str, separator } of joinItems(items)) {
            text += separator === '-' ? str.slice(0, -1) : str + separator;
        }
        text += '\n';
    }
    return text;
};

// NORMALIZE - lowercase letters/digits separated by single spaces, so punctuation,
// quotes, ligatures and line breaks don't stop a match
const isWordChar = (ch) => /[\p{L}\p{N}]/u.test(ch);

const normalizeText = (text) => {
    return text
        .normalize('NFKC')
        .toLowerCase()
        .split('')
        .map(ch => (isWordChar(ch) ? ch : ' '))
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
};

// BUILD PAGE INDEX - normalized page text plus, for every character, which item
// and which character inside that item it came from
const buildPageIndex = (items) => {
    let text = '';
    const map = [];

    const pushSpace = () => {
        if (text.length > 0 && text[text.length - 1] !== ' ') {
            text += ' ';
            map.push(null);
        }
    };

    for (const { itemIndex, str, separator } of joinItems(items)) {
        // drop the hyphen of a word split across lines so "bio-" + "chemical" reads "biochemical"
        const end = separator === '-' ? str.length - 1 : str.length;

        // normalize per character so charIndex still points into the original item
        for (let i = 0; i < end; i++) {
            for (const ch of str[i].normalize('NFKC').toLowerCase()) {
                if (isWordChar(ch)) {
                    text += ch;
                    map.push({ itemIndex, charIndex: i });
                } else {
                    pushSpace();
                }
            }
        }

        if (separator === ' ' || separator === '\n') pushSpace();
    }

    return { text, map };
};

// FIND PHRASE - exact normalized match first, then the longest leading part of it
const findPhrase = (pageIndexes, searchText) => {
    const words = normalizeText(searchText).split(' ').filter(Boolean);
    if (words.length === 0) return null;

    for (let count = words.length; count >= Math.min(MIN_FALLBACK_WORDS, words.length); count--) {
        const needle = words.slice(0, count).join(' ');

        for (let pageNum = 0; pageNum < pageIndexes.length; pageNum++) {
            const { text } = pageIndexes[pageNum];

            // match whole words only
            let from = 0;
            while (from <= text.length) {
                const start = text.indexOf(needle, from);
                if (start === -1) break;

                const end = start + needle.length;
                const boundaryBefore = start === 0 || text[start - 1] === ' ';
                const boundaryAfter = end === text.length || text[end] === ' ';

                if (boundaryBefore && boundaryAfter) {
                    return { pageNum, start, end };
                }
                from = start + 1;
            }
        }
    }

    return null;
};

// MATCH TO RECTANGLES - one rectangle per text item the match touches, trimmed
// to the matched characters inside that item
const matchToRects = (items, map, match) => {
    const spans = new Map();

    for (let i = match.start; i < match.end; i++) {
        const entry = map[i];
        if (!entry) continue;

        const span = spans.get(entry.itemIndex);
        if (!span) {
            spans.set(entry.itemIndex, { first: entry.charIndex, last: entry.charIndex });
        } else {
            span.last = entry.charIndex;
        }
    }

    const rects = [];
    for (const [itemIndex, span] of spans) {
        const item = items[itemIndex];
        const length = item.str.length || 1;
        const fontSize = Math.hypot(item.transform[2], item.transform[3]) || item.height || 10;

        rects.push({
            x: item.transform[4] + (item.width * span.first) / length,
            y: item.transform[5],
            width: (item.width * (span.last - span.first + 1)) / length,
            height: fontSize
        });
    }

    return rects;
};

// MAIN FUNCTION - draws the highlights and returns which page each one landed on
const highlightPDFDoc = async (pdfBuffer, pages, highlights) => {

    try {
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const pdfPages = pdfDoc.getPages();
        const pageIndexes = pages.map(buildPageIndex);

        const placed = [];

        for (const highlight of highlights) {
            const match = findPhrase(pageIndexes, highlight.text);

            if (!match) {
                placed.push({ ...highlight, page: null });
                continue;
            }

            const rects = matchToRects(pages[match.pageNum], pageIndexes[match.pageNum].map, match);
            const page = pdfPages[match.pageNum];

            for (const rect of rects) {
                page.drawRectangle({
                    x: rect.x - 1,
                    y: rect.y - rect.height * 0.25,
                    width: rect.width + 2,
                    height: rect.height * 1.2,
                    color: colorMap[highlight.color] || colorMap.yellow,
                    opacity: 0.35,
                    borderWidth: 0,
                });
            }

            placed.push({ ...highlight, page: match.pageNum + 1 });
        }

        const highlightedPdfBytes = await pdfDoc.save();
        return { buffer: Buffer.from(highlightedPdfBytes), highlights: placed };

    } catch (err) {
        throw new Error('PDF highlighting failed: ' + err.message);
    }
};

module.exports = { readPdf, extractText, highlightPDFDoc, normalizeText };

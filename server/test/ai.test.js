const test = require('node:test');
const assert = require('node:assert');
const { fitText, cleanHighlights } = require('../src/controllers/aiController');

test('fitText leaves short documents untouched', () => {
    assert.strictEqual(fitText(['page one', 'page two']), 'page one\npage two');
});

test('fitText keeps text from every page of a long document', () => {
    const pages = Array.from({ length: 50 }, (_, i) => `PAGE${i} ` + 'word '.repeat(2000));
    const text = fitText(pages);

    assert.ok(text.length <= 20000 + pages.length);
    for (let i = 0; i < 50; i++) assert.match(text, new RegExp(`PAGE${i} `));
});

test('cleanHighlights drops malformed items, sets colour from type, caps at 10', () => {
    const raw = {
        highlights: [
            { text: 'A term means this', type: 'definition', color: 'green' },
            { text: '   ', type: 'definition' },
            { text: 'No type' },
            { text: 'Unknown type', type: 'fun_fact' },
            ...Array.from({ length: 12 }, (_, i) => ({ text: `Point ${i}`, type: 'important_point' })),
        ],
    };
    const result = cleanHighlights(raw);

    assert.strictEqual(result.length, 10);
    assert.deepStrictEqual(result[0], { text: 'A term means this', type: 'definition', color: 'yellow' });
    assert.ok(result.slice(1).every(h => h.color === 'green'));
});

test('cleanHighlights handles a missing list', () => {
    assert.deepStrictEqual(cleanHighlights({}), []);
    assert.deepStrictEqual(cleanHighlights(null), []);
});

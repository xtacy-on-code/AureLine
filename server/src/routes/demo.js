const router = require('express').Router();
const { rateLimit } = require('express-rate-limit');
const { highlightPDF } = require('../controllers/aiController');
const { findPhraseInText } = require('../controllers/pdfController');

const MIN_CHARS = 80;
const MAX_CHARS = 2500;

// anyone can call this, so keep it tight: per visitor, and a daily ceiling
// for the whole demo so it can't drain the Groq quota
const perVisitor = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: "That's the demo limit for now. Sign up free to highlight whole PDFs." }
});

const perDay = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    limit: 300,
    keyGenerator: () => 'all-visitors',
    standardHeaders: false,
    legacyHeaders: false,
    message: { error: 'The demo is resting for today. Sign up free to highlight your own PDFs.' }
});

// POST /api/demo/highlight { text } -> highlights with their position in the text
router.post('/highlight', perVisitor, perDay, async (req, res) => {
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';

    if (text.length < MIN_CHARS) {
        return res.status(400).json({ error: `Paste a bit more text, at least ${MIN_CHARS} characters.` });
    }
    if (text.length > MAX_CHARS) {
        return res.status(400).json({ error: `The demo takes up to ${MAX_CHARS} characters. Sign up to highlight whole PDFs.` });
    }

    try {
        // a short paragraph reads best with only a few marks
        const { highlights } = await highlightPDF([text], { maxHighlights: 4 });

        // keep only highlights we can place, in reading order, without overlaps
        const placed = highlights
            .map(h => ({ ...h, ...findPhraseInText(text, h.text) }))
            .filter(h => Number.isInteger(h.start))
            .sort((a, b) => a.start - b.start)
            .filter((h, i, list) => i === 0 || h.start >= list[i - 1].end);

        res.json({ text, highlights: placed });
    } catch (err) {
        console.log('DEMO ERROR:', err);
        if (err.status === 429) {
            return res.status(429).json({ error: err.message });
        }
        res.status(500).json({ error: 'The demo hit a snag. Please try again.' });
    }
});

module.exports = router;

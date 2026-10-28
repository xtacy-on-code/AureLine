const router = require('express').Router();
const multer = require('multer');
const { put } = require('@vercel/blob');
const { highlightPDF } = require('../controllers/aiController');
const Document = require('../models/Document');
const Highlight = require('../models/Highlight');
const authMiddleware = require('../middleware/auth');
const { readPdf, extractText, highlightPDFDoc } = require('../controllers/pdfController');

const storage = multer.memoryStorage();

// check if PDF, Vercel rejects bodies over ~4.5MB before they get here anyway
const upload = multer ({
    storage: storage,
    limits: { fileSize: 4.5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
})

// accept the upload, turning multer errors into a clean 400
const acceptPdf = (req, res, next) => {
    upload.single('pdf')(req, res, (err) => {
        if (err) {
            const message = err.code === 'LIMIT_FILE_SIZE' ? 'PDF is too large. Please upload a file under 4 MB.' : err.message;
            return res.status(400).json({ error: message });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Please choose a PDF to upload' });
        }
        // the browser-reported type can lie, check the file really is a PDF
        if (req.file.buffer.subarray(0, 5).toString('latin1') !== '%PDF-') {
            return res.status(400).json({ error: 'That file is not a valid PDF' });
        }
        next();
    });
};

// POST route to handle PDF upload and processing
router.post('/upload', authMiddleware, acceptPdf, async (req, res) => {
    const pdfDocument = new Document({
        userId: req.user.userId,
        filename: req.file.originalname
    });

    try {
        await pdfDocument.save();

        // read every page once, reused for the AI text and for drawing highlights
        const pages = await readPdf(req.file.buffer);
        const highlights = await highlightPDF(extractText(pages));

        // draw highlights on the PDF
        const { buffer: highlightedPdfBuffer, highlights: placedHighlights } =
            await highlightPDFDoc(req.file.buffer, pages, highlights.highlights);

        // keep the highlighted PDF so the document can be reopened later
        const pdfPath = `pdfs/${req.user.userId}/${pdfDocument._id}.pdf`;
        await put(pdfPath, highlightedPdfBuffer, {
            access: 'private',
            contentType: 'application/pdf',
            addRandomSuffix: false
        });

        await Highlight.create({
            userId: req.user.userId,
            documentId: pdfDocument._id,
            highlights: placedHighlights
        });

        pdfDocument.pdfPath = pdfPath;
        pdfDocument.pageCount = pages.length;
        pdfDocument.highlightCount = placedHighlights.length;
        pdfDocument.status = 'completed';
        await pdfDocument.save();

        res.json({
            message: 'PDF processed successfully',
            documentId: pdfDocument._id
        });

    } catch (err) {
        console.log('FULL ERROR:', err);
        await Document.updateOne({ _id: pdfDocument._id }, { status: 'failed' }).catch(() => {});

        if (err.status === 429) {
            return res.status(429).json({ error: err.message });
        }
        res.status(500).json({ error: 'PDF process failed. Please try another file.' });
    }
});

module.exports = router;

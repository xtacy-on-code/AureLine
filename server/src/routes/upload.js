const router = require('express').Router();
const multer = require('multer');
const { highlightPDF} = require('../controllers/aiController');
const Document = require('../models/Document');
const Highlight = require('../models/Highlight');
const authMiddleware = require('../middleware/auth');
const { readPdf, extractText, highlightPDFDoc } = require('../controllers/pdfController');

const storage = multer.memoryStorage();

// check if PDF 
const upload = multer ({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
})

// POST route to handle PDF upload and processing
router.post('/upload', authMiddleware, upload.single('pdf'), async (req, res) => {
    try {
        // read every page once, reused for the AI text and for drawing highlights
        const pages = await readPdf(req.file.buffer);
        const highlights = await highlightPDF(extractText(pages));

        // draw highlights on the PDF
        const { buffer: highlightedPdfBuffer, highlights: placedHighlights } =
            await highlightPDFDoc(req.file.buffer, pages, highlights.highlights);

        // convert to base64 so we can send it to frontend
        const highlightedPdfBase64 = highlightedPdfBuffer.toString('base64');
        
        // temp userid for now 
        const pdfDocument = new Document({
            userId: req.user.userId,
            filename: req.file.originalname,
            cloudinaryUrl: 'placeholder'
        });
        await pdfDocument.save();

        const highlightDoc = new Highlight({
            userId: req.user.userId,
            documentId: pdfDocument._id,
            highlights: placedHighlights
        });
        await highlightDoc.save();

        res.json({
            message: 'PDF processed successfully',
            documentID: pdfDocument._id, 
            highlights: highlightDoc.highlights,
            highlightedPDF: highlightedPdfBase64
        });

    } catch (err) {
        console.log('FULL ERROR:', err);
        if (err.status === 429) {
            return res.status(429).json({ error: err.message });
        }
        res.status(500).json({ error: 'PDF process failed. Please try another file.' });
    }
});

router.get('/history', authMiddleware, async (req, res) => {
    try {
        const Docs = await Document.find({ userId: req.user.userId });
        res.json({ documents: Docs });
        

    } catch (err) {
        res.status(500).json({error: 'Failed to fetch history', details: err.message});
    }
});



module.exports = router;
const router = require('express').Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { highlightPDF} = require('../controllers/aiController');
const Document = require('../models/Document');
const Highlight = require('../models/Highlight');

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
router.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        const data = await pdfParse(req.file.buffer);
        const highlights = await highlightPDF(data.text);
        
        // temp userid for now 
        const pdfDocument = new Document({
            userId: '507f1f77bcf86cd799439011', 
            filename: req.file.originalname,
            cloudinaryUrl: 'placeholder'
        });
        await pdfDocument.save();

        const highlightDoc = new Highlight({
            userId: '507f1f77bcf86cd799439011',
            documentId: pdfDocument._id,
            highlights: highlights.highlights
        });
        await highlightDoc.save();

        res.json({
            message: 'PDF processed successfully',
            documentID: pdfDocument._id, 
            highlights: highlightDoc.highlights
        });

    } catch (err) {
        res.status(500).json({error: 'PDF process failed', details: err.message});
    }
});

module.exports = router;
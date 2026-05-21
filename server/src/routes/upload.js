const router = require('express').Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');

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
        console.log(data);

        res.json({message: 'PDF processed successfully', characters: data.text.length});
    } catch (err) {
        res.status(500).json({error: 'PDF process failed', details: err.message});
    }
});

module.exports = router;
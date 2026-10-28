const router = require('express').Router();
const mongoose = require('mongoose');
const { Readable } = require('stream');
const { get, del } = require('@vercel/blob');
const Document = require('../models/Document');
const Highlight = require('../models/Highlight');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// find a document that belongs to the logged in user, or send 404
const findOwnDocument = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(404).json({ error: 'Document not found' });
        return null;
    }

    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!doc) {
        res.status(404).json({ error: 'Document not found' });
        return null;
    }
    return doc;
};

// GET all of the user's documents, newest first
router.get('/history', async (req, res) => {
    try {
        const docs = await Document.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json({ documents: docs });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// GET one document with its highlights
router.get('/documents/:id', async (req, res) => {
    try {
        const doc = await findOwnDocument(req, res);
        if (!doc) return;

        const highlight = await Highlight.findOne({ documentId: doc._id });
        res.json({ document: doc, highlights: highlight ? highlight.highlights : [] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch document' });
    }
});

// GET the highlighted PDF, streamed from the private blob store
router.get('/documents/:id/pdf', async (req, res) => {
    try {
        const doc = await findOwnDocument(req, res);
        if (!doc) return;

        if (!doc.pdfPath) {
            return res.status(404).json({ error: 'This document has no saved PDF' });
        }

        const result = await get(doc.pdfPath, { access: 'private' });
        if (!result || !result.stream) {
            return res.status(404).json({ error: 'PDF not found' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', result.blob.size);
        res.setHeader('Cache-Control', 'private, max-age=3600');
        Readable.fromWeb(result.stream).pipe(res);
    } catch (err) {
        console.log('PDF STREAM ERROR:', err);
        if (!res.headersSent) res.status(500).json({ error: 'Failed to load PDF' });
    }
});

// DELETE a document, its highlights and its stored PDF
router.delete('/documents/:id', async (req, res) => {
    try {
        const doc = await findOwnDocument(req, res);
        if (!doc) return;

        if (doc.pdfPath) await del(doc.pdfPath);
        await Highlight.deleteMany({ documentId: doc._id });
        await doc.deleteOne();

        res.json({ message: 'Document deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete document' });
    }
});

module.exports = router;

const mongoose = require('mongoose');

// define document schema
const documentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    filename: {
        type: String,
        required: true
    },
    // pathname of the highlighted PDF in the private Vercel Blob store
    pdfPath: {
        type: String,
        default: null
    },
    pageCount: {
        type: Number,
        default: 0
    },
    highlightCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['processing', 'completed', 'failed'],
        default: 'processing'
    }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);

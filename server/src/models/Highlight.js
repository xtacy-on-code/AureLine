const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    highlights: {
        type: [{
            text: { type: String, required: true },
            type: { type: String, required: true },
            color: { type: String, required: true }
        }]
    }
}, {timestamps: true});

module.exports = mongoose.model('Highlight', highlightSchema);
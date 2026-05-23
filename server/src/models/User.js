const mongoose = require('mongoose');

// define user schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    }
}, { timestamps: true});

module.exports = mongoose.model('User', userSchema);
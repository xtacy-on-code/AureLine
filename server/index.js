const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); 

const app = express();
app.use(cors());
app.use(express.json());

// test route
app.get('/', (req, res) => {
    res.json({ message: 'AureLine API is running' });
});

// upload route
const uploadRouter = require('./src/routes/upload');
app.use('/api', uploadRouter);

// connect database
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MONGODB connected'))
    .catch(err => console.error('MONGODB error: ', err))

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});